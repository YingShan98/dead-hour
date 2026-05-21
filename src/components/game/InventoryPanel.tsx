import { useGameStore } from '@/store/gameStore'
import { useI18nContext } from '@/i18n/i18n-react'
import type { InventoryItem } from '@/engine/types'

interface Props {
  inventory: InventoryItem[]
}

export default function InventoryPanel({ inventory }: Props) {
  const { LL } = useI18nContext()
  const itemDefinitions = useGameStore((s) => s.itemDefinitions)
  const itemMap = Object.fromEntries(itemDefinitions.map((item) => [item.id, item]))

  if (inventory.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <p className="ui-label text-muted">{LL.inventoryLabel()}</p>
        <p className="font-body text-text-dim text-sm italic">{LL.nothingCarried()}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="ui-label text-muted">{LL.inventoryLabel()}</p>
      <div className="flex flex-col gap-1.5">
        {inventory.map(({ itemId, quantity }) => {
          const def = itemMap[itemId]
          if (!def) return null
          return (
            <div
              key={itemId}
              className="flex justify-between items-center
                         px-3 py-2 rounded border border-border bg-surface"
              title={def.description}
            >
              <span className="font-body text-sm text-text">{def.label}</span>
              {def.stackable && <span className="font-ui text-xs text-text-dim">×{quantity}</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
