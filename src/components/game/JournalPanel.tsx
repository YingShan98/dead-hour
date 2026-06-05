import { useState } from 'react'
import { useI18n } from '@/i18n/useI18n'
import { interpolate } from '@/i18n/interpolate'
import { resolveLocaleString } from '@/i18n/localeString'
import type { JournalEntry } from '@/engine/types'

interface Props {
  entries: JournalEntry[]
}

export default function JournalPanel({ entries }: Props) {
  const [open, setOpen] = useState(false)
  const { LL, locale } = useI18n()

  if (entries.length === 0) return null

  return (
    <div className="panel-card flex flex-col gap-2">
      <button
        type="button"
        className="flex items-center justify-between w-full"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="ui-label text-muted">
          ✎ {LL.journal.label()} ({entries.length})
        </span>
        <span
          className="font-ui text-xs text-muted transition-transform"
          style={{ display: 'inline-block', transform: open ? 'rotate(180deg)' : 'none' }}
        >
          ▼
        </span>
      </button>

      {open && (
        <div className="flex flex-col gap-4 pt-2 border-t border-border">
          {entries.map((entry, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <p className="font-ui text-xs text-accent">
                {interpolate(LL.journal.day, { day: entry.day })}
              </p>
              {resolveLocaleString(entry.text, locale)
                .split('\n\n')
                .map((para, j) => (
                  <p key={j} className="font-body text-xs text-text-dim leading-relaxed">
                    {para}
                  </p>
                ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
