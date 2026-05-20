import { create } from 'zustand'
import type { GameState, Scene, Ending } from '@/engine/types'
import { applyEffects } from '@/engine/executor'
import { getAvailableChoices } from '@/engine/evaluator'
import { loadScene, loadEndings } from '@/engine/loader'
import { checkForEnding } from '@/engine/endingEvaluator'
import { saveGame, loadGame } from '@/engine/saveManager'
import { DEFAULT_GAME_STATE } from '@/engine/defaults'

interface GameStore {
  // ── State ──────────────────────────────────────────────────────────────────
  gameState: GameState
  currentScene: Scene | null
  availableEndings: Ending[]
  triggeredEnding: Ending | null
  isLoading: boolean
  error: string | null

  // ── Actions ────────────────────────────────────────────────────────────────
  startNewGame: (saveSlot?: number) => Promise<void>
  selectChoice: (choiceId: string) => Promise<void>
  loadFromSave: (slot: number) => Promise<void>
  dismissError: () => void
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: DEFAULT_GAME_STATE,
  currentScene: null,
  availableEndings: [],
  triggeredEnding: null,
  isLoading: false,
  error: null,

  // ── Start a new game ───────────────────────────────────────────────────────
  startNewGame: async (saveSlot = 0) => {
    set({ isLoading: true, error: null })
    try {
      const [firstScene, endings] = await Promise.all([
        loadScene('scene_001'),
        loadEndings(),
      ])

      const freshState: GameState = {
        ...DEFAULT_GAME_STATE,
        saveSlot,
        playthroughId: crypto.randomUUID(),
        visitedScenes: ['scene_001'],
        currentSceneId: 'scene_001',
      }

      // Apply any onEnter effects from the first scene
      const stateAfterEntry = firstScene.onEnter
        ? applyEffects(firstScene.onEnter, freshState)
        : freshState

      saveGame(saveSlot, stateAfterEntry)

      set({
        gameState: stateAfterEntry,
        currentScene: firstScene,
        availableEndings: endings,
        triggeredEnding: null,
        isLoading: false,
      })
    } catch (err) {
      set({ isLoading: false, error: String(err) })
    }
  },

  // ── Player selects a choice ────────────────────────────────────────────────
  selectChoice: async (choiceId: string) => {
    const { gameState, currentScene, availableEndings } = get()
    if (!currentScene) return

    const choice = currentScene.choices.find(c => c.id === choiceId)
    if (!choice) {
      set({ error: `Choice not found: ${choiceId}` })
      return
    }

    // Verify the choice is still valid (guard against stale UI)
    const available = getAvailableChoices(currentScene.choices, gameState)
    if (!available.find(c => c.id === choiceId)) {
      set({ error: 'That choice is no longer available.' })
      return
    }

    set({ isLoading: true, error: null })

    try {
      // 1. Apply choice effects
      let newState = applyEffects(choice.effects, gameState)

      // 2. Record choice in history
      newState = {
        ...newState,
        choiceHistory: [
          ...newState.choiceHistory,
          { sceneId: currentScene.id, choiceId },
        ],
      }

      // 3. Load next scene
      const nextScene = await loadScene(choice.nextSceneId)

      // 4. Apply scene onEnter effects
      if (nextScene.onEnter) {
        newState = applyEffects(nextScene.onEnter, newState)
      }

      // 5. Update scene tracking + game time
      newState = {
        ...newState,
        currentSceneId: nextScene.id,
        gameTime: nextScene.gameTime,
        visitedScenes: [...newState.visitedScenes, nextScene.id],
      }

      // 6. Check for triggered ending
      const triggered = checkForEnding(availableEndings, newState)

      // 7. Auto-save
      saveGame(newState.saveSlot, newState)

      set({
        gameState: newState,
        currentScene: nextScene,
        triggeredEnding: triggered,
        isLoading: false,
      })
    } catch (err) {
      set({ isLoading: false, error: String(err) })
    }
  },

  // ── Load from a save slot ──────────────────────────────────────────────────
  loadFromSave: async (slot: number) => {
    set({ isLoading: true, error: null })
    try {
      const saved = loadGame(slot)
      if (!saved) throw new Error(`No save data found in slot ${slot}`)

      const [scene, endings] = await Promise.all([
        loadScene(saved.currentSceneId),
        loadEndings(),
      ])

      set({
        gameState: saved,
        currentScene: scene,
        availableEndings: endings,
        triggeredEnding: null,
        isLoading: false,
      })
    } catch (err) {
      set({ isLoading: false, error: String(err) })
    }
  },

  dismissError: () => set({ error: null }),
}))
