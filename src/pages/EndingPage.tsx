import { useParams, useNavigate } from 'react-router-dom'
import { useGameStore } from '@/store/gameStore'

const TYPE_COLOURS: Record<string, string> = {
  bad:     'text-danger',
  neutral: 'text-warning',
  good:    'text-safe',
  secret:  'text-accent',
}

export default function EndingPage() {
  const { endingId } = useParams<{ endingId: string }>()
  const navigate = useNavigate()
  const { triggeredEnding, gameState } = useGameStore()

  // Fallback if navigated to directly without game state
  if (!triggeredEnding || triggeredEnding.id !== endingId) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
        <p className="font-body text-text-dim">No ending data found.</p>
        <button onClick={() => navigate('/')} className="choice-btn max-w-xs">
          Return to Title
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
          — {triggeredEnding.type} ending —
        </p>

        {/* Ending title */}
        <h1 className="font-display text-5xl text-text leading-tight">
          {triggeredEnding.title}
        </h1>

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
            <span>Choices made: {gameState.choiceHistory.length}</span>
            <span>Scenes visited: {gameState.visitedScenes.length}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 mt-4">
          <button
            onClick={() => navigate('/')}
            className="choice-btn text-center border-accent text-accent hover:bg-[#1e0a0a]"
          >
            Play Again
          </button>
          <button
            onClick={() => navigate('/')}
            className="choice-btn text-center"
          >
            Return to Title
          </button>
        </div>
      </div>
    </div>
  )
}
