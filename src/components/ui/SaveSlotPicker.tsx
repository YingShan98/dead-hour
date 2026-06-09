import { useEffect, useRef, useState } from 'react'
import type { SaveSlotInfo } from '@/engine/saveManager'
import { getGameDayLabel } from '@/engine/timeManager'
import { useI18n } from '@/i18n/useI18n'
import { interpolate } from '@/i18n/interpolate'

interface SaveSlotPickerProps {
  saves: SaveSlotInfo[]
  isLoading: boolean
  onStartNew: (slot: number) => void
  onContinue: (slot: number) => void
  onDelete: (slot: number) => void
  onClose: () => void
}

type ConfirmState = { kind: 'overwrite' | 'delete'; slot: number } | null

export default function SaveSlotPicker({
  saves,
  isLoading,
  onStartNew,
  onContinue,
  onDelete,
  onClose,
}: SaveSlotPickerProps) {
  const { LL } = useI18n()
  const [confirm, setConfirm] = useState<ConfirmState>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    dialogRef.current?.focus()
    return () => prev?.focus()
  }, [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  function formatDayLabel(info: SaveSlotInfo): string {
    if (info.hoursFromStart === undefined) return ''
    const label = getGameDayLabel(info.hoursFromStart)
    switch (label.kind) {
      case 'beforeOutbreak':
        return interpolate(LL.time.beforeOutbreak, { hours: label.hours })
      case 'dayOne':
        return LL.time.dayOne()
      case 'day':
        return interpolate(LL.time.day, { day: label.day })
    }
  }

  function formatDate(savedAt: string): string {
    const d = new Date(savedAt)
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const hh = String(d.getHours()).padStart(2, '0')
    const min = String(d.getMinutes()).padStart(2, '0')
    return `${mm}-${dd} ${hh}:${min}`
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-background/97 backdrop-blur-[2px] flex items-center justify-center px-6 animate-fade-in"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="slot-picker-heading"
        tabIndex={-1}
        className="panel-card max-w-sm w-full flex flex-col gap-4 outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="slot-picker-heading" className="ui-label text-text">
          {LL.title.slots.heading()}
        </h2>

        {saves.map((info) => {
          const dayLabel = info.exists ? formatDayLabel(info) : ''
          const dateLabel = info.exists && info.savedAt ? formatDate(info.savedAt) : ''
          const isConfirming = confirm !== null && confirm.slot === info.slot

          return (
            <div key={info.slot} className="panel-card flex flex-col gap-2">
              <p className="ui-label text-xs">
                {interpolate(LL.save.slot, { slot: info.slot + 1 })}
                {info.exists ? (
                  <span className="text-muted">
                    {' '}
                    — {dayLabel} · {dateLabel}
                  </span>
                ) : (
                  <span className="text-muted"> — {LL.title.slots.empty()}</span>
                )}
              </p>

              {isConfirming && confirm.kind === 'overwrite' && (
                <div className="rounded-lg border border-danger/50 bg-crisis-time p-3 flex flex-col gap-2">
                  <p className="font-ui text-xs text-text-dim">
                    {interpolate(LL.title.slots.confirmOverwrite, {
                      slot: info.slot + 1,
                      day: dayLabel,
                    })}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="choice-btn choice-btn-primary py-2"
                      disabled={isLoading}
                      onClick={() => {
                        onStartNew(info.slot)
                        setConfirm(null)
                      }}
                    >
                      {LL.ui.confirm()}
                    </button>
                    <button
                      type="button"
                      className="choice-btn py-2"
                      onClick={() => setConfirm(null)}
                    >
                      {LL.ui.cancel()}
                    </button>
                  </div>
                </div>
              )}

              {isConfirming && confirm.kind === 'delete' && (
                <div className="rounded-lg border border-danger/50 bg-crisis-time p-3 flex flex-col gap-2">
                  <p className="font-ui text-xs text-text-dim">
                    {interpolate(LL.title.slots.confirmDelete, {
                      slot: info.slot + 1,
                      day: dayLabel,
                    })}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="choice-btn choice-btn-primary py-2"
                      disabled={isLoading}
                      onClick={() => {
                        onDelete(info.slot)
                        setConfirm(null)
                      }}
                    >
                      {LL.ui.confirm()}
                    </button>
                    <button
                      type="button"
                      className="choice-btn py-2"
                      onClick={() => setConfirm(null)}
                    >
                      {LL.ui.cancel()}
                    </button>
                  </div>
                </div>
              )}

              {!isConfirming && !info.exists && (
                <button
                  type="button"
                  className="choice-btn choice-btn-primary"
                  disabled={isLoading}
                  onClick={() => onStartNew(info.slot)}
                >
                  {LL.title.slots.startNew()}
                </button>
              )}

              {!isConfirming && info.exists && (
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    className="choice-btn choice-btn-primary flex-1"
                    disabled={isLoading}
                    onClick={() => onContinue(info.slot)}
                  >
                    {LL.title.slots.continue()}
                  </button>
                  <button
                    type="button"
                    className="choice-btn flex-1"
                    disabled={isLoading}
                    onClick={() => setConfirm({ kind: 'overwrite', slot: info.slot })}
                  >
                    {LL.title.slots.overwrite()}
                  </button>
                  <button
                    type="button"
                    className="choice-btn flex-1 text-accent"
                    disabled={isLoading}
                    onClick={() => setConfirm({ kind: 'delete', slot: info.slot })}
                  >
                    {LL.title.slots.delete()}
                  </button>
                </div>
              )}
            </div>
          )
        })}

        <button type="button" className="choice-btn text-center" onClick={onClose}>
          {LL.ui.cancel()}
        </button>
      </div>
    </div>
  )
}
