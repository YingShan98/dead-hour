import type { GameState } from './types'
import { applyEffects } from './executor'

const ESCALATION_START_DAY = 30
const ESCALATION_INTERVAL = 7 // days between passive infection ticks

/**
 * Applies passive infection escalation for one day (Day 30+).
 *
 * Fires every 7 days when wound_ignored is set and wound_cleaned is not.
 * Players counter this through item use (antibiotics reduce infection via useItem).
 */
export function applyInfectionEscalationDay(state: GameState, day: number): GameState {
  if (day < ESCALATION_START_DAY) return state
  if (!state.flags.wound_ignored) return state
  if (state.flags.wound_cleaned) return state
  if (day % ESCALATION_INTERVAL !== 0) return state

  return applyEffects({ stats: { infection: 1 } }, state)
}
