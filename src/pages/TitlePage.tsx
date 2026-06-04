import { useNavigate } from 'react-router-dom'
import { useGameStore } from '@/store/gameStore'
import { listSaves } from '@/engine/saveManager'
import { useI18n } from '@/i18n/useI18n'
import { interpolate } from '@/i18n/interpolate'
import AmbientOverlay from '@/components/ui/AmbientOverlay'

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
    <div className="relative min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <AmbientOverlay />

      <div className="relative z-10 flex flex-col items-center gap-10 sm:gap-12 animate-fade-in max-w-md w-full">
        <div className="text-center w-full">
          <p className="ui-label text-muted mb-4 tracking-[0.3em]">{LL.title.tagline()}</p>
          <h1 className="font-display text-6xl sm:text-7xl text-text leading-none animate-flicker">
            DEAD
          </h1>
          <h1 className="font-display text-6xl sm:text-7xl text-accent leading-none">HOUR</h1>
          <div className="divider-ornament mt-8 max-w-xs mx-auto">
            <span className="font-ui text-muted text-xs">◆</span>
          </div>
          <p className="mt-4 font-body text-text-dim text-lg italic leading-relaxed">
            {LL.title.subtitle()}
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <button
            type="button"
            onClick={handleNewGame}
            disabled={isLoading}
            className="choice-btn choice-btn-primary text-center font-display text-xl tracking-wide py-4"
          >
            {isLoading ? LL.ui.loading() : LL.title.newGame()}
          </button>

          {hasSave && (
            <button
              type="button"
              onClick={handleContinue}
              disabled={isLoading}
              className="choice-btn text-center"
            >
              {LL.title.continue()}
            </button>
          )}
        </div>

        <div className="flex gap-2 flex-wrap justify-center" role="group" aria-label="Language">
          {supportedLocales.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLocale(l)}
              className={`ui-label text-xs px-3 py-1.5 rounded-md border transition-colors ${
                locale === l
                  ? 'border-accent text-accent bg-[#1a0c0c]'
                  : 'border-border text-muted hover:border-text-dim hover:text-text-dim'
              }`}
            >
              {localeLabel(l)}
            </button>
          ))}
        </div>

        <p className="ui-label text-muted text-xs">
          {interpolate(LL.title.version, { version: '0.1.0' })}
        </p>
      </div>
    </div>
  )
}
