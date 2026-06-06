import type { GameState, StatKey } from './types'
import { applyEffects } from './executor'

const COLD_START_DAY = 60

/**
 * Applies one day of cold damage when winter is active (Day 60+).
 *
 * Heating quality by base type:
 *   winter_shelter_established or base_bunker → no damage (adequate heat)
 *   base_factory or base_farm                → health -1 every 3 days (improvised heat)
 *   no base / no shelter                     → health -1/day + morale -1 every 2 days
 */
export function applyColdDay(state: GameState, day: number): GameState {
  if (day < COLD_START_DAY) return state
  if (state.flags.winter_shelter_established || state.flags.base_bunker) return state

  const hasBase = state.flags.base_factory || state.flags.base_farm

  if (hasBase) {
    // Improvised heating — damage every 3 days
    if (day % 3 !== 0) return state
    return applyEffects({ stats: { health: -1 } }, state)
  }

  // No shelter — daily health drain, morale hit every other day
  const stats: Partial<Record<StatKey, number>> = { health: -1 }
  if (day % 2 === 0) stats.morale = -1
  return applyEffects({ stats }, state)
}
