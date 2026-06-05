import type { Scene, GameState } from '@/engine/types'
import { evaluate } from '@/engine/evaluator'
import { useI18n } from '@/i18n/useI18n'
import { interpolate } from '@/i18n/interpolate'
import { resolveLocaleString, resolveLocaleStrings } from '@/i18n/localeString'

interface Props {
  scene: Scene
  state: GameState
}

export default function SceneDisplay({ scene, state }: Props) {
  const { locale, LL } = useI18n()

  const title = resolveLocaleString(scene.title, locale)
  const passed = (scene.conditionalNarrative ?? []).filter((p) => evaluate(p.conditions, state))
  const prefix = passed
    .filter((p) => !p.position || p.position === 'prefix')
    .map((p) => resolveLocaleString(p, locale))
  const suffix = passed
    .filter((p) => p.position === 'suffix')
    .map((p) => resolveLocaleString(p, locale))
  const paragraphs = [...prefix, ...resolveLocaleStrings(scene.narrative, locale), ...suffix]

  function formatGameTime(hoursFromStart: number): string {
    if (hoursFromStart < 0) {
      return interpolate(LL.time.beforeOutbreak, { hours: Math.abs(hoursFromStart) })
    }
    const days = Math.floor(hoursFromStart / 24)
    if (days === 0) return LL.time.dayOne()
    return interpolate(LL.time.day, { day: days })
  }

  return (
    <article className="animate-fade-in">
      <p className="ui-label text-muted mb-3 inline-flex items-center gap-2">
        <span className="w-1 h-1 rounded-full bg-accent/60" aria-hidden />
        {formatGameTime(scene.gameTime.hoursFromStart)}
      </p>

      <h2 className="scene-title mb-6 pb-4 border-b border-border-subtle">{title}</h2>

      <div className="flex flex-col gap-5">
        {paragraphs.map((paragraph, i) => (
          <p
            key={i}
            className="narrative-text animate-slide-up"
            style={{ animationDelay: `${i * 80}ms`, opacity: 0, animationFillMode: 'forwards' }}
          >
            {paragraph}
          </p>
        ))}
      </div>
    </article>
  )
}
