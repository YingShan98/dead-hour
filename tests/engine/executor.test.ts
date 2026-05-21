import { describe, it, expect } from 'vitest'
import { applyEffects } from '@/engine/executor'
import type { GameState } from '@/engine/types'

function mockState(overrides: Partial<GameState> = {}): GameState {
  return {
    currentSceneId: 'scene_001',
    gameTime: { hoursFromStart: -48 },
    stats: { health: 10, morale: 10, leadership: 0, stealth: 0, trust: 5 },
    inventory: [],
    flags: {},
    visitedScenes: [],
    choiceHistory: [],
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

  it('sets flags correctly', () => {
    const state = mockState()
    const result = applyEffects({ flags: { npc_met_doctor: true } }, state)
    expect(result.flags.npc_met_doctor).toBe(true)
  })

  it('explicitly sets a flag to false (unset)', () => {
    const state = mockState({ flags: { npc_met_doctor: true } })
    const result = applyEffects({ flags: { npc_met_doctor: false } }, state)
    expect(result.flags.npc_met_doctor).toBe(false)
  })

  it('does not mutate original state', () => {
    const state = mockState()
    applyEffects({ flags: { npc_met_doctor: true } }, state)
    expect(state.flags.npc_met_doctor).toBeUndefined()
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
})
