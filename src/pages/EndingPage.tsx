import { useParams, useNavigate } from 'react-router-dom'
import { useGameStore } from '@/store/gameStore'
import { useI18n } from '@/i18n/useI18n'
import { interpolate } from '@/i18n/interpolate'
import { resolveLocaleString, resolveLocaleStrings } from '@/i18n/localeString'
import type { EndingType } from '@/engine/types'

const TYPE_COLOURS: Record<EndingType, string> = {
  bad: 'text-danger',
  neutral: 'text-warning',
  good: 'text-safe',
  secret: 'text-accent',
}

export default function EndingPage() {
  const { endingId } = useParams<{ endingId: string }>()
  const navigate = useNavigate()
  const { triggeredEnding, gameState } = useGameStore()
  const { LL, locale } = useI18n()

  if (!triggeredEnding || triggeredEnding.id !== endingId) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
        <p className="font-body text-text-dim">{LL.ending.noData()}</p>
        <button onClick={() => navigate('/')} className="choice-btn max-w-xs">
          {LL.ending.returnToTitle()}
        </button>
      </div>
    )
  }

  const colourClass = TYPE_COLOURS[triggeredEnding.type]
  const typeLabel = LL.ending.type[triggeredEnding.type]()
  const title = resolveLocaleString(triggeredEnding.title, locale)
  const paragraphs = resolveLocaleStrings(triggeredEnding.narrative, locale)
  const epilogue = triggeredEnding.epilogue
    ? resolveLocaleString(triggeredEnding.epilogue, locale)
    : null

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-lg w-full flex flex-col gap-8 animate-fade-in">
        <p className={`ui-label tracking-[0.25em] ${colourClass}`}>— {typeLabel} —</p>

        <h1 className="font-display text-5xl text-text leading-tight">{title}</h1>

        <hr className="border-border" />

        <div className="flex flex-col gap-4">
          {paragraphs.map((para, i) => (
            <p
              key={i}
              className="narrative-text animate-slide-up"
              style={{ animationDelay: `${i * 100}ms`, opacity: 0, animationFillMode: 'forwards' }}
            >
              {para}
            </p>
          ))}
        </div>

        {epilogue && (
          <p className="font-body text-text-dim italic text-base border-l-2 border-border pl-4">
            {epilogue}
          </p>
        )}

        <hr className="border-border" />

        {gameState && (
          <div className="flex gap-6 font-ui text-xs text-text-dim">
            <span>
              {interpolate(LL.ending.choicesMade, { count: gameState.choiceHistory.length })}
            </span>
            <span>
              {interpolate(LL.ending.scenesVisited, { count: gameState.visitedScenes.length })}
            </span>
          </div>
        )}

        <div className="flex flex-col gap-3 mt-4">
          <button
            onClick={() => navigate('/')}
            className="choice-btn text-center border-accent text-accent hover:bg-[#1e0a0a]"
          >
            {LL.ending.playAgain()}
          </button>
          <button onClick={() => navigate('/')} className="choice-btn text-center">
            {LL.ending.returnToTitle()}
          </button>
        </div>
      </div>
    </div>
  )
}
