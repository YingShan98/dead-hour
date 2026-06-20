import { describe, expect, it } from 'vitest'
import { checkForEnding } from '@/engine/endingEvaluator'
import type { Ending, GameState } from '@/engine/types'

function mockState(overrides: Partial<GameState> = {}): GameState {
  return {
    currentSceneId: 'scene_001',
    gameTime: { hoursFromStart: -48 },
    stats: {
      health: 10,
      morale: 10,
      leadership: 0,
      stealth: 0,
      money: 0,
      trust: 5,
      infection: 0,
      will: 5,
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

function ending(overrides: Partial<Ending>): Ending {
  return {
    id: 'ending_default',
    title: { zh: 'Default Ending' },
    type: 'neutral',
    priority: 10,
    conditions: {},
    narrative: [{ zh: 'Done.' }],
    epilogue: null,
    ...overrides,
  }
}

// Shared ending stubs matching production conditions
const COLD_DEATH = ending({
  id: 'ending_cold_death',
  priority: 1.5,
  conditions: {
    requiredStats: [{ stat: 'health', max: 0 }],
    blockedFlags: ['winter_shelter_established', 'base_bunker'],
  },
})

const LAST_STAND_FAIL = ending({
  id: 'ending_last_stand_fail',
  priority: 1.4,
  conditions: {
    requiredFlags: ['day_364_survived'],
    requiredStats: [{ stat: 'health', max: 0 }],
  },
})

const DEATH_HEALTH = ending({
  id: 'ending_death_health',
  priority: 2,
  conditions: { requiredStats: [{ stat: 'health', max: 0 }] },
})

const FORTRESS_SOLO = ending({
  id: 'ending_fortress_solo',
  priority: 6,
  conditions: {
    requiredFlags: ['survived_one_year', 'base_factory'],
    blockedFlags: ['has_group', 'zombie_turning'],
    requiredStats: [
      { stat: 'infection', max: 2 },
      { stat: 'health', min: 1 },
    ],
    securityMin: 80,
  },
})

describe('ending_last_stand_fail', () => {
  it('fires when day_364_survived is set and health is 0', () => {
    const state = mockState({
      stats: { ...mockState().stats, health: 0 },
      flags: { day_364_survived: true },
    })
    expect(checkForEnding([LAST_STAND_FAIL, DEATH_HEALTH], state)?.id).toBe(
      'ending_last_stand_fail',
    )
  })

  it('takes priority over ending_cold_death when both could apply', () => {
    const state = mockState({
      stats: { ...mockState().stats, health: 0 },
      flags: { day_364_survived: true },
    })
    expect(checkForEnding([LAST_STAND_FAIL, COLD_DEATH, DEATH_HEALTH], state)?.id).toBe(
      'ending_last_stand_fail',
    )
  })

  it('does not fire without day_364_survived — falls back to death_health', () => {
    const state = mockState({ stats: { ...mockState().stats, health: 0 } })
    expect(checkForEnding([LAST_STAND_FAIL, DEATH_HEALTH], state)?.id).toBe('ending_death_health')
  })

  it('does not fire when health is above 0', () => {
    const state = mockState({ flags: { day_364_survived: true } })
    expect(checkForEnding([LAST_STAND_FAIL], state)?.id).toBeUndefined()
  })
})

describe('ending_cold_death', () => {
  it('fires when health is 0 and no shelter established', () => {
    const state = mockState({ stats: { ...mockState().stats, health: 0 } })
    expect(checkForEnding([COLD_DEATH, DEATH_HEALTH], state)?.id).toBe('ending_cold_death')
  })

  it('does not fire when winter_shelter_established is set — falls back to death_health', () => {
    const state = mockState({
      stats: { ...mockState().stats, health: 0 },
      flags: { winter_shelter_established: true },
    })
    expect(checkForEnding([COLD_DEATH, DEATH_HEALTH], state)?.id).toBe('ending_death_health')
  })

  it('does not fire when base_bunker is set — falls back to death_health', () => {
    const state = mockState({
      stats: { ...mockState().stats, health: 0 },
      flags: { base_bunker: true },
    })
    expect(checkForEnding([COLD_DEATH, DEATH_HEALTH], state)?.id).toBe('ending_death_health')
  })

  it('does not fire when health is above 0', () => {
    expect(checkForEnding([COLD_DEATH], mockState())?.id).toBeUndefined()
  })
})

describe('ending_fortress_solo', () => {
  function fortressState(overrides: Partial<GameState> = {}): GameState {
    return mockState({
      stats: { ...mockState().stats, health: 5, infection: 1 },
      flags: { survived_one_year: true, base_factory: true },
      security: 80,
      ...overrides,
    })
  }

  it('fires when all conditions are met', () => {
    expect(checkForEnding([FORTRESS_SOLO], fortressState())?.id).toBe('ending_fortress_solo')
  })

  it('does not fire without base_factory', () => {
    expect(
      checkForEnding([FORTRESS_SOLO], fortressState({ flags: { survived_one_year: true } }))?.id,
    ).toBeUndefined()
  })

  it('does not fire with has_group', () => {
    expect(
      checkForEnding(
        [FORTRESS_SOLO],
        fortressState({ flags: { survived_one_year: true, base_factory: true, has_group: true } }),
      )?.id,
    ).toBeUndefined()
  })

  it('does not fire with zombie_turning', () => {
    expect(
      checkForEnding(
        [FORTRESS_SOLO],
        fortressState({
          flags: { survived_one_year: true, base_factory: true, zombie_turning: true },
        }),
      )?.id,
    ).toBeUndefined()
  })

  it('does not fire when security is below 80', () => {
    expect(checkForEnding([FORTRESS_SOLO], fortressState({ security: 79 }))?.id).toBeUndefined()
  })

  it('does not fire when infection exceeds 2', () => {
    expect(
      checkForEnding(
        [FORTRESS_SOLO],
        fortressState({ stats: { ...mockState().stats, health: 5, infection: 3 } }),
      )?.id,
    ).toBeUndefined()
  })
})

describe('checkForEnding()', () => {
  it('returns null when no ending conditions match', () => {
    const endings = [
      ending({
        id: 'ending_low_health',
        conditions: { requiredStats: [{ stat: 'health', max: 0 }] },
      }),
    ]

    expect(checkForEnding(endings, mockState())).toBeNull()
  })

  it('returns the first matching ending by ascending priority', () => {
    const endings = [
      ending({
        id: 'ending_good',
        priority: 20,
        conditions: { requiredStats: [{ stat: 'health', min: 1 }] },
      }),
      ending({
        id: 'ending_bad',
        priority: 1,
        conditions: { requiredStats: [{ stat: 'health', min: 1 }] },
      }),
    ]

    const result = checkForEnding(endings, mockState())

    expect(result?.id).toBe('ending_bad')
  })

  it('does not mutate the input endings order', () => {
    const endings = [
      ending({ id: 'ending_late', priority: 20 }),
      ending({ id: 'ending_early', priority: 1 }),
    ]

    checkForEnding(endings, mockState())

    expect(endings.map((item) => item.id)).toEqual(['ending_late', 'ending_early'])
  })
})
