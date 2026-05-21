import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '@/store/gameStore'
import SceneDisplay from '@/components/game/SceneDisplay'
import ChoiceList from '@/components/game/ChoiceList'
import StatPanel from '@/components/game/StatPanel'
import InventoryPanel from '@/components/game/InventoryPanel'

export default function GamePage() {
  const navigate = useNavigate()
  const { currentScene, gameState, triggeredEnding, isLoading, error, selectChoice, dismissError } =
    useGameStore()

  // Redirect to title if no game is loaded
  useEffect(() => {
    if (!currentScene && !isLoading) {
      navigate('/')
    }
  }, [currentScene, isLoading, navigate])

  // Navigate to ending screen when an ending triggers
  useEffect(() => {
    if (triggeredEnding) {
      navigate(`/ending/${triggeredEnding.id}`)
    }
  }, [triggeredEnding, navigate])

  if (!currentScene || !gameState) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="ui-label text-muted animate-flicker">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto flex min-h-screen">
        {/* ── Sidebar ───────────────────────────────────────────── */}
        <aside className="w-56 shrink-0 border-r border-border p-6 flex flex-col gap-8 sticky top-0 h-screen overflow-y-auto">
          {/* Logo */}
          <div>
            <h1
              className="font-display text-xl text-accent cursor-pointer animate-flicker"
              onClick={() => navigate('/')}
            >
              DEAD HOUR
            </h1>
          </div>

          <StatPanel stats={gameState.stats} />
          <InventoryPanel inventory={gameState.inventory} />
        </aside>

        {/* ── Main content ──────────────────────────────────────── */}
        <main className="flex-1 px-10 py-12 max-w-2xl">
          {/* Error banner */}
          {error && (
            <div
              className="mb-6 px-4 py-3 rounded border border-danger bg-[#1e0808]
                         font-body text-sm text-accent flex justify-between items-center"
            >
              <span>{error}</span>
              <button onClick={dismissError} className="ui-label text-xs text-muted ml-4">
                dismiss
              </button>
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <p className="ui-label text-muted text-xs">Loading scene...</p>
            </div>
          )}

          <SceneDisplay scene={currentScene} />

          <ChoiceList
            choices={currentScene.choices}
            gameState={gameState}
            onSelect={selectChoice}
            disabled={isLoading}
          />
        </main>
      </div>
    </div>
  )
}
