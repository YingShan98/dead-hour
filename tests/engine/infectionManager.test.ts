import { describe, it, expect } from 'vitest'
import { applyInfectionEscalationDay } from '@/engine/infectionManager'
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
      infection: 2,
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

describe('applyInfectionEscalationDay()', () => {
  it('returns state unchanged before Day 30', () => {
    const state = mockState({ flags: { wound_ignored: true } })
    expect(applyInfectionEscalationDay(state, 29)).toBe(state)
  })

  it('returns state unchanged when wound_ignored is not set', () => {
    const state = mockState()
    expect(applyInfectionEscalationDay(state, 35)).toBe(state)
  })

  it('returns state unchanged when wound_cleaned suppresses escalation', () => {
    const state = mockState({ flags: { wound_ignored: true, wound_cleaned: true } })
    expect(applyInfectionEscalationDay(state, 35)).toBe(state)
  })

  it('returns state unchanged on non-interval days', () => {
    const state = mockState({ flags: { wound_ignored: true } })
    // Day 31: 31 % 7 = 3 → no tick
    expect(applyInfectionEscalationDay(state, 31)).toBe(state)
  })

  it('escalates infection by 1 every 7 days starting at Day 35', () => {
    const state = mockState({ flags: { wound_ignored: true } })
    // Day 35: 35 % 7 === 0 → escalate
    const result = applyInfectionEscalationDay(state, 35)
    expect(result.stats.infection).toBe(3)
  })

  it('escalates on day 42 as well', () => {
    const state = mockState({ flags: { wound_ignored: true } })
    expect(applyInfectionEscalationDay(state, 42).stats.infection).toBe(3)
  })

  it('clamps infection at max (10)', () => {
    const state = mockState({
      flags: { wound_ignored: true },
      stats: {
        health: 15,
        morale: 10,
        leadership: 0,
        stealth: 0,
        money: 200,
        trust: 5,
        infection: 10,
        will: 6,
        hunger: 0,
      },
    })
    expect(applyInfectionEscalationDay(state, 35).stats.infection).toBe(10)
  })
})
