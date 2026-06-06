import type { GameState, StatKey } from './types'
import { applyEffects } from './executor'
import itemsData from '@/data/items.json'

const FOOD_ITEM_IDS = new Set(itemsData.items.filter((i) => i.category === 'food').map((i) => i.id))

function autoConsumeFood(state: GameState): { state: GameState; consumed: boolean } {
  const idx = state.inventory.findIndex((i) => FOOD_ITEM_IDS.has(i.itemId) && i.quantity > 0)
  if (idx === -1) return { state, consumed: false }
  const next = applyEffects({ items: [{ itemId: state.inventory[idx].itemId, delta: -1 }] }, state)
  return { state: next, consumed: true }
}

function hungerPenalty(hunger: number): Partial<Record<StatKey, number>> {
  if (hunger >= 10) return { health: -2 }
  if (hunger >= 8) return { health: -1, morale: -1 }
  if (hunger >= 6) return { morale: -1 }
  return {}
}

/**
 * Applies one day of hunger logic. Exported for the daily tick orchestrator.
 * isLastDay controls whether the energy modifier from timeCostToday applies.
 */
export function applyHungerDay(state: GameState, isLastDay: boolean): GameState {
  const energyMod = isLastDay ? Math.floor(state.timeCostToday * 0.25) : 0
  const hungerGain = 1 + energyMod

  let hunger = Math.min(10, state.stats.hunger + hungerGain)

  const { state: afterFood, consumed } = autoConsumeFood(state)
  let next = consumed ? afterFood : state
  if (consumed) hunger = Math.max(0, hunger - 2)

  next = { ...next, stats: { ...next.stats, hunger } }

  const penalty = hungerPenalty(hunger)
  if (Object.keys(penalty).length > 0) {
    next = applyEffects({ stats: penalty }, next)
  }

  return next
}

/**
 * Applies one or more daily hunger ticks when the game day advances.
 * Called in the store after gameTime is updated to the next scene's time.
 */
export function applyDailyHungerTick(state: GameState): GameState {
  const currentDay = Math.floor(state.gameTime.hoursFromStart / 24)
  if (currentDay <= state.lastProcessedDay) return state

  const daysElapsed = currentDay - state.lastProcessedDay
  let next = { ...state }

  for (let d = 0; d < daysElapsed; d++) {
    next = applyHungerDay(next, d === daysElapsed - 1)
  }

  return {
    ...next,
    lastProcessedDay: currentDay,
    timeCostToday: 0,
  }
}
