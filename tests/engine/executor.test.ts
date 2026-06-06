import { describe, it, expect } from 'vitest'
import { applyEffects } from '@/engine/executor'
import type { GameState } from '@/engine/types'

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

describe('applyEffects()', () => {
  it('returns same state for undefined effects', () => {
    const state = mockState()
    expect(applyEffects(undefined, state)).toBe(state)
  })

  it('applies positive stat delta', () => {
    const state = mockState()
    const result = applyEffects({ stats: { leadership: 2 } }, state)
    expect(result.stats.leadership).toBe(2)
  })

  it('applies negative stat delta', () => {
    const state = mockState()
    const result = applyEffects({ stats: { health: -3 } }, state)
    expect(result.stats.health).toBe(7)
  })

  it('clamps stat at minimum (0)', () => {
    const state = mockState()
    const result = applyEffects({ stats: { health: -999 } }, state)
    expect(result.stats.health).toBe(0)
  })

  it('clamps stat at maximum (20)', () => {
    const state = mockState()
    const result = applyEffects({ stats: { health: 999 } }, state)
    expect(result.stats.health).toBe(20)
  })

  it('adds a new item to inventory', () => {
    const state = mockState()
    const result = applyEffects({ items: [{ itemId: 'medkit', delta: 2 }] }, state)
    expect(result.inventory).toHaveLength(1)
    expect(result.inventory[0]).toEqual({ itemId: 'medkit', quantity: 2 })
  })

  it('increases quantity of existing item', () => {
    const state = mockState({ inventory: [{ itemId: 'medkit', quantity: 1 }] })
    const result = applyEffects({ items: [{ itemId: 'medkit', delta: 2 }] }, state)
    expect(result.inventory[0].quantity).toBe(3)
  })

  it('removes item when quantity reaches 0', () => {
    const state = mockState({ inventory: [{ itemId: 'medkit', quantity: 1 }] })
    const result = applyEffects({ items: [{ itemId: 'medkit', delta: -1 }] }, state)
    expect(result.inventory).toHaveLength(0)
  })

  it('does not allow negative item quantities', () => {
    const state = mockState({ inventory: [{ itemId: 'medkit', quantity: 1 }] })
    const result = applyEffects({ items: [{ itemId: 'medkit', delta: -999 }] }, state)
    expect(result.inventory).toHaveLength(0)
  })

  it('applies money deduction', () => {
    const state = mockState({
      stats: {
        health: 10,
        morale: 10,
        leadership: 0,
        stealth: 0,
        money: 185,
        trust: 5,
        infection: 0,
        will: 5,
        hunger: 0,
      },
    })
    const result = applyEffects({ stats: { money: -30 } }, state)
    expect(result.stats.money).toBe(155)
  })

  it('clamps money at minimum (0)', () => {
    const state = mockState({
      stats: {
        health: 10,
        morale: 10,
        leadership: 0,
        stealth: 0,
        money: 10,
        trust: 5,
        infection: 0,
        will: 5,
        hunger: 0,
      },
    })
    const result = applyEffects({ stats: { money: -999 } }, state)
    expect(result.stats.money).toBe(0)
  })

  it('clamps money at maximum (200)', () => {
    const state = mockState()
    const result = applyEffects({ stats: { money: 999 } }, state)
    expect(result.stats.money).toBe(200)
  })

  it('timeCost advances hoursFromStart', () => {
    const state = mockState({ gameTime: { hoursFromStart: -36 } })
    const result = applyEffects({ timeCost: 2 }, state)
    expect(result.gameTime.hoursFromStart).toBe(-34)
  })

  it('timeCost zero does not change hoursFromStart', () => {
    const state = mockState({ gameTime: { hoursFromStart: -36 } })
    const result = applyEffects({ timeCost: 0 }, state)
    expect(result.gameTime.hoursFromStart).toBe(-36)
  })
})
