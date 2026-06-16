import { useParams, useNavigate } from 'react-router-dom'
import { useGameStore } from '@/store/gameStore'
import { useI18n } from '@/i18n/useI18n'
import { interpolate } from '@/i18n/interpolate'
import { resolveLocaleString, resolveLocaleStrings } from '@/i18n/localeString'
import AmbientOverlay from '@/components/ui/AmbientOverlay'
import { DEFAULT_GAME_STATE } from '@/engine/defaults'
import type { EndingType } from '@/engine/types'
import JournalPanel from '@/components/game/JournalPanel'

const MILESTONE_FLAGS: Array<{ flag: string; zh: string; en: string }> = [
  { flag: 'pei_alive', zh: '裴嘉应生还', en: 'Pei survived' },
  { flag: 'helped_stranger', zh: '帮助了陌生人', en: 'Helped a stranger' },
  { flag: 'superpower_awakening', zh: '超能觉醒', en: 'Awakening' },
  { flag: 'zombie_turning', zh: '感染失控', en: 'Turning' },
  { flag: 'has_group', zh: '建立了团队', en: 'Built a group' },
  { flag: 'scientist_saved', zh: '救出郑博士', en: 'Saved the scientist' },
  { flag: 'wrote_journal', zh: '留下了日记', en: 'Kept a journal' },
  { flag: 'survived_first_week', zh: '存活超过一周', en: 'Survived one week' },
]

const TYPE_COLOURS: Record<EndingType, string> = {
  bad: 'text-danger',
  neutral: 'text-warning',
  good: 'text-safe',
  secret: 'text-accent',
}

const TYPE_BORDER: Record<EndingType, string> = {
  bad: 'border-danger/40',
  neutral: 'border-warning/40',
  good: 'border-safe/40',
  secret: 'border-accent/40',
}

export default function EndingPage() {
  const { endingId } = useParams<{ endingId: string }>()
  const navigate = useNavigate()
  const { triggeredEnding, gameState, startNewGame, isLoading } = useGameStore()
  const { LL, locale } = useI18n()

  async function handlePlayAgain() {
    await startNewGame(0)
    navigate('/game')
  }

  if (!triggeredEnding || triggeredEnding.id !== endingId) {
    return (
      <div className="relative min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-6">
        <AmbientOverlay
          hoursFromStart={DEFAULT_GAME_STATE.gameTime.hoursFromStart}
          infection={DEFAULT_GAME_STATE.stats.infection}
        />
        <p className="font-body text-text-dim relative z-10">{LL.ending.noData()}</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="choice-btn max-w-xs relative z-10"
        >
          {LL.ending.returnToTitle()}
        </button>
      </div>
    )
  }

  const colourClass = TYPE_COLOURS[triggeredEnding.type]
  const borderClass = TYPE_BORDER[triggeredEnding.type]
  const typeLabel = LL.ending.type[triggeredEnding.type]()
  const title = resolveLocaleString(triggeredEnding.title, locale)
  const paragraphs = resolveLocaleStrings(triggeredEnding.narrative, locale)
  const epilogue = triggeredEnding.epilogue
    ? resolveLocaleString(triggeredEnding.epilogue, locale)
    : null

  return (
    <div className="relative min-h-screen bg-background flex flex-col items-center justify-center px-6 py-16">
      <AmbientOverlay
        hoursFromStart={
          gameState?.gameTime.hoursFromStart ?? DEFAULT_GAME_STATE.gameTime.hoursFromStart
        }
        infection={gameState?.stats.infection ?? DEFAULT_GAME_STATE.stats.infection}
      />

      <div
        className={`relative z-10 max-w-lg w-full flex flex-col gap-8 animate-fade-in panel-card border-2 ${borderClass}`}
      >
        <p className={`ui-label tracking-[0.25em] text-center ${colourClass}`}>— {typeLabel} —</p>

        <h1 className="font-display text-4xl sm:text-5xl text-text leading-tight text-center">
          {title}
        </h1>

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
          <blockquote className="font-body text-text-dim italic text-base border-l-2 border-accent/40 pl-4">
            {epilogue}
          </blockquote>
        )}

        <hr className="border-border" />

        {gameState && (
          <>
            <div className="flex flex-wrap gap-4 sm:gap-6 justify-center font-ui text-xs text-text-dim">
              <span className="panel-card py-2 px-3">
                {interpolate(LL.ending.daysSurvived, {
                  count: Math.ceil(gameState.gameTime.hoursFromStart / 24) || 1,
                })}
              </span>
              <span className="panel-card py-2 px-3">
                {interpolate(LL.ending.choicesMade, { count: gameState.choiceHistory.length })}
              </span>
              <span className="panel-card py-2 px-3">
                {interpolate(LL.ending.scenesVisited, { count: gameState.visitedScenes.length })}
              </span>
            </div>

            {(() => {
              const flags = gameState.flags as Record<string, boolean | undefined>
              const milestones = MILESTONE_FLAGS.filter((m) => flags[m.flag])
              if (milestones.length === 0) return null
              return (
                <div className="flex flex-wrap gap-2 justify-center">
                  {milestones.map((m) => (
                    <span
                      key={m.flag}
                      className="panel-card py-1 px-2 font-ui text-xs text-text-dim"
                    >
                      {locale === 'en' ? m.en : m.zh}
                    </span>
                  ))}
                </div>
              )
            })()}

            {gameState.journalLog.length > 0 && <JournalPanel entries={gameState.journalLog} />}
          </>
        )}

        <div className="flex flex-col gap-3 mt-2">
          <button
            type="button"
            onClick={handlePlayAgain}
            disabled={isLoading}
            className="choice-btn choice-btn-primary text-center"
          >
            {isLoading ? LL.ui.loading() : LL.ending.playAgain()}
          </button>
          <button type="button" onClick={() => navigate('/')} className="choice-btn text-center">
            {LL.ending.returnToTitle()}
          </button>
        </div>
      </div>
    </div>
  )
}
