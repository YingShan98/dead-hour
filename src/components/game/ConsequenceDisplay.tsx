import { useEffect, useState } from 'react'
import type { Choice } from '@/engine/types'
import { useI18n } from '@/i18n/useI18n'
import { resolveLocaleStrings } from '@/i18n/localeString'

const VISIBLE_STATS = ['health', 'morale', 'stealth', 'money'] as const
type VisibleStat = (typeof VISIBLE_STATS)[number]

const STAT_ICON: Record<VisibleStat, string> = {
  health: '❤',
  morale: '◈',
  stealth: '◉',
  money: '¥',
}

interface Props {
  choice: Choice | null
  onDone: () => void
  isLoading: boolean
  gameFlags?: Record<string, boolean>
}

export default function ConsequenceDisplay({ choice, onDone, isLoading, gameFlags }: Props) {
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

  const statDeltas = VISIBLE_STATS.flatMap((key) => {
    if (key === 'money' && gameFlags?.money_obsolete) return []
    const val = (choice.effects.stats as Record<string, number> | undefined)?.[key]
    if (!val) return []
    return [{ key, value: val }]
  })

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

      {statDeltas.length > 0 && (
        <div
          className="flex flex-wrap gap-2 mt-8 pointer-events-none"
          style={{
            animation: `fadeIn 0.6s ease ${continueDelay}ms forwards`,
            opacity: 0,
            animationFillMode: 'forwards',
          }}
        >
          {statDeltas.map(({ key, value }) => (
            <span
              key={key}
              className="font-ui text-xs px-2 py-1 rounded border"
              style={{
                color: value > 0 ? '#4a9a6a' : '#c43838',
                background: value > 0 ? '#0a1f12' : '#1a0808',
                borderColor: value > 0 ? '#1a3a22' : '#3a1010',
              }}
            >
              {STAT_ICON[key]} {value > 0 ? `+${value}` : value}
            </span>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          handleContinue()
        }}
        disabled={isLoading}
        className="mt-8 choice-btn max-w-xs text-center ui-label tracking-widest pointer-events-auto"
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
