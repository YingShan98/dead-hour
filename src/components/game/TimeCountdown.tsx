import { useI18n } from '@/i18n/useI18n'
import { interpolate } from '@/i18n/interpolate'
import { getTimeUrgency, type TimeUrgency } from '@/engine/timeManager'
import { CRISIS_ARRIVAL_HOUR } from '@/engine/defaults'

// Total prep span from game start (h=-48) to outbreak (h=0) = 48 hours
const TOTAL_SPAN = CRISIS_ARRIVAL_HOUR - -48

interface Props {
  hoursFromStart: number
}

const URGENCY_BAR_COLOUR: Record<TimeUrgency, string> = {
  safe: 'bg-safe',
  warning: 'bg-warning',
  critical: 'bg-danger',
  expired: 'bg-danger',
}

const URGENCY_TEXT_COLOUR: Record<TimeUrgency, string> = {
  safe: 'text-safe',
  warning: 'text-warning',
  critical: 'text-danger animate-flicker',
  expired: 'text-danger',
}

export default function TimeCountdown({ hoursFromStart }: Props) {
  const { LL } = useI18n()

  const urgency = getTimeUrgency(hoursFromStart)
  const isElapsed = urgency === 'expired'

  const label = isElapsed ? LL.countdown.labelElapsed() : LL.countdown.label()

  const remaining = CRISIS_ARRIVAL_HOUR - hoursFromStart
  const day = Math.ceil(Math.max(0, hoursFromStart) / 24)
  const displayTime: string = isElapsed
    ? LL.countdown.day({ day })
    : interpolate(LL.countdown.hours, { hours: remaining })

  const pct = isElapsed
    ? Math.min(100, (Math.max(0, hoursFromStart) / (14 * 24)) * 100)
    : Math.max(0, (remaining / TOTAL_SPAN) * 100)

  const barCls = isElapsed ? 'bg-safe' : URGENCY_BAR_COLOUR[urgency]
  const textCls = isElapsed ? 'text-safe' : URGENCY_TEXT_COLOUR[urgency]
  const urgencyLabel: string = isElapsed ? '' : LL.countdown.urgency[urgency]()

  return (
    <div className="flex flex-col gap-1.5">
      {/* Header row */}
      <div className="flex justify-between items-center">
        <span className="font-ui text-xs text-text-dim uppercase tracking-widest">{label}</span>
        <span className={`font-ui text-xs ${textCls}`}>{displayTime}</span>
      </div>

      {/* Bar */}
      <div className="stat-bar">
        <div
          className={`stat-bar-fill transition-all duration-700 ${barCls}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Urgency label — only shown when non-safe and pre-crisis */}
      {urgencyLabel && <p className={`font-ui text-xs text-right ${textCls}`}>{urgencyLabel}</p>}
    </div>
  )
}
