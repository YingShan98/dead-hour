import type { Scene } from '@/engine/types'
import { useI18nContext } from '@/i18n/i18n-react'

interface Props {
  scene: Scene
}

export default function SceneDisplay({ scene }: Props) {
  const { LL } = useI18nContext()

  function formatGameTime(hoursFromStart: number): string {
    if (hoursFromStart < 0) {
      return LL.timeBeforeOutbreak({ hours: Math.abs(hoursFromStart) })
    }
    const days = Math.floor(hoursFromStart / 24)
    if (days === 0) return LL.timeHourZero()
    return LL.timeDay({ days })
  }

  return (
    <div className="animate-fade-in">
      {/* Time indicator */}
      <p className="ui-label text-muted mb-3">{formatGameTime(scene.gameTime.hoursFromStart)}</p>

      {/* Scene title */}
      <h2 className="scene-title mb-6">{scene.title}</h2>

      {/* Narrative paragraphs */}
      <div className="flex flex-col gap-4">
        {scene.narrative.map((paragraph, i) => (
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
