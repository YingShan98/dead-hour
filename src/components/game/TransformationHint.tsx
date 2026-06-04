import { useI18n } from '@/i18n/useI18n'
import { getInfectionHint, getWillHint, type InfectionHintSeverity } from '@/engine/timeManager'
import type { PlayerStats } from '@/engine/types'

interface Props {
  stats: PlayerStats
}

// Severity → Tailwind class mapping (no strings here — purely visual)
const SEVERITY_STYLE: Record<InfectionHintSeverity, string> = {
  subtle: 'text-text-dim italic',
  noticeable: 'text-warning italic',
  alarming: 'text-danger italic',
  critical: 'text-danger italic animate-flicker',
}

export default function TransformationHint({ stats }: Props) {
  const { LL } = useI18n()

  const infectionHint = getInfectionHint(stats.infection)
  const willHint = getWillHint(stats.will, stats.infection)

  // Resolve to a single active hint — infection takes priority
  const activeText: string | null = infectionHint
    ? LL.hint.infection[infectionHint.severity]()
    : willHint
      ? LL.hint.will[willHint.type]()
      : null

  const activeSeverity = infectionHint?.severity ?? null

  if (!activeText) return null

  return (
    <aside className="mt-8 panel-card border-accent/20">
      <p className="ui-label text-muted text-xs mb-2">◆</p>
      <p
        className={`font-body text-sm leading-relaxed ${
          activeSeverity ? SEVERITY_STYLE[activeSeverity] : 'text-text-dim italic'
        }`}
      >
        {activeText}
      </p>
    </aside>
  )
}
