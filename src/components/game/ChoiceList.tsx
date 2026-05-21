import type { Choice, GameState } from '@/engine/types'
import { getAvailableChoices } from '@/engine/evaluator'

interface Props {
  choices: Choice[]
  gameState: GameState
  onSelect: (choiceId: string) => void
  disabled?: boolean
}

export default function ChoiceList({ choices, gameState, onSelect, disabled }: Props) {
  const available = getAvailableChoices(choices, gameState)
  const locked = choices.filter((c) => !available.find((a) => a.id === c.id))

  return (
    <div className="flex flex-col gap-2 mt-8">
      <p className="ui-label text-muted mb-2">Your move</p>

      {/* Available choices */}
      {available.map((choice, i) => (
        <button
          key={choice.id}
          onClick={() => onSelect(choice.id)}
          disabled={disabled}
          className="choice-btn animate-slide-up"
          style={{ animationDelay: `${300 + i * 80}ms`, opacity: 0, animationFillMode: 'forwards' }}
        >
          {choice.text}
        </button>
      ))}

      {/* Locked choices — shown greyed out with hint */}
      {locked.map((choice) => (
        <div
          key={choice.id}
          className="w-full px-4 py-3 rounded border border-border
                     font-body text-muted text-base bg-surface
                     cursor-not-allowed select-none"
          title={choice.hint ?? 'Requirements not met'}
        >
          <span className="opacity-40">{choice.text}</span>
          {choice.hint && (
            <span className="ml-3 ui-label text-xs text-muted opacity-60">[{choice.hint}]</span>
          )}
        </div>
      ))}
    </div>
  )
}
