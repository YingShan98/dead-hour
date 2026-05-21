import { beforeEach, describe, expect, it } from 'vitest'
import { deleteSave, listSaves, loadGame, saveGame } from '@/engine/saveManager'
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

describe('saveManager', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('saves and loads a game state', () => {
    const state = mockState({ currentSceneId: 'scene_002', saveSlot: 1 })

    saveGame(1, state)

    const loaded = loadGame(1)
    expect(loaded?.currentSceneId).toBe('scene_002')
    expect(loaded?.saveSlot).toBe(1)
    expect(loaded?.savedAt).toEqual(expect.any(String))
  })

  it('returns null when a save slot is empty', () => {
    expect(loadGame(0)).toBeNull()
  })

  it('returns null for corrupted save data', () => {
    localStorage.setItem('dead-hour:save:0', '{broken')

    expect(loadGame(0)).toBeNull()
  })

  it('lists save slot metadata', () => {
    saveGame(2, mockState({ currentSceneId: 'scene_003', saveSlot: 2 }))

    expect(listSaves()).toEqual([
      { slot: 0, exists: false },
      { slot: 1, exists: false },
      {
        slot: 2,
        exists: true,
        savedAt: expect.any(String),
        sceneId: 'scene_003',
      },
    ])
  })

  it('deletes save data from a slot', () => {
    saveGame(0, mockState())

    deleteSave(0)

    expect(loadGame(0)).toBeNull()
  })
})
