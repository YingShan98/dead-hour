import { useI18n } from '@/i18n/useI18n'
import type { PlayerStats } from '@/engine/types'
import { getInfectionSignal, getWillSignal } from '@/engine/timeManager'

interface StatRow {
  key: keyof PlayerStats
  labelKey: 'health' | 'morale' | 'leadership' | 'stealth'
  icon: string
  max: number
  barColour: (value: number) => string
}

const STAT_ROWS: StatRow[] = [
  {
    key: 'health',
    labelKey: 'health',
    icon: '❤',
    max: 20,
    barColour: (v) => (v <= 4 ? '#8b2020' : '#4a7c5f'),
  },
  {
    key: 'morale',
    labelKey: 'morale',
    icon: '◈',
    max: 20,
    barColour: (v) => (v <= 4 ? '#8b2020' : '#b08030'),
  },
  {
    key: 'leadership',
    labelKey: 'leadership',
    icon: '▲',
    max: 20,
    barColour: () => '#4a7c5f',
  },
  {
    key: 'stealth',
    labelKey: 'stealth',
    icon: '◉',
    max: 20,
    barColour: () => '#4a6a8b',
  },
]

// Colour for hidden-stat signals
const INFECTION_SIGNAL_COLOUR: Record<'spreading' | 'critical', string> = {
  spreading: '#b08030',
  critical: '#b03030',
}

const WILL_SIGNAL_COLOUR: Record<'awakening' | 'collapse', string> = {
  awakening: '#4a6a8b',
  collapse: '#b03030',
}

interface Props {
  stats: PlayerStats
}

export default function StatPanel({ stats }: Props) {
  const { LL } = useI18n()

  const infectionSignal = getInfectionSignal(stats.infection)
  const willSignal = getWillSignal(stats.will)

  return (
    <div className="flex flex-col gap-4">
      <p className="ui-label text-muted">{LL.stats.label()}</p>

      {/* Visible character stats */}
      {STAT_ROWS.map(({ key, labelKey, icon, max, barColour }) => {
        const value = stats[key]
        const pct = Math.round((value / max) * 100)
        return (
          <div key={key} className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <span className="font-ui text-xs text-text-dim">
                {icon} {LL.stats[labelKey]()}
              </span>
              <span
                className="font-ui text-xs"
                style={{ color: pct <= 25 ? '#b03030' : '#7a7a6a' }}
              >
                {value}/{max}
              </span>
            </div>
            <div className="stat-bar">
              <div
                className="stat-bar-fill"
                style={{ width: `${pct}%`, backgroundColor: barColour(value) }}
              />
            </div>
          </div>
        )
      })}

      {/* Infection signal — only shown when threshold crossed */}
      {infectionSignal && (
        <div className="flex items-center justify-between pt-1 border-t border-border">
          <span
            className="font-ui text-xs"
            style={{ color: INFECTION_SIGNAL_COLOUR[infectionSignal] }}
          >
            ⬡
          </span>
          <span
            className="font-ui text-xs"
            style={{ color: INFECTION_SIGNAL_COLOUR[infectionSignal] }}
          >
            {LL.statSignal.infection[infectionSignal]()}
          </span>
        </div>
      )}

      {/* Will signal — only shown when threshold crossed */}
      {willSignal && (
        <div className="flex items-center justify-between pt-1 border-t border-border">
          <span className="font-ui text-xs" style={{ color: WILL_SIGNAL_COLOUR[willSignal] }}>
            ◇
          </span>
          <span className="font-ui text-xs" style={{ color: WILL_SIGNAL_COLOUR[willSignal] }}>
            {LL.statSignal.will[willSignal]()}
          </span>
        </div>
      )}
    </div>
  )
}
