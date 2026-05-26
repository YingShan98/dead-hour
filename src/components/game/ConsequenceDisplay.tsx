import { useEffect, useState } from 'react'
import type { Choice } from '@/engine/types'
import { useI18n } from '@/i18n/useI18n'
import { resolveLocaleStrings } from '@/i18n/localeString'

interface Props {
  choice: Choice | null // the choice just made
  onDone: () => void // called when player taps to continue
  isLoading: boolean
}

/**
 * ConsequenceDisplay — shown immediately after a choice is selected,
 * before the next scene loads. Renders the choice's `consequence` text
 * as a full-screen overlay moment.
 *
 * If the choice has no consequence text, calls onDone immediately.
 */
export default function ConsequenceDisplay({ choice, onDone, isLoading }: Props) {
  const { locale, LL } = useI18n()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!choice) return
    if (!choice.consequence || choice.consequence.length === 0) {
      // No consequence text — skip straight through
      onDone()
      return
    }
    // Small delay so the UI doesn't flash
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [choice])

  if (!choice || !choice.consequence || choice.consequence.length === 0) return null
  if (!visible) return null

  const paragraphs = resolveLocaleStrings(choice.consequence, locale)

  return (
    <div
      className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center px-8"
      style={{ animation: 'fadeIn 0.4s ease forwards' }}
    >
      {/* Consequence text */}
      <div className="max-w-xl w-full flex flex-col gap-5">
        {paragraphs.map((para, i) => (
          <p
            key={i}
            className="narrative-text animate-slide-up"
            style={{
              animationDelay: `${i * 120}ms`,
              opacity: 0,
              animationFillMode: 'forwards',
            }}
          >
            {para}
          </p>
        ))}
      </div>

      {/* Continue prompt */}
      <button
        onClick={onDone}
        disabled={isLoading}
        className="mt-14 ui-label text-xs text-muted hover:text-text transition-colors"
        style={{
          animation: `fadeIn 0.6s ease ${paragraphs.length * 120 + 600}ms forwards`,
          opacity: 0,
          animationFillMode: 'forwards',
        }}
      >
        {isLoading ? LL.ui.loading : LL.ui.continue}
      </button>
    </div>
  )
}
