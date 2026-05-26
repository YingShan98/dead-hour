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

  return (
    <div className="flex flex-col gap-2 mt-8">
      <p className="ui-label text-muted mb-2">{LL.game.yourMove}</p>

      {available.map((choice, i) => (
        <button
          key={choice.id}
          onClick={() => onSelect(choice.id)}
          disabled={disabled}
          className="choice-btn animate-slide-up"
          style={{ animationDelay: `${300 + i * 80}ms`, opacity: 0, animationFillMode: 'forwards' }}
        >
          {resolveLocaleString(choice.text, locale)}
        </button>
      ))}

      {locked.map((choice) => {
        const hintText = choice.hint
          ? interpolate(LL.game.requiresHint, {
              hint: resolveLocaleString(choice.hint, locale),
            })
          : undefined

        return (
          <div
            key={choice.id}
            className="w-full px-4 py-3 rounded border border-border
                       font-body text-muted text-base bg-surface
                       cursor-not-allowed select-none"
            title={hintText}
          >
            <span className="opacity-40">{resolveLocaleString(choice.text, locale)}</span>
            {hintText && (
              <span className="ml-3 ui-label text-xs text-muted opacity-60">[{hintText}]</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
