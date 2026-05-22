import type { ConditionSet, GameState, Choice } from './types'

/**
 * Returns true if the player's current state satisfies all conditions.
 * An empty or undefined condition set always passes.
 */
export function evaluate(conditions: ConditionSet | undefined, state: GameState): boolean {
  if (!conditions) return true

  // All stat requirements must pass
  if (conditions.requiredStats) {
    for (const req of conditions.requiredStats) {
      const value = state.stats[req.stat]
      if (req.min !== undefined && value < req.min) return false
      if (req.max !== undefined && value > req.max) return false
    }
  }

  // All item requirements must pass
  if (conditions.requiredItems) {
    for (const req of conditions.requiredItems) {
      const item = state.inventory.find((i) => i.itemId === req.itemId)
      const qty = item?.quantity ?? 0
      const minQty = req.minQuantity ?? 1
      if (qty < minQty) return false
    }
  }

  return true
}

/**
 * Filters a list of choices to only those available to the player right now.
 */
export function getAvailableChoices(choices: Choice[], state: GameState): Choice[] {
  return choices.filter((choice) => evaluate(choice.conditions, state))
}
