/**
 * itemRegistry.ts
 *
 * Single synchronous source of truth for item definitions.
 * Imported by both the store (useItem) and UI components (InventoryPanel).
 *
 * Note on localisation: item `label` and `description` are currently plain
 * strings in items.json. They will be migrated to LocaleString when full
 * English translation begins. Track with: items_i18n_migration flag.
 */

import itemsData from './items.json'
import type { ItemDefinition } from '@/engine/types'

// Build the registry once at module load time — O(1) lookups
const REGISTRY = new Map<string, ItemDefinition>(
  (itemsData.items as ItemDefinition[]).map((item) => [item.id, item]),
)

/**
 * Returns the full definition for an item, or undefined if not found.
 * Used by the store to apply useEffect on item use.
 */
export function getItemDef(itemId: string): ItemDefinition | undefined {
  return REGISTRY.get(itemId)
}

/**
 * Returns all item definitions. Used by UI components for display.
 */
export function getAllItemDefs(): ItemDefinition[] {
  return Array.from(REGISTRY.values())
}

/**
 * Checks whether an item exists in the registry.
 */
export function isKnownItem(itemId: string): boolean {
  return REGISTRY.has(itemId)
}
