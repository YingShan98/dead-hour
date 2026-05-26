import type { Scene } from '@/engine/types'
import { useI18n } from '@/i18n/useI18n'
import { interpolate } from '@/i18n/interpolate'
import { resolveLocaleString, resolveLocaleStrings } from '@/i18n/localeString'

interface Props {
  scene: Scene
}

export default function SceneDisplay({ scene }: Props) {
  const { locale, LL } = useI18n()

  const title = resolveLocaleString(scene.title, locale)
  const paragraphs = resolveLocaleStrings(scene.narrative, locale)

  function formatGameTime(hoursFromStart: number): string {
    if (hoursFromStart < 0) {
      return interpolate(LL.time.beforeOutbreak, { hours: Math.abs(hoursFromStart) })
    }
    const days = Math.floor(hoursFromStart / 24)
    if (days === 0) return LL.time.dayOne
    return interpolate(LL.time.day, { day: days })
  }

  return (
    <div className="animate-fade-in">
      <p className="ui-label text-muted mb-3">{formatGameTime(scene.gameTime.hoursFromStart)}</p>

      <h2 className="scene-title mb-6">{title}</h2>

      <div className="flex flex-col gap-4">
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
    </div>
  )
}
