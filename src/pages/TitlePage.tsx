import { useNavigate } from 'react-router-dom'
import { useGameStore } from '@/store/gameStore'
import { listSaves } from '@/engine/saveManager'
import { useI18nContext } from '@/i18n/i18n-react'

export default function TitlePage() {
  const navigate = useNavigate()
  const { startNewGame, loadFromSave, isLoading } = useGameStore()
  const { LL } = useI18nContext()

  const saves = listSaves()
  const hasSave = saves.some((s) => s.exists)

  async function handleNewGame() {
    await startNewGame(0)
    navigate('/game')
  }

  async function handleContinue() {
    const latestSave = saves.find((s) => s.exists)
    if (!latestSave) return
    await loadFromSave(latestSave.slot)
    navigate('/game')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      {/* Grain overlay */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px',
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-12 animate-fade-in max-w-md w-full">
        {/* Title block */}
        <div className="text-center">
          <p className="ui-label text-muted mb-4 tracking-[0.3em]">{LL.tagline()}</p>
          <h1 className="font-display text-7xl text-text leading-none animate-flicker">DEAD</h1>
          <h1 className="font-display text-7xl text-accent leading-none">HOUR</h1>
          <p className="mt-6 font-body text-text-dim text-lg italic">{LL.gameSubtitle()}</p>
        </div>

        {/* Menu */}
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={handleNewGame}
            disabled={isLoading}
            className="choice-btn text-center font-display text-xl tracking-wide py-4
                       border-accent text-accent hover:bg-[#1e0a0a]"
          >
            {isLoading ? LL.loading() : LL.newGame()}
          </button>

          {hasSave && (
            <button
              onClick={handleContinue}
              disabled={isLoading}
              className="choice-btn text-center"
            >
              {LL.continue()}
            </button>
          )}
        </div>

        {/* Footer */}
        <p className="ui-label text-muted text-xs">{LL.versionLabel()}</p>
      </div>
    </div>
  )
}
