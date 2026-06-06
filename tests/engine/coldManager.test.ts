import { describe, it, expect } from 'vitest'
import { applyColdDay } from '@/engine/coldManager'
import type { GameState } from '@/engine/types'

function mockState(overrides: Partial<GameState> = {}): GameState {
  return {
    currentSceneId: 'scene_001',
    gameTime: { hoursFromStart: 0 },
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
    lastProcessedDay: 0,
    timeCostToday: 0,
    saveSlot: 0,
    playthroughId: 'test-run',
    ...overrides,
  }
}

describe('applyColdDay()', () => {
  it('returns state unchanged before Day 60', () => {
    const state = mockState()
    expect(applyColdDay(state, 59)).toBe(state)
  })

  it('returns state unchanged when winter_shelter_established', () => {
    const state = mockState({ flags: { winter_shelter_established: true } })
    expect(applyColdDay(state, 60)).toBe(state)
  })

  it('returns state unchanged when base_bunker', () => {
    const state = mockState({ flags: { base_bunker: true } })
    expect(applyColdDay(state, 60)).toBe(state)
  })

  it('drains health every 3 days when base_factory', () => {
    const base = mockState({ flags: { base_factory: true } })
    // Day 60 % 3 === 0 → damage
    const hit = applyColdDay(base, 60)
    expect(hit.stats.health).toBe(14)
    // Day 61 % 3 !== 0 → no damage
    expect(applyColdDay(base, 61)).toBe(base)
    // Day 63 % 3 === 0 → damage
    expect(applyColdDay(base, 63).stats.health).toBe(14)
  })

  it('drains health every 3 days when base_farm', () => {
    const base = mockState({ flags: { base_farm: true } })
    expect(applyColdDay(base, 60).stats.health).toBe(14)
    expect(applyColdDay(base, 61)).toBe(base)
  })

  it('drains health every day when no shelter', () => {
    const state = mockState()
    const result = applyColdDay(state, 61) // odd day — no morale hit
    expect(result.stats.health).toBe(14)
    expect(result.stats.morale).toBe(10)
  })

  it('drains health and morale on even days when no shelter', () => {
    const state = mockState()
    const result = applyColdDay(state, 60) // even day — morale hit
    expect(result.stats.health).toBe(14)
    expect(result.stats.morale).toBe(9)
  })
})
