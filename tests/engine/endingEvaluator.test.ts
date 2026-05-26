import { describe, expect, it } from 'vitest'
import { checkForEnding } from '@/engine/endingEvaluator'
import type { Ending, GameState } from '@/engine/types'

function mockState(overrides: Partial<GameState> = {}): GameState {
  return {
    currentSceneId: 'scene_001',
    gameTime: { hoursFromStart: -48 },
    stats: { health: 10, morale: 10, leadership: 0, stealth: 0, trust: 5, infection: 0, will: 5 },
    inventory: [],
    flags: {},
    visitedScenes: [],
    choiceHistory: [],
    security: 0,
    timeRemaining: 12,
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
