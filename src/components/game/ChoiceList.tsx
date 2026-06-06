import { useEffect } from 'react'
import { getAvailableChoices } from '@/engine/evaluator'
import { useI18n } from '@/i18n/useI18n'
import { interpolate } from '@/i18n/interpolate'
import { resolveLocaleString } from '@/i18n/localeString'
import type { Choice, GameState } from '@/engine/types'

interface Props {
  choices: Choice[]
  gameState: GameState
  onSelect: (choiceId: string) => void
  disabled?: boolean
}

export default function ChoiceList({ choices, gameState, onSelect, disabled }: Props) {
  const { locale, LL } = useI18n()

  const available = getAvailableChoices(choices, gameState)
  const locked = choices.filter((c) => !available.find((a) => a.id === c.id))

  useEffect(() => {
    if (disabled || available.length === 0) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }
      const num = Number.parseInt(e.key, 10)
      if (num >= 1 && num <= available.length) {
        e.preventDefault()
        onSelect(available[num - 1].id)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [available, disabled, onSelect])

  return (
    <nav className="flex flex-col gap-2 mt-10" aria-label={LL.game.yourMove()}>
      <p className="ui-label text-muted mb-1">{LL.game.yourMove()}</p>

      {available.map((choice, i) => {
        const timeCost = choice.effects.timeCost
        return (
          <button
            key={choice.id}
            type="button"
            onClick={() => onSelect(choice.id)}
            disabled={disabled}
            className="choice-btn animate-slide-up flex items-center gap-3"
            style={{
              animationDelay: `${300 + i * 80}ms`,
              opacity: 0,
              animationFillMode: 'forwards',
            }}
            aria-keyshortcuts={`${i + 1}`}
          >
            <span className="choice-index" aria-hidden>
              {i + 1}
            </span>
            <span className="flex-1">{resolveLocaleString(choice.text, locale)}</span>
            {timeCost != null && timeCost > 0 && (
              <span className="ui-label text-xs text-muted shrink-0">⏱ {timeCost}h</span>
            )}
          </button>
        )
      })}

      {locked.map((choice) => {
        const hintText = choice.hint
          ? interpolate(LL.game.requiresHint, {
              hint: resolveLocaleString(choice.hint, locale),
            })
          : undefined

        return (
          <div
            key={choice.id}
            className="w-full px-4 py-3.5 rounded-lg border border-border/60
                       font-body text-muted text-base bg-surface/50
                       cursor-not-allowed select-none flex items-center gap-3"
            title={hintText}
            aria-disabled="true"
          >
            <span className="choice-index opacity-30" aria-hidden>
              —
            </span>
            <span className="flex-1 opacity-40">{resolveLocaleString(choice.text, locale)}</span>
            {hintText && (
              <span className="ui-label text-xs text-muted opacity-60 shrink-0">{hintText}</span>
            )}
          </div>
        )
      })}
    </nav>
  )
}
