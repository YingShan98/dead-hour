import { useState } from 'react'
import { useI18n } from '@/i18n/useI18n'
import { getSettings, updateSettings } from '@/engine/settingsManager'
import { isAudioEnabled, toggleAudio } from '@/engine/audioManager'
import type { FontSize } from '@/engine/settingsManager'

const FONT_SIZES: { value: FontSize; label: string }[] = [
  { value: 'small', label: 'A−' },
  { value: 'default', label: 'A' },
  { value: 'large', label: 'A+' },
]

export default function SettingsPanel() {
  const { LL } = useI18n()
  const [settings, setSettings] = useState(() => getSettings())
  const [audioOn, setAudioOn] = useState(() => isAudioEnabled())

  return (
    <div className="panel-card flex flex-col gap-3">
      <p className="ui-label text-muted text-xs">{LL.settings.label()}</p>

      <div className="flex items-center justify-between">
        <span className="font-ui text-xs text-text-dim">{LL.settings.fontSize()}</span>
        <div className="flex gap-1">
          {FONT_SIZES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setSettings(updateSettings({ fontSize: value }))}
              className={`font-ui text-xs w-7 py-0.5 rounded border transition-colors ${
                settings.fontSize === value
                  ? 'border-accent text-accent bg-[#1a0c0c]'
                  : 'border-border text-muted hover:border-text-dim hover:text-text-dim'
              }`}
              aria-pressed={settings.fontSize === value}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="font-ui text-xs text-text-dim">{LL.settings.reduceMotion()}</span>
        <button
          type="button"
          onClick={() => setSettings(updateSettings({ reducedMotion: !settings.reducedMotion }))}
          className={`font-ui text-xs px-2 py-0.5 rounded border transition-colors ${
            settings.reducedMotion
              ? 'border-accent text-accent bg-[#1a0c0c]'
              : 'border-border text-muted hover:border-text-dim hover:text-text-dim'
          }`}
          aria-pressed={settings.reducedMotion}
        >
          {settings.reducedMotion ? '✓' : '○'}
        </button>
      </div>

      <div className="flex items-center justify-between">
        <span className="font-ui text-xs text-text-dim">♪</span>
        <button
          type="button"
          onClick={() => setAudioOn(toggleAudio())}
          className={`font-ui text-xs px-2 py-0.5 rounded border transition-colors ${
            audioOn
              ? 'border-accent text-accent bg-[#1a0c0c]'
              : 'border-border text-muted hover:border-text-dim hover:text-text-dim'
          }`}
          aria-label={audioOn ? LL.settings.soundDisable() : LL.settings.soundEnable()}
          aria-pressed={audioOn}
        >
          {audioOn ? '✓' : '○'}
        </button>
      </div>
    </div>
  )
}
