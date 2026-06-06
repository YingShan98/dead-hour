import type { GameState } from './types'
import { applyHungerDay } from './hungerManager'
import { applyColdDay } from './coldManager'
import { applyInfectionEscalationDay } from './infectionManager'

/**
 * Applies all passive daily effects (hunger, cold, infection) for every calendar day
 * that has elapsed since lastProcessedDay. Replaces applyDailyHungerTick in the store.
 */
export function applyDailyTicks(state: GameState): GameState {
  const currentDay = Math.floor(state.gameTime.hoursFromStart / 24)
  if (currentDay <= state.lastProcessedDay) return state

  const daysElapsed = currentDay - state.lastProcessedDay
  let next = { ...state }

  for (let d = 0; d < daysElapsed; d++) {
    const dayBeingProcessed = state.lastProcessedDay + d + 1
    const isLastDay = d === daysElapsed - 1

    next = applyHungerDay(next, isLastDay)
    next = applyColdDay(next, dayBeingProcessed)
    next = applyInfectionEscalationDay(next, dayBeingProcessed)
  }

  return {
    ...next,
    lastProcessedDay: currentDay,
    timeCostToday: 0,
  }
}
