import { useParams, useNavigate } from 'react-router-dom'
import { useGameStore } from '@/store/gameStore'
import { useI18nContext } from '@/i18n/i18n-react'
import type { TranslationFunctions } from '@/i18n/i18n-types'

const TYPE_COLOURS: Record<string, string> = {
  bad: 'text-danger',
  neutral: 'text-warning',
  good: 'text-safe',
  secret: 'text-accent',
}

function endingTypeLabel(type: string, LL: TranslationFunctions): string {
  switch (type) {
    case 'bad':
      return LL.endingTypeBad()
    case 'neutral':
      return LL.endingTypeNeutral()
    case 'good':
      return LL.endingTypeGood()
    case 'secret':
      return LL.endingTypeSecret()
    default:
      return type
  }
}

export default function EndingPage() {
  const { endingId } = useParams<{ endingId: string }>()
  const navigate = useNavigate()
  const { triggeredEnding, gameState } = useGameStore()
  const { LL } = useI18nContext()

  if (!triggeredEnding || triggeredEnding.id !== endingId) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
        <p className="font-body text-text-dim">{LL.noEndingData()}</p>
        <button onClick={() => navigate('/')} className="choice-btn max-w-xs">
          {LL.returnToTitle()}
        </button>
      </div>
    )
  }

  const colourClass = TYPE_COLOURS[triggeredEnding.type] ?? 'text-text'

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-lg w-full flex flex-col gap-8 animate-fade-in">
        {/* Ending type label */}
        <p className={`ui-label tracking-[0.25em] ${colourClass}`}>
          — {endingTypeLabel(triggeredEnding.type, LL)} —
        </p>

        {/* Ending title */}
        <h1 className="font-display text-5xl text-text leading-tight">{triggeredEnding.title}</h1>

        <hr className="border-border" />

        {/* Narrative */}
        <div className="flex flex-col gap-4">
          {triggeredEnding.narrative.map((para, i) => (
            <p
              key={i}
              className="narrative-text animate-slide-up"
              style={{ animationDelay: `${i * 100}ms`, opacity: 0, animationFillMode: 'forwards' }}
            >
              {para}
            </p>
          ))}
        </div>

        {/* Epilogue */}
        {triggeredEnding.epilogue && (
          <p className="font-body text-text-dim italic text-base border-l-2 border-border pl-4">
            {triggeredEnding.epilogue}
          </p>
        )}

        <hr className="border-border" />

        {/* Playthrough summary */}
        {gameState && (
          <div className="flex gap-6 font-ui text-xs text-text-dim">
            <span>{LL.choicesMade({ count: gameState.choiceHistory.length })}</span>
            <span>{LL.scenesVisited({ count: gameState.visitedScenes.length })}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 mt-4">
          <button
            onClick={() => navigate('/')}
            className="choice-btn text-center border-accent text-accent hover:bg-[#1e0a0a]"
          >
            {LL.playAgain()}
          </button>
          <button onClick={() => navigate('/')} className="choice-btn text-center">
            {LL.returnToTitle()}
          </button>
        </div>
      </div>
    </div>
  )
}
