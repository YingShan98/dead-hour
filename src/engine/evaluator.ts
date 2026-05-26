import type { ConditionSet, GameState, Choice } from './types'

/**
 * Returns true if the player's current state satisfies all conditions.
 * An empty or undefined condition set always passes.
 */
export function evaluate(conditions: ConditionSet | undefined, state: GameState): boolean {
  if (!conditions) return true

  // ── Flags ──────────────────────────────────────────────────────────────────
  if (conditions.requiredFlags) {
    for (const flag of conditions.requiredFlags) {
      if (!state.flags[flag]) return false
    }
  }
  if (conditions.blockedFlags) {
    for (const flag of conditions.blockedFlags) {
      if (state.flags[flag] === true) return false
    }
  }

  // ── Stats ──────────────────────────────────────────────────────────────────
  if (conditions.requiredStats) {
    for (const req of conditions.requiredStats) {
      const value = state.stats[req.stat]
      if (req.min !== undefined && value < req.min) return false
      if (req.max !== undefined && value > req.max) return false
    }
  }

  // ── Items ──────────────────────────────────────────────────────────────────
  if (conditions.requiredItems) {
    for (const req of conditions.requiredItems) {
      const item = state.inventory.find((i) => i.itemId === req.itemId)
      const qty = item?.quantity ?? 0
      const minQty = req.minQuantity ?? 1
      if (qty < minQty) return false
    }
  }

  // ── Security ───────────────────────────────────────────────────────────────
  if (conditions.security) {
    if (conditions.security.min !== undefined && state.security < conditions.security.min)
      return false
    if (conditions.security.max !== undefined && state.security > conditions.security.max)
      return false
  }

  // ── Time remaining ─────────────────────────────────────────────────────────
  if (conditions.timeRemaining) {
    if (
      conditions.timeRemaining.min !== undefined &&
      state.timeRemaining < conditions.timeRemaining.min
    )
      return false
  }

  return true
}

/**
 * Filters choices to only those the player can currently select.
 * Choices failing conditions are returned separately for locked display.
 */
export function getAvailableChoices(choices: Choice[], state: GameState): Choice[] {
  return choices.filter((choice) => evaluate(choice.conditions, state))
}

export function getLockedChoices(choices: Choice[], state: GameState): Choice[] {
  return choices.filter((c) => !evaluate(c.conditions, state))
}
