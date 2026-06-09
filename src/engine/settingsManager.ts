export type FontSize = 'small' | 'default' | 'large'

export interface GameSettings {
  fontSize: FontSize
  reducedMotion: boolean
  audioEnabled: boolean
}

const KEY = 'dead-hour:settings'

const DEFAULTS: GameSettings = {
  fontSize: 'default',
  reducedMotion: false,
  audioEnabled: false,
}

export function getSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...DEFAULTS }
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<GameSettings>) }
  } catch {
    return { ...DEFAULTS }
  }
}

export function updateSettings(patch: Partial<GameSettings>): GameSettings {
  const next = { ...getSettings(), ...patch }
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // localStorage quota exceeded — settings not persisted this write
  }
  applySettings(next)
  return next
}

export function initSettings(): void {
  applySettings(getSettings())
}

function applySettings(settings: GameSettings): void {
  const html = document.documentElement
  html.setAttribute('data-font-size', settings.fontSize)
  html.setAttribute('data-reduced-motion', String(settings.reducedMotion))
}
