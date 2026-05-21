import type { PlayerStats } from '@/engine/types'
import { useI18nContext } from '@/i18n/i18n-react'

interface StatMeta {
  key: keyof PlayerStats
  getLabel: (LL: ReturnType<typeof useI18nContext>['LL']) => string
  icon: string
  max: number
  colour: string
}

const VISIBLE_STATS: StatMeta[] = [
  { key: 'health', getLabel: (LL) => LL.statHealth(), icon: '❤', max: 20, colour: '#b03030' },
  { key: 'morale', getLabel: (LL) => LL.statMorale(), icon: '◈', max: 20, colour: '#b08030' },
  {
    key: 'leadership',
    getLabel: (LL) => LL.statLeadership(),
    icon: '▲',
    max: 20,
    colour: '#4a7c5f',
  },
  { key: 'stealth', getLabel: (LL) => LL.statStealth(), icon: '◉', max: 20, colour: '#4a6a8b' },
]

interface Props {
  stats: PlayerStats
}

export default function StatPanel({ stats }: Props) {
  const { LL } = useI18nContext()

  return (
    <div className="flex flex-col gap-4">
      <p className="ui-label text-muted">{LL.statusLabel()}</p>
      {VISIBLE_STATS.map(({ key, getLabel, icon, max, colour }) => {
        const value = stats[key]
        const pct = Math.round((value / max) * 100)
        const isLow = pct <= 25

        return (
          <div key={key} className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <span className="font-ui text-xs text-text-dim">
                {icon} {getLabel(LL)}
              </span>
              <span className="font-ui text-xs" style={{ color: isLow ? '#b03030' : '#7a7a6a' }}>
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
