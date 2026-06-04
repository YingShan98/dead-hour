import { useEffect, useState } from 'react'
import type { Choice } from '@/engine/types'
import { useI18n } from '@/i18n/useI18n'
import { resolveLocaleStrings } from '@/i18n/localeString'

interface Props {
  choice: Choice | null
  onDone: () => void
  isLoading: boolean
}

export default function ConsequenceDisplay({ choice, onDone, isLoading }: Props) {
  const { locale, LL } = useI18n()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!choice) return
    if (!choice.consequence || choice.consequence.length === 0) {
      onDone()
      return
    }
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [choice, onDone])

  if (!choice || !choice.consequence || choice.consequence.length === 0) return null
  if (!visible) return null

  const paragraphs = resolveLocaleStrings(choice.consequence, locale)
  const continueDelay = paragraphs.length * 120 + 600

  function handleContinue() {
    if (!isLoading) onDone()
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-background/97 backdrop-blur-[2px] flex flex-col items-center justify-center px-6 sm:px-10 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="consequence-heading"
      onClick={handleContinue}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleContinue()
        }
      }}
    >
      <p id="consequence-heading" className="sr-only">
        {LL.ui.continue()}
      </p>

      <div
        className="max-w-xl w-full flex flex-col gap-5 pointer-events-none"
        onClick={(e) => e.stopPropagation()}
      >
        {paragraphs.map((para, i) => (
          <p
            key={i}
            className="narrative-text animate-slide-up text-lg sm:text-xl"
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

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          handleContinue()
        }}
        disabled={isLoading}
        className="mt-14 choice-btn max-w-xs text-center ui-label tracking-widest pointer-events-auto"
        style={{
          animation: `fadeIn 0.6s ease ${continueDelay}ms forwards`,
          opacity: 0,
          animationFillMode: 'forwards',
        }}
      >
        {isLoading ? LL.ui.loading() : LL.ui.continue()}
      </button>
    </div>
  )
}
