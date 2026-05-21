import type { InventoryItem } from '@/engine/types'
import itemsData from '@/data/items.json'

const ITEM_MAP = Object.fromEntries(itemsData.items.map((item) => [item.id, item]))

interface Props {
  inventory: InventoryItem[]
}

export default function InventoryPanel({ inventory }: Props) {
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
          const def = ITEM_MAP[itemId]
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
