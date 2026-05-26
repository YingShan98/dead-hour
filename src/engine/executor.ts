import type { EffectSet, GameState, StatKey } from './types'
import statsData from '@/data/stats.json'
import { SECURITY_MAX } from './defaults'

const STAT_BOUNDS = Object.fromEntries(
  statsData.stats.map((s) => [s.key, { min: s.min, max: s.max }]),
) as Record<StatKey, { min: number; max: number }>

/**
 * Applies an EffectSet to the current state and returns a NEW state object.
 * Never mutates the input. All numeric values are clamped to valid ranges.
 */
export function applyEffects(effects: EffectSet | undefined, state: GameState): GameState {
  if (!effects) return state

  let next = { ...state }

  // ── Flags ──────────────────────────────────────────────────────────────────
  if (effects.flags && Object.keys(effects.flags).length > 0) {
    next = {
      ...next,
      flags: { ...next.flags, ...effects.flags },
    }
  }

  // ── Stat deltas ────────────────────────────────────────────────────────────
  if (effects.stats && Object.keys(effects.stats).length > 0) {
    const newStats = { ...next.stats }
    for (const [key, delta] of Object.entries(effects.stats)) {
      const k = key as StatKey
      const { min, max } = STAT_BOUNDS[k]
      newStats[k] = Math.min(max, Math.max(min, (newStats[k] ?? 0) + (delta ?? 0)))
    }
    next = { ...next, stats: newStats }
  }

  // ── Inventory ──────────────────────────────────────────────────────────────
  if (effects.items && effects.items.length > 0) {
    let inventory = [...next.inventory]
    for (const effect of effects.items) {
      const idx = inventory.findIndex((i) => i.itemId === effect.itemId)
      if (idx !== -1) {
        const newQty = Math.max(0, inventory[idx].quantity + effect.delta)
        inventory =
          newQty === 0
            ? inventory.filter((i) => i.itemId !== effect.itemId)
            : inventory.map((item, i) => (i === idx ? { ...item, quantity: newQty } : item))
      } else if (effect.delta > 0) {
        inventory.push({ itemId: effect.itemId, quantity: effect.delta })
      }
    }
    next = { ...next, inventory }
  }

  // ── Security delta ─────────────────────────────────────────────────────────
  if (effects.security !== undefined) {
    next = {
      ...next,
      security: Math.min(SECURITY_MAX, Math.max(0, next.security + effects.security)),
    }
  }

  // ── Time cost ──────────────────────────────────────────────────────────────
  if (effects.timeCost !== undefined && effects.timeCost > 0) {
    next = {
      ...next,
      timeRemaining: Math.max(0, next.timeRemaining - effects.timeCost),
    }
  }

  return next
}
