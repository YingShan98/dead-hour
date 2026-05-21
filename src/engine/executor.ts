import type { EffectSet, GameState, StatKey } from './types'

// Stat boundaries — kept in sync with stats.json
const STAT_BOUNDS: Record<StatKey, { min: number; max: number }> = {
  health: { min: 0, max: 20 },
  morale: { min: 0, max: 20 },
  leadership: { min: 0, max: 20 },
  stealth: { min: 0, max: 20 },
  trust: { min: 0, max: 20 },
}

/**
 * Applies an EffectSet to the current state and returns a NEW state object.
 * Never mutates the input state.
 */
export function applyEffects(effects: EffectSet | undefined, state: GameState): GameState {
  if (!effects) return state

  let newState = { ...state }

  // Apply flag changes
  if (effects.flags && Object.keys(effects.flags).length > 0) {
    newState = {
      ...newState,
      flags: { ...newState.flags, ...effects.flags },
    }
  }

  // Apply stat deltas, clamped to valid range
  if (effects.stats && Object.keys(effects.stats).length > 0) {
    const newStats = { ...newState.stats }
    for (const [key, delta] of Object.entries(effects.stats)) {
      const statKey = key as StatKey
      const { min, max } = STAT_BOUNDS[statKey]
      const current = newStats[statKey]
      newStats[statKey] = Math.min(max, Math.max(min, current + (delta ?? 0)))
    }
    newState = { ...newState, stats: newStats }
  }

  // Apply inventory changes
  if (effects.items && effects.items.length > 0) {
    let inventory = [...newState.inventory]
    for (const effect of effects.items) {
      const existingIndex = inventory.findIndex((i) => i.itemId === effect.itemId)
      if (existingIndex !== -1) {
        const newQty = Math.max(0, inventory[existingIndex].quantity + effect.delta)
        if (newQty === 0) {
          inventory = inventory.filter((i) => i.itemId !== effect.itemId)
        } else {
          inventory = inventory.map((item, idx) =>
            idx === existingIndex ? { ...item, quantity: newQty } : item,
          )
        }
      } else if (effect.delta > 0) {
        inventory.push({ itemId: effect.itemId, quantity: effect.delta })
      }
    }
    newState = { ...newState, inventory }
  }

  return newState
}
