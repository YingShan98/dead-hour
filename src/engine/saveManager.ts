import type { GameState } from './types'

const SAVE_KEY_PREFIX = 'dead-hour:save:'
const SLOT_COUNT = 3

export interface SaveSlotInfo {
  slot: number
  exists: boolean
  savedAt?: string
  sceneId?: string
}

export function saveGame(slot: number, state: GameState): void {
  const key = `${SAVE_KEY_PREFIX}${slot}`
  const payload: GameState = {
    ...state,
    savedAt: new Date().toISOString(),
  }
  localStorage.setItem(key, JSON.stringify(payload))
}

export function loadGame(slot: number): GameState | null {
  const key = `${SAVE_KEY_PREFIX}${slot}`
  const raw = localStorage.getItem(key)
  if (!raw) return null
  try {
    return JSON.parse(raw) as GameState
  } catch {
    console.error(`[saveManager] Failed to parse save slot ${slot}`)
    return null
  }
}

export function listSaves(): SaveSlotInfo[] {
  return Array.from({ length: SLOT_COUNT }, (_, i) => {
    const raw = localStorage.getItem(`${SAVE_KEY_PREFIX}${i}`)
    if (!raw) return { slot: i, exists: false }
    try {
      const state = JSON.parse(raw) as GameState
      return {
        slot: i,
        exists: true,
        savedAt: state.savedAt,
        sceneId: state.currentSceneId,
      }
    } catch {
      return { slot: i, exists: false }
    }
  })
}

export function deleteSave(slot: number): void {
  localStorage.removeItem(`${SAVE_KEY_PREFIX}${slot}`)
}
