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
import { useI18n } from '@/i18n/useI18n'

// ── Error resolution ──────────────────────────────────────────────────────────
// Converts a typed StoreError into a display string using the active locale.
// Lives in the component layer — the store itself never holds strings.

type LLErrors = ReturnType<typeof useI18n>['LL']['errors']

function resolveError(error: StoreError, errors: LLErrors): string {
  const fn = errors[error.key] as (args: Record<string, string | number>) => string
  return fn(error.params ?? {})
}

// ─────────────────────────────────────────────────────────────────────────────

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

  // Redirect to title if no game is loaded
  useEffect(() => {
    if (!currentScene && !isLoading) navigate('/')
  }, [currentScene, isLoading, navigate])

  // Navigate to ending screen when an ending triggers
  useEffect(() => {
    if (triggeredEnding) navigate(`/ending/${triggeredEnding.id}`)
  }, [triggeredEnding, navigate])

  // Clear crisis flags after displaying banners
  useEffect(() => {
    if (timeJustExpired || awakeningJustTriggered) {
      const t = setTimeout(clearCrisisFlags, 4000)
      return () => clearTimeout(t)
    }
  }, [timeJustExpired, awakeningJustTriggered, clearCrisisFlags])

  if (!currentScene || !gameState) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="ui-label text-muted animate-flicker">{LL.ui.loading()}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto flex min-h-screen">
        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <aside className="w-60 shrink-0 border-r border-border flex flex-col gap-6 sticky top-0 h-screen overflow-y-auto p-5">
          {/* Logo */}
          <h1
            className="font-display text-xl text-accent cursor-pointer animate-flicker"
            onClick={() => navigate('/')}
          >
            DEAD HOUR
          </h1>

          <TimeCountdown timeRemaining={gameState.timeRemaining} />
          <SecurityMeter security={gameState.security} />

          <div className="border-t border-border pt-4">
            <StatPanel stats={gameState.stats} />
          </div>

          <div className="border-t border-border pt-4">
            <InventoryPanel inventory={gameState.inventory} />
          </div>
        </aside>

        {/* ── Main content ─────────────────────────────────────────────────── */}
        <main className="flex-1 px-10 py-12 max-w-2xl">
          {/* Crisis banners */}
          {timeJustExpired && (
            <div className="mb-6 px-4 py-3 rounded border border-danger bg-[#1e0808] animate-fade-in">
              <p className="font-body text-sm text-danger">{LL.game.crisis.timeExpired()}</p>
            </div>
          )}
          {awakeningJustTriggered && (
            <div className="mb-6 px-4 py-3 rounded border border-border bg-[#080c1e] animate-fade-in">
              <p className="font-body text-sm text-text-dim italic">{LL.game.crisis.awakening()}</p>
            </div>
          )}

          {/* Error banner — resolved from StoreError via LL */}
          {error && (
            <div className="mb-6 px-4 py-3 rounded border border-danger bg-[#1e0808] flex justify-between items-center">
              <span className="font-body text-sm text-accent">
                {resolveError(error, LL.errors)}
              </span>
              <button onClick={dismissError} className="ui-label text-xs text-muted ml-4">
                {LL.ui.dismiss()}
              </button>
            </div>
          )}

          {/* Loading pulse */}
          {isLoading && (
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <p className="ui-label text-muted text-xs">{LL.game.loadingScene()}</p>
            </div>
          )}

          {/* Scene */}
          <SceneDisplay scene={currentScene} />

          {/* Transformation hint */}
          <TransformationHint stats={gameState.stats} />

          {/* Choices */}
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
