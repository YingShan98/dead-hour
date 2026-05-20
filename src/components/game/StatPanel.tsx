import type { PlayerStats } from '@/engine/types'

const VISIBLE_STATS: Array<{
  key: keyof PlayerStats
  label: string
  icon: string
  max: number
  colour: string
}> = [
  { key: 'health',     label: 'Health',     icon: '❤',  max: 20, colour: '#b03030' },
  { key: 'morale',     label: 'Morale',     icon: '◈',  max: 20, colour: '#b08030' },
  { key: 'leadership', label: 'Leadership', icon: '▲',  max: 20, colour: '#4a7c5f' },
  { key: 'stealth',    label: 'Stealth',    icon: '◉',  max: 20, colour: '#4a6a8b' },
]

interface Props {
  stats: PlayerStats
}

export default function StatPanel({ stats }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <p className="ui-label text-muted">Status</p>
      {VISIBLE_STATS.map(({ key, label, icon, max, colour }) => {
        const value = stats[key]
        const pct = Math.round((value / max) * 100)
        const isLow = pct <= 25

        return (
          <div key={key} className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <span className="font-ui text-xs text-text-dim">
                {icon} {label}
              </span>
              <span
                className="font-ui text-xs"
                style={{ color: isLow ? '#b03030' : '#7a7a6a' }}
              >
                {value}/{max}
              </span>
            </div>
            <div className="stat-bar">
              <div
                className="stat-bar-fill"
                style={{
                  width: `${pct}%`,
                  backgroundColor: isLow ? '#8b2020' : colour,
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
