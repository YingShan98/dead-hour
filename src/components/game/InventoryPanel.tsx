import { useI18n } from '@/i18n/useI18n'
import { interpolate } from '@/i18n/interpolate'
import type { InventoryItem } from '@/engine/types'
import { getItemDef } from '@/data/itemRegistry'
import { resolveLocaleString } from '@/i18n/localeString'
import { useGameStore } from '@/store/gameStore'

interface Props {
  inventory: InventoryItem[]
}

export default function InventoryPanel({ inventory }: Props) {
  const { LL, locale } = useI18n()
  const { useItem: activateItem } = useGameStore()

  if (inventory.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <p className="ui-label text-muted">{LL.inventory.label()}</p>
        <p className="font-body text-text-dim text-sm italic">{LL.inventory.empty()}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="ui-label text-muted">{LL.inventory.label()}</p>
      <div className="flex flex-col gap-1.5">
        {inventory.map(({ itemId, quantity }) => {
          const def = getItemDef(itemId)
          if (!def) return null

          return (
            <div
              key={itemId}
              className="flex justify-between items-center
                         px-3 py-2 rounded border border-border bg-surface
                         group"
              title={resolveLocaleString(def.description, locale)}
            >
              {/* Label + quantity */}
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-body text-sm text-text truncate">
                  {resolveLocaleString(def.label, locale)}
                </span>
                {def.stackable && (
                  <span className="font-ui text-xs text-text-dim shrink-0">
                    {interpolate(LL.inventory.quantity, { qty: quantity })}
                  </span>
                )}
              </div>

              {/* Use button — only for usable items */}
              {def.usable && def.useEffect && (
                <button
                  type="button"
                  onClick={() => activateItem(itemId)}
                  className="ml-2 shrink-0 font-ui text-xs px-2.5 py-1 rounded-md
                             border border-border text-muted
                             hover:border-accent hover:text-accent hover:bg-[#1a1010]
                             transition-colors"
                  title={resolveLocaleString(def.description, locale)}
                >
                  {LL.inventory.use()}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
