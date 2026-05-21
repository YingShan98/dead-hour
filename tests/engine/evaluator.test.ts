import { describe, it, expect } from 'vitest'
import { evaluate, getAvailableChoices } from '@/engine/evaluator'
import type { GameState, Choice } from '@/engine/types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mockState(overrides: Partial<GameState> = {}): GameState {
  return {
    currentSceneId: 'scene_001',
    gameTime: { hoursFromStart: -48 },
    stats: {
      health: 10,
      morale: 10,
      leadership: 0,
      stealth: 0,
      trust: 5,
    },
    inventory: [],
    flags: {},
    visitedScenes: [],
    choiceHistory: [],
    saveSlot: 0,
    playthroughId: 'test-run',
    ...overrides,
  }
}

// ─── evaluate() ──────────────────────────────────────────────────────────────

describe('evaluate()', () => {
  it('returns true for empty conditions', () => {
    expect(evaluate({}, mockState())).toBe(true)
  })

  it('returns true for undefined conditions', () => {
    expect(evaluate(undefined, mockState())).toBe(true)
  })

  it('passes when all required flags are present', () => {
    const state = mockState({ flags: { npc_met_doctor: true, info_searched_details: true } })
    expect(evaluate({ requiredFlags: ['npc_met_doctor', 'info_searched_details'] }, state)).toBe(true)
  })

  it('fails when a required flag is missing', () => {
    const state = mockState({ flags: { npc_met_doctor: true } })
    expect(evaluate({ requiredFlags: ['npc_met_doctor', 'info_searched_details'] }, state)).toBe(false)
  })

  it('fails when a required flag is explicitly false', () => {
    const state = mockState({ flags: { npc_met_doctor: false } })
    expect(evaluate({ requiredFlags: ['npc_met_doctor'] }, state)).toBe(false)
  })

  it('passes when no blocked flags are set', () => {
    const state = mockState({ flags: {} })
    expect(evaluate({ blockedFlags: ['faction_betrayed_militia'] }, state)).toBe(true)
  })

  it('passes when a blocked flag is explicitly false', () => {
    const state = mockState({ flags: { faction_betrayed_militia: false } })
    expect(evaluate({ blockedFlags: ['faction_betrayed_militia'] }, state)).toBe(true)
  })

  it('fails when a blocked flag is set to true', () => {
    const state = mockState({ flags: { faction_betrayed_militia: true } })
    expect(evaluate({ blockedFlags: ['faction_betrayed_militia'] }, state)).toBe(false)
  })

  it('passes stat minimum check', () => {
    const state = mockState({
      stats: { health: 10, morale: 10, leadership: 5, stealth: 0, trust: 5 },
    })
    expect(evaluate({ requiredStats: [{ stat: 'leadership', min: 5 }] }, state)).toBe(true)
  })

  it('fails stat minimum check when below threshold', () => {
    const state = mockState({
      stats: { health: 10, morale: 10, leadership: 3, stealth: 0, trust: 5 },
    })
    expect(evaluate({ requiredStats: [{ stat: 'leadership', min: 5 }] }, state)).toBe(false)
  })

  it('passes stat maximum check', () => {
    const state = mockState({
      stats: { health: 0, morale: 10, leadership: 0, stealth: 0, trust: 5 },
    })
    expect(evaluate({ requiredStats: [{ stat: 'health', max: 0 }] }, state)).toBe(true)
  })

  it('fails stat maximum check when above threshold', () => {
    const state = mockState({
      stats: { health: 5, morale: 10, leadership: 0, stealth: 0, trust: 5 },
    })
    expect(evaluate({ requiredStats: [{ stat: 'health', max: 0 }] }, state)).toBe(false)
  })

  it('passes item quantity check', () => {
    const state = mockState({ inventory: [{ itemId: 'medkit', quantity: 2 }] })
    expect(evaluate({ requiredItems: [{ itemId: 'medkit', minQuantity: 1 }] }, state)).toBe(true)
  })

  it('fails item check when item is absent', () => {
    const state = mockState({ inventory: [] })
    expect(evaluate({ requiredItems: [{ itemId: 'medkit' }] }, state)).toBe(false)
  })
})

// ─── getAvailableChoices() ────────────────────────────────────────────────────

describe('getAvailableChoices()', () => {
  const choices: Choice[] = [
    {
      id: 'choice_a',
      text: 'Always available',
      conditions: {},
      effects: {},
      nextSceneId: 'scene_002',
    },
    {
      id: 'choice_b',
      text: 'Requires leadership 3',
      conditions: { requiredStats: [{ stat: 'leadership', min: 3 }] },
      effects: {},
      nextSceneId: 'scene_002',
    },
  ]

  it('returns only choices the player qualifies for', () => {
    const state = mockState()
    const available = getAvailableChoices(choices, state)
    expect(available).toHaveLength(1)
    expect(available[0].id).toBe('choice_a')
  })

  it('returns all choices when all conditions are met', () => {
    const state = mockState({
      stats: { health: 10, morale: 10, leadership: 5, stealth: 0, trust: 5 },
    })
    const available = getAvailableChoices(choices, state)
    expect(available).toHaveLength(2)
  })
})
