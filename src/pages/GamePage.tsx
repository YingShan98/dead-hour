import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '@/store/gameStore'
import type { StoreError } from '@/store/gameStore'
import SceneDisplay from '@/components/game/SceneDisplay'
import ChoiceList from '@/components/game/ChoiceList'
import StatPanel from '@/components/game/StatPanel'
import InventoryPanel from '@/components/game/InventoryPanel'
import TimeCountdown from '@/components/game/TimeCountdown'
import SecurityMeter from '@/components/game/SecurityMeter'
import TransformationHint from '@/components/game/TransformationHint'
import ConsequenceDisplay from '@/components/game/ConsequenceDisplay'
import AmbientOverlay from '@/components/ui/AmbientOverlay'
import { useI18n } from '@/i18n/useI18n'

type LLErrors = ReturnType<typeof useI18n>['LL']['errors']

function resolveError(error: StoreError, errors: LLErrors): string {
  const fn = errors[error.key] as (args: Record<string, string | number>) => string
  return fn(error.params ?? {})
}

function GameStatusPanels() {
  const { gameState } = useGameStore()
  if (!gameState) return null

  return (
    <>
      <div className="panel-card">
        <StatPanel stats={gameState.stats} flags={gameState.flags} />
      </div>
      <div className="panel-card">
        <InventoryPanel inventory={gameState.inventory} />
      </div>
    </>
  )
}

export default function GamePage() {
  const navigate = useNavigate()
  const { LL } = useI18n()

  const {
    currentScene,
    gameState,
    triggeredEnding,
    isLoading,
    error,
    timeJustExpired,
    awakeningJustTriggered,
    pendingChoice,
    selectChoice,
    commitChoice,
    dismissError,
    clearCrisisFlags,
  } = useGameStore()

  useEffect(() => {
    if (!currentScene && !isLoading) navigate('/')
  }, [currentScene, isLoading, navigate])

  useEffect(() => {
    if (triggeredEnding) navigate(`/ending/${triggeredEnding.id}`)
  }, [triggeredEnding, navigate])

  useEffect(() => {
    if (timeJustExpired || awakeningJustTriggered) {
      const t = setTimeout(clearCrisisFlags, 4000)
      return () => clearTimeout(t)
    }
  }, [timeJustExpired, awakeningJustTriggered, clearCrisisFlags])

  if (!currentScene || !gameState) {
    return (
      <div className="relative min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <AmbientOverlay />
        <div className="loading-dot" />
        <p className="ui-label text-muted relative z-10">{LL.ui.loading()}</p>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-background">
      <AmbientOverlay />

      <div className="relative z-10 max-w-6xl mx-auto flex flex-col lg:flex-row min-h-screen">
        {/* Mobile header: time, security, collapsible status */}
        <header className="lg:hidden sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="flex items-center justify-between px-4 py-3 gap-3">
            <button
              type="button"
              className="game-logo-btn text-base shrink-0"
              onClick={() => navigate('/')}
              aria-label={LL.ending.returnToTitle()}
            >
              DEAD HOUR
            </button>
          </div>
          <div className="px-4 pb-3 grid grid-cols-2 gap-3">
            <div className="panel-card py-3">
              <TimeCountdown timeRemaining={gameState.timeRemaining} />
            </div>
            <div className="panel-card py-3">
              <SecurityMeter security={gameState.security} />
            </div>
          </div>
          <details className="px-4 pb-3 group">
            <summary className="mobile-status-summary">
              <span>{LL.stats.label()}</span>
              <span className="text-muted group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="mt-3 flex flex-col gap-3">
              <GameStatusPanels />
            </div>
          </details>
        </header>

        {/* Desktop sidebar */}
        <aside
          className="hidden lg:flex w-64 shrink-0 border-r border-border flex-col gap-5
                     sticky top-0 h-screen overflow-y-auto p-5"
        >
          <button
            type="button"
            className="game-logo-btn text-xl"
            onClick={() => navigate('/')}
            aria-label={LL.ending.returnToTitle()}
          >
            DEAD HOUR
          </button>

          <div className="panel-card">
            <TimeCountdown timeRemaining={gameState.timeRemaining} />
          </div>
          <div className="panel-card">
            <SecurityMeter security={gameState.security} />
          </div>

          <GameStatusPanels />
        </aside>

        {/* Main narrative column */}
        <main className="flex-1 w-full min-w-0 px-4 sm:px-8 lg:px-12 py-8 lg:py-12 max-w-2xl mx-auto lg:mx-0">
          {timeJustExpired && (
            <div className="crisis-banner crisis-banner--danger" role="alert">
              <span className="font-ui text-danger text-lg leading-none" aria-hidden>
                ⏱
              </span>
              <p className="font-body text-sm text-danger">{LL.game.crisis.timeExpired()}</p>
            </div>
          )}
          {awakeningJustTriggered && (
            <div className="crisis-banner crisis-banner--awakening" role="status">
              <span className="font-ui text-text-dim text-lg leading-none" aria-hidden>
                ◇
              </span>
              <p className="font-body text-sm text-text-dim italic">{LL.game.crisis.awakening()}</p>
            </div>
          )}

          {error && (
            <div
              className="crisis-banner crisis-banner--danger justify-between items-center"
              role="alert"
            >
              <span className="font-body text-sm text-accent flex-1">
                {resolveError(error, LL.errors)}
              </span>
              <button
                type="button"
                onClick={dismissError}
                className="ui-label text-xs text-muted ml-4 shrink-0 hover:text-text transition-colors"
              >
                {LL.ui.dismiss()}
              </button>
            </div>
          )}

          {isLoading && (
            <div className="flex items-center gap-2.5 mb-6 panel-card py-2.5" aria-live="polite">
              <div className="loading-dot" />
              <p className="ui-label text-muted text-xs">{LL.game.loadingScene()}</p>
            </div>
          )}

          <SceneDisplay scene={currentScene} state={gameState} />
          <TransformationHint stats={gameState.stats} />
          <ChoiceList
            choices={currentScene.choices}
            gameState={gameState}
            onSelect={selectChoice}
            disabled={isLoading}
          />
        </main>
      </div>

      <ConsequenceDisplay choice={pendingChoice} onDone={commitChoice} isLoading={isLoading} />
    </div>
  )
}
