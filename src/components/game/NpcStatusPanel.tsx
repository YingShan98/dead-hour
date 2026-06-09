import { useI18n } from '@/i18n/useI18n'
import type { LocaleString } from '@/engine/types'
import { resolveLocaleString } from '@/i18n/localeString'

interface NpcEntry {
  name: LocaleString
  status: LocaleString
  colour: string
}

function getPeiEntry(flags: Record<string, boolean>): NpcEntry | null {
  if (flags.pei_alive) {
    return {
      name: { zh: '裴嘉应', en: 'Pei Jiaying' },
      status: { zh: '同行中', en: 'With you' },
      colour: '#4a7c5f',
    }
  }
  if (flags.pei_status_hidden) {
    return {
      name: { zh: '裴嘉应', en: 'Pei Jiaying' },
      status: { zh: '已躲避', en: 'In hiding' },
      colour: '#4a6a8b',
    }
  }
  if (flags.pei_status_trapped_outside) {
    return {
      name: { zh: '裴嘉应', en: 'Pei Jiaying' },
      status: { zh: '受困中', en: 'Trapped' },
      colour: '#c09040',
    }
  }
  if (flags.pei_status_injured_lost) {
    return {
      name: { zh: '裴嘉应', en: 'Pei Jiaying' },
      status: { zh: '失联', en: 'Lost contact' },
      colour: '#a02828',
    }
  }
  return null
}

interface Props {
  flags: Record<string, boolean>
}

export default function NpcStatusPanel({ flags }: Props) {
  const { locale, LL } = useI18n()

  const pei = getPeiEntry(flags)
  if (!pei) return null

  const entries = [pei]

  return (
    <div className="panel-card">
      <p className="ui-label text-muted mb-3">{LL.npcs.label()}</p>
      <div className="flex flex-col gap-2">
        {entries.map((entry) => (
          <div
            key={resolveLocaleString(entry.name, 'zh')}
            className="flex items-center justify-between"
          >
            <span className="font-ui text-xs text-text-dim">
              {resolveLocaleString(entry.name, locale)}
            </span>
            <span className="font-ui text-xs" style={{ color: entry.colour }}>
              {resolveLocaleString(entry.status, locale)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
