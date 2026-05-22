import { useGameStore } from '@/store/gameStore'
import type { InventoryItem } from '@/engine/types'
import { useI18n } from '@/i18n/i18n-react'
import { resolveLocaleString } from '@/i18n/localeString'

interface Props {
  inventory: InventoryItem[]
}

export default function InventoryPanel({ inventory }: Props) {
  const itemDefinitions = useGameStore((s) => s.itemDefinitions)
  const { locale } = useI18n()
  const itemMap = Object.fromEntries(itemDefinitions.map((item) => [item.id, item]))

  if (inventory.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <p className="ui-label text-muted">Inventory</p>
        <p className="font-body text-text-dim text-sm italic">Nothing carried.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="ui-label text-muted">Inventory</p>
      <div className="flex flex-col gap-1.5">
        {inventory.map(({ itemId, quantity }) => {
          const def = itemMap[itemId]
          if (!def) return null
          return (
            <div
              key={itemId}
              className="flex justify-between items-center
                         px-3 py-2 rounded border border-border bg-surface"
              title={resolveLocaleString(def.description, locale)}
            >
              <span className="font-body text-sm text-text">{resolveLocaleString(def.label, locale)}</span>
              {def.stackable && <span className="font-ui text-xs text-text-dim">×{quantity}</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
