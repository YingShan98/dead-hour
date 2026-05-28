import { useNavigate } from 'react-router-dom'
import { useGameStore } from '@/store/gameStore'
import { listSaves } from '@/engine/saveManager'
import { useI18n } from '@/i18n/useI18n'
import { interpolate } from '@/i18n/interpolate'

export default function TitlePage() {
  const navigate = useNavigate()
  const { startNewGame, loadFromSave, isLoading } = useGameStore()
  const { LL, locale, setLocale, supportedLocales, localeLabel } = useI18n()

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
          <p className="ui-label text-muted mb-4 tracking-[0.3em]">{LL.title.tagline()}</p>
          <h1 className="font-display text-7xl text-text leading-none animate-flicker">DEAD</h1>
          <h1 className="font-display text-7xl text-accent leading-none">HOUR</h1>
          <p className="mt-6 font-body text-text-dim text-lg italic">{LL.title.subtitle()}</p>
        </div>

        {/* Menu */}
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={handleNewGame}
            disabled={isLoading}
            className="choice-btn text-center font-display text-xl tracking-wide py-4
                       border-accent text-accent hover:bg-[#1e0a0a]"
          >
            {isLoading ? LL.ui.loading() : LL.title.newGame()}
          </button>

          {hasSave && (
            <button
              onClick={handleContinue}
              disabled={isLoading}
              className="choice-btn text-center"
            >
              {LL.title.continue()}
            </button>
          )}
        </div>

        {/* Locale switcher */}
        <div className="flex gap-3">
          {supportedLocales.map((l) => (
            <button
              key={l}
              onClick={() => setLocale(l)}
              className={`ui-label text-xs px-3 py-1 rounded border transition-colors ${
                locale === l
                  ? 'border-accent text-accent'
                  : 'border-border text-muted hover:border-text-dim'
              }`}
            >
              {localeLabel(l)}
            </button>
          ))}
        </div>

        {/* Footer */}
        <p className="ui-label text-muted text-xs">
          {interpolate(LL.title.version, { version: '0.1.0' })}
        </p>
      </div>
    </div>
  )
}
