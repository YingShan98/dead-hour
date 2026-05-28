import { useI18n } from '@/i18n/useI18n'
import { getSecurityLevel, type SecurityLevel } from '@/engine/timeManager'

interface Props {
  security: number
}

const LEVEL_BAR_COLOUR: Record<SecurityLevel, string> = {
  none: 'bg-muted',
  basic: 'bg-warning',
  solid: 'bg-safe',
  fortress: 'bg-accent',
}

const LEVEL_TEXT_COLOUR: Record<SecurityLevel, string> = {
  none: 'text-muted',
  basic: 'text-warning',
  solid: 'text-safe',
  fortress: 'text-accent animate-flicker',
}

export default function SecurityMeter({ security }: Props) {
  const { LL } = useI18n()

  const level = getSecurityLevel(security)
  const barCls = LEVEL_BAR_COLOUR[level]
  const textCls = LEVEL_TEXT_COLOUR[level]
  const pct = Math.min(100, security)

  // All display strings from LL
  const levelLabel: string = LL.security.level[level]()

  return (
    <div className="flex flex-col gap-1.5">
      {/* Header row */}
      <div className="flex justify-between items-center">
        <span className="font-ui text-xs text-text-dim uppercase tracking-widest">
          {LL.security.label()}
        </span>
        <span className={`font-ui text-xs ${textCls}`}>{security}</span>
      </div>

      {/* Bar */}
      <div className="stat-bar">
        <div
          className={`stat-bar-fill transition-all duration-700 ${barCls}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Level label */}
      <p className={`font-ui text-xs text-right ${textCls}`}>{levelLabel}</p>
    </div>
  )
}
