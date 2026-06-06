import { describe, it, expect } from 'vitest'
import { applyDailyHungerTick } from '@/engine/hungerManager'
import type { GameState } from '@/engine/types'

function mockState(overrides: Partial<GameState> = {}): GameState {
  return {
    currentSceneId: 'scene_001',
    gameTime: { hoursFromStart: -48 },
    stats: {
      health: 15,
      morale: 10,
      leadership: 0,
      stealth: 0,
      money: 200,
      trust: 5,
      infection: 0,
      will: 6,
      hunger: 0,
    },
    inventory: [],
    flags: {},
    visitedScenes: [],
    choiceHistory: [],
    journalLog: [],
    security: 0,
    lastProcessedDay: -2,
    timeCostToday: 0,
    saveSlot: 0,
    playthroughId: 'test-run',
    ...overrides,
  }
}

describe('applyDailyHungerTick()', () => {
  it('returns state unchanged when day has not advanced', () => {
    const state = mockState({ gameTime: { hoursFromStart: -48 }, lastProcessedDay: -2 })
    expect(applyDailyHungerTick(state)).toBe(state)
  })

  it('adds baseline hunger +1 on a rest day (no timeCost)', () => {
    const state = mockState({ gameTime: { hoursFromStart: 0 }, lastProcessedDay: -1 })
    const result = applyDailyHungerTick(state)
    expect(result.stats.hunger).toBe(1)
  })

  it('adds extra hunger for high-energy day (8 hours timeCost → +2 modifier)', () => {
    const state = mockState({
      gameTime: { hoursFromStart: 0 },
      lastProcessedDay: -1,
      timeCostToday: 8,
    })
    const result = applyDailyHungerTick(state)
    // baseline 1 + floor(8 * 0.25) = 1 + 2 = 3, no food to auto-consume
    expect(result.stats.hunger).toBe(3)
  })

  it('auto-consumes 1 food item and reduces hunger by 2', () => {
    const state = mockState({
      gameTime: { hoursFromStart: 0 },
      lastProcessedDay: -1,
      inventory: [{ itemId: 'canned_food', quantity: 3 }],
    })
    const result = applyDailyHungerTick(state)
    // hunger: 0 + 1 (baseline) - 2 (food) = clamped to 0
    expect(result.stats.hunger).toBe(0)
    expect(result.inventory[0].quantity).toBe(2)
  })

  it('removes food item from inventory when last unit is consumed', () => {
    const state = mockState({
      gameTime: { hoursFromStart: 0 },
      lastProcessedDay: -1,
      inventory: [{ itemId: 'canned_food', quantity: 1 }],
    })
    const result = applyDailyHungerTick(state)
    expect(result.inventory).toHaveLength(0)
  })

  it('applies morale penalty when hunger reaches 6', () => {
    const state = mockState({
      gameTime: { hoursFromStart: 0 },
      lastProcessedDay: -1,
      stats: {
        health: 15,
        morale: 10,
        leadership: 0,
        stealth: 0,
        money: 200,
        trust: 5,
        infection: 0,
        will: 6,
        hunger: 5,
      },
    })
    // hunger goes from 5 → 6 (baseline +1, no food) → penalty: morale -1
    const result = applyDailyHungerTick(state)
    expect(result.stats.hunger).toBe(6)
    expect(result.stats.morale).toBe(9)
  })

  it('applies health and morale penalty when hunger reaches 8', () => {
    const state = mockState({
      gameTime: { hoursFromStart: 0 },
      lastProcessedDay: -1,
      stats: {
        health: 15,
        morale: 10,
        leadership: 0,
        stealth: 0,
        money: 200,
        trust: 5,
        infection: 0,
        will: 6,
        hunger: 7,
      },
    })
    const result = applyDailyHungerTick(state)
    expect(result.stats.hunger).toBe(8)
    expect(result.stats.health).toBe(14)
    expect(result.stats.morale).toBe(9)
  })

  it('applies critical health penalty when hunger is at max (10)', () => {
    const state = mockState({
      gameTime: { hoursFromStart: 0 },
      lastProcessedDay: -1,
      stats: {
        health: 15,
        morale: 10,
        leadership: 0,
        stealth: 0,
        money: 200,
        trust: 5,
        infection: 0,
        will: 6,
        hunger: 9,
      },
    })
    const result = applyDailyHungerTick(state)
    expect(result.stats.hunger).toBe(10)
    expect(result.stats.health).toBe(13)
  })

  it('processes multiple elapsed days with baseline hunger for intermediate days', () => {
    // 3 days elapsed, no food, timeCostToday = 0
    const state = mockState({
      gameTime: { hoursFromStart: 72 }, // day 3
      lastProcessedDay: 0, // last processed was day 0
    })
    const result = applyDailyHungerTick(state)
    // 3 days × +1 baseline = +3 hunger
    expect(result.stats.hunger).toBe(3)
    expect(result.lastProcessedDay).toBe(3)
  })

  it('resets timeCostToday to 0 after tick', () => {
    const state = mockState({
      gameTime: { hoursFromStart: 0 },
      lastProcessedDay: -1,
      timeCostToday: 4,
    })
    const result = applyDailyHungerTick(state)
    expect(result.timeCostToday).toBe(0)
  })

  it('advances lastProcessedDay to current day', () => {
    const state = mockState({
      gameTime: { hoursFromStart: 48 }, // day 2
      lastProcessedDay: 0,
    })
    const result = applyDailyHungerTick(state)
    expect(result.lastProcessedDay).toBe(2)
  })
})
