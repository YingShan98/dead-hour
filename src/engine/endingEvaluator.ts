import type { Ending, GameState } from './types'
import { evaluate } from './evaluator'
import { SECURITY_FORTRESS_THRESHOLD } from './defaults'

/**
 * Evaluates endings against current game state.
 * Endings are sorted by priority ascending — bad endings fire before good ones.
 * Returns the first triggered ending, or null if none apply.
 */
export function checkForEnding(endings: Ending[], state: GameState): Ending | null {
  const sorted = [...endings].sort((a, b) => a.priority - b.priority)
  for (const ending of sorted) {
    if (!evaluate(ending.conditions, state)) continue

    // Extra security checks on endings (EndingConditionSet)
    if (ending.conditions.securityMin !== undefined) {
      if (state.security < ending.conditions.securityMin) continue
    }

    if (ending.conditions.securityMax !== undefined) {
      if (state.security > ending.conditions.securityMax) continue
    }

    return ending
  }
  return null
}

/**
 * Returns the id of the scene to route to when time expires.
 * Called by the store whenever timeRemaining hits 0.
 */
export function getTimeExpiredSceneId(state: GameState): string {
  const { infection } = state.stats

  // Zombie turning → crisis arrival feels different
  if (infection >= 8) return 'scene_crisis_turning'

  // Normal arrival of infected
  return 'scene_crisis_arrival'
}

/**
 * Checks whether the fortress-irony condition is now permanently available.
 * Used as a soft signal to the store — the actual ending is in endings.json.
 */
export function isFortressIronyAvailable(state: GameState): boolean {
  return (
    state.stats.infection >= 8 &&
    state.security >= SECURITY_FORTRESS_THRESHOLD &&
    !!state.flags.zombie_turning
  )
}
