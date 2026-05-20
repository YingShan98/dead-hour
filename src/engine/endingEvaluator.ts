import type { Ending, GameState } from './types'
import { evaluate } from './evaluator'

/**
 * Returns the first ending whose conditions are met, or null if none apply.
 * Endings are sorted by priority ascending — lower priority checked first.
 * Bad endings (priority 1–9) are caught before good endings (priority 10+).
 */
export function checkForEnding(endings: Ending[], state: GameState): Ending | null {
  const sorted = [...endings].sort((a, b) => a.priority - b.priority)
  for (const ending of sorted) {
    if (evaluate(ending.conditions, state)) {
      return ending
    }
  }
  return null
}
