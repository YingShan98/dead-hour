import { updateSettings } from './settingsManager'

let ctx: AudioContext | null = null
let masterGain: GainNode | null = null
let lfoGainNode: GainNode | null = null
let oscNodes: OscillatorNode[] = []
let lfoOsc: OscillatorNode | null = null
let active = false

function getContext(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  return ctx
}

export function isAudioEnabled(): boolean {
  return active
}

export function toggleAudio(): boolean {
  if (active) {
    stopAmbient()
    updateSettings({ audioEnabled: false })
    return false
  } else {
    startAmbient()
    updateSettings({ audioEnabled: true })
    return true
  }
}

export function startAmbient(): void {
  if (active) return
  const actx = getContext()
  if (actx.state === 'suspended') actx.resume().catch(() => {})

  masterGain = actx.createGain()
  masterGain.gain.setValueAtTime(0, actx.currentTime)
  masterGain.gain.linearRampToValueAtTime(0.22, actx.currentTime + 2.5)
  masterGain.connect(actx.destination)

  // Layered sine voices: low drone + mid harmonics for laptop-speaker audibility
  const voices: Array<[number, number]> = [
    [55.0, 0.55], // A1 — felt on good speakers
    [55.5, 0.35], // detuned A1 — adds beating
    [110.2, 0.3], // A2 — present on laptop speakers
    [220.1, 0.12], // A3 — clearly audible on any speaker
  ]
  oscNodes = voices.map(([freq, vol]) => {
    const osc = actx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = freq

    const gain = actx.createGain()
    gain.gain.value = vol
    osc.connect(gain)
    gain.connect(masterGain!)
    osc.start()
    return osc
  })

  // Slow tremolo LFO: 0.125 Hz (8-second cycle), depth ±0.012
  lfoGainNode = actx.createGain()
  lfoGainNode.gain.value = 0.012
  lfoOsc = actx.createOscillator()
  lfoOsc.type = 'sine'
  lfoOsc.frequency.value = 0.125
  lfoOsc.connect(lfoGainNode)
  lfoGainNode.connect(masterGain.gain)
  lfoOsc.start()

  active = true
}

export function stopAmbient(): void {
  if (!active || !masterGain || !ctx) return

  // Stop LFO first so the fade-out ramp isn't fought by the tremolo
  if (lfoOsc) {
    try {
      lfoOsc.stop()
      lfoOsc.disconnect()
    } catch {
      // already stopped
    }
    lfoOsc = null
  }
  if (lfoGainNode) {
    lfoGainNode.disconnect()
    lfoGainNode = null
  }

  const now = ctx.currentTime
  masterGain.gain.cancelScheduledValues(now)
  masterGain.gain.setValueAtTime(masterGain.gain.value, now)
  masterGain.gain.linearRampToValueAtTime(0, now + 1.2)

  const master = masterGain
  const oscs = [...oscNodes]

  setTimeout(() => {
    oscs.forEach((o) => {
      try {
        o.stop()
        o.disconnect()
      } catch {
        // already stopped
      }
    })
    master.disconnect()
  }, 1300)

  masterGain = null
  oscNodes = []
  active = false
}
