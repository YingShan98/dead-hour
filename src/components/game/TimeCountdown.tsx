import { useI18n } from '@/i18n/useI18n'
import { interpolate } from '@/i18n/interpolate'
import { getTimeUrgency, type TimeUrgency } from '@/engine/timeManager'
import { TIME_START } from '@/engine/defaults'

interface Props {
  timeRemaining: number
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

export default function TimeCountdown({ timeRemaining }: Props) {
  const { LL } = useI18n()

  const urgency = getTimeUrgency(timeRemaining)
  const pct = Math.max(0, (timeRemaining / TIME_START) * 100)
  const barCls = URGENCY_BAR_COLOUR[urgency]
  const textCls = URGENCY_TEXT_COLOUR[urgency]

  // Resolved display strings — all from LL, none hardcoded
  const displayTime: string =
    urgency === 'expired'
      ? LL.countdown.expired()
      : interpolate(LL.countdown.hours, { hours: timeRemaining })

  const urgencyLabel: string = LL.countdown.urgency[urgency]()

  return (
    <div className="flex flex-col gap-1.5">
      {/* Header row */}
      <div className="flex justify-between items-center">
        <span className="font-ui text-xs text-text-dim uppercase tracking-widest">
          {LL.countdown.label()}
        </span>
        <span className={`font-ui text-xs ${textCls}`}>{displayTime}</span>
      </div>

      {/* Bar */}
      <div className="stat-bar">
        <div
          className={`stat-bar-fill transition-all duration-700 ${barCls}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Urgency label — only shown when non-safe */}
      {urgencyLabel && <p className={`font-ui text-xs text-right ${textCls}`}>{urgencyLabel}</p>}
    </div>
  )
}
