import type { Scene } from '@/engine/types'

interface Props {
  scene: Scene
}

function formatGameTime(hoursFromStart: number): string {
  if (hoursFromStart < 0) {
    const abs = Math.abs(hoursFromStart)
    return `T-${abs}h — Before the Outbreak`
  }
  const days = Math.floor(hoursFromStart / 24)
  if (days === 0) return 'Day 1 — Hour Zero'
  return `Day ${days}`
}

export default function SceneDisplay({ scene }: Props) {
  return (
    <div className="animate-fade-in">
      {/* Time indicator */}
      <p className="ui-label text-muted mb-3">
        {formatGameTime(scene.gameTime.hoursFromStart)}
      </p>

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
