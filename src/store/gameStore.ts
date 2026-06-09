import { create } from 'zustand'
import type { GameState, Scene, Ending, Choice } from '@/engine/types'
import { applyEffects } from '@/engine/executor'
import { getAvailableChoices } from '@/engine/evaluator'
import { loadScene, loadEndings } from '@/engine/loader'
import { checkForEnding, getTimeExpiredSceneId } from '@/engine/endingEvaluator'
import { checkCrisisState } from '@/engine/timeManager'
import { applyDailyTicks } from '@/engine/dailyTick'
import { saveGame, loadGame } from '@/engine/saveManager'
import { DEFAULT_GAME_STATE } from '@/engine/defaults'
import { getItemDef } from '@/data/itemRegistry'
import { generateJournalEntry } from '@/engine/journalGenerator'

// ─── Typed error system ───────────────────────────────────────────────────────
//
// The store never holds raw strings — it holds typed keys that the UI
// resolves via LL. This keeps the store free of any localisation dependency.
//
// Keys must exist in both zh/index.ts and en/index.ts under `errors`.

export type StoreErrorKey =
  | 'sceneNotFound' // LL.errors.sceneNotFound      — params: { id }
  | 'saveNotFound' // LL.errors.saveNotFound        — params: { slot }
  | 'choiceUnavailable' // LL.errors.choiceUnavailable   — no params
  | 'noGameLoaded' // LL.errors.noGameLoaded        — no params

export interface StoreError {
  key: StoreErrorKey
  params?: Record<string, string | number>
}

// ─── Store shape ──────────────────────────────────────────────────────────────

interface GameStore {
  // State
  gameState: GameState
  currentScene: Scene | null
  availableEndings: Ending[]
  triggeredEnding: Ending | null
  isLoading: boolean
  error: StoreError | null // typed — UI resolves to string via LL
  pendingChoice: Choice | null
  pendingNextState: GameState | null
  pendingNextScene: Scene | null
  timeJustExpired: boolean
  awakeningJustTriggered: boolean
  isSceneTransitioning: boolean

  // Actions
  startNewGame: (saveSlot?: number) => Promise<void>
  selectChoice: (choiceId: string) => Promise<void>
  useItem: (itemId: string) => void
  loadFromSave: (slot: number) => Promise<void>
  commitChoice: () => Promise<void>
  dismissError: () => void
  clearCrisisFlags: () => void
}

// ─── Store implementation ─────────────────────────────────────────────────────

export const useGameStore = create<GameStore>()((set, get) => ({
  gameState: DEFAULT_GAME_STATE,
  currentScene: null,
  availableEndings: [],
  triggeredEnding: null,
  isLoading: false,
  error: null,
  pendingChoice: null,
  pendingNextState: null,
  pendingNextScene: null,
  timeJustExpired: false,
  awakeningJustTriggered: false,
  isSceneTransitioning: false,

  // ── Start a new game ─────────────────────────────────────────────────────────
  startNewGame: async (saveSlot = 0) => {
    set({ isLoading: true, error: null })
    try {
      const [firstScene, endings] = await Promise.all([loadScene('scene_101'), loadEndings()])

      let freshState: GameState = {
        ...DEFAULT_GAME_STATE,
        saveSlot,
        playthroughId: crypto.randomUUID(),
        visitedScenes: ['scene_101'],
        currentSceneId: 'scene_101',
      }

      if (firstScene.onEnter) {
        freshState = applyEffects(firstScene.onEnter, freshState)
      }

      saveGame(saveSlot, freshState)
      set({
        gameState: freshState,
        currentScene: firstScene,
        availableEndings: endings,
        triggeredEnding: null,
        isLoading: false,
      })
    } catch (err) {
      console.error('[store] startNewGame failed:', err)
      set({ isLoading: false, error: { key: 'sceneNotFound', params: { id: 'scene_101' } } })
    }
  },

  // ── Player selects a choice ──────────────────────────────────────────────────
  selectChoice: async (choiceId: string) => {
    const { gameState, currentScene, availableEndings } = get()
    if (!currentScene) return

    const choice = currentScene.choices.find((c) => c.id === choiceId)
    if (!choice) {
      // Developer error — should never reach a user. Log and surface generic error.
      console.error(`[store] Choice not found: ${choiceId} in scene ${currentScene.id}`)
      set({ error: { key: 'choiceUnavailable' } })
      return
    }

    const available = getAvailableChoices(currentScene.choices, gameState)
    if (!available.find((c) => c.id === choiceId)) {
      set({ error: { key: 'choiceUnavailable' } })
      return
    }

    set({ isLoading: true, error: null, timeJustExpired: false, awakeningJustTriggered: false })

    try {
      // 1. Apply choice effects (stats, flags, items, security, timeCost)
      let newState = applyEffects(choice.effects, gameState)

      // 2. Record choice in history and accumulate daily energy cost
      const choiceTimeCost = choice.effects.timeCost ?? 0
      newState = {
        ...newState,
        timeCostToday: newState.timeCostToday + choiceTimeCost,
        choiceHistory: [
          ...newState.choiceHistory,
          {
            sceneId: currentScene.id,
            choiceId,
            timeCost: choiceTimeCost,
            securityDelta: choice.effects.security ?? 0,
          },
        ],
      }

      // 3. Check crisis state BEFORE loading next scene
      const preCrisis = checkCrisisState(gameState)
      const postCrisis = checkCrisisState(newState)

      // 4. Determine next scene — may be overridden by time expiry
      let nextSceneId = choice.nextSceneId
      if (!preCrisis.timeExpired && postCrisis.timeExpired) {
        nextSceneId = getTimeExpiredSceneId(newState)
      }

      // 5. Auto-set zombie_turning when infection crosses threshold
      if (!newState.flags.zombie_turning && newState.stats.infection >= 8) {
        newState = applyEffects({ flags: { zombie_turning: true } }, newState)
      }

      // 6. Auto-set superpower_awakening when conditions met
      if (postCrisis.awakeningReady && !newState.flags.superpower_awakening) {
        newState = applyEffects({ flags: { superpower_awakening: true } }, newState)
      }

      // 7. Append journal entry the first time wrote_journal is set
      if (!gameState.flags.wrote_journal && newState.flags.wrote_journal) {
        const entry = generateJournalEntry(newState)
        newState = { ...newState, journalLog: [...newState.journalLog, entry] }
      }

      // 7. Load next scene
      const nextScene = await loadScene(nextSceneId)

      // 8. Apply scene onEnter effects
      if (nextScene.onEnter) {
        newState = applyEffects(nextScene.onEnter, newState)
      }

      // 9. Update scene tracking and game time
      // Scene JSON provides a narrative floor — never go backwards in time,
      // but preserve any timeCost accumulation that pushed us past the anchor.
      newState = {
        ...newState,
        currentSceneId: nextScene.id,
        gameTime: {
          hoursFromStart: Math.max(
            newState.gameTime.hoursFromStart,
            nextScene.gameTime.hoursFromStart,
          ),
        },
        visitedScenes: [...newState.visitedScenes, nextScene.id],
      }

      // 9a. Apply daily ticks (hunger, cold, infection) if calendar day has advanced
      newState = applyDailyTicks(newState)

      // 10. Check for triggered ending
      const triggered = checkForEnding(availableEndings, newState)

      // 11. If choice has consequence text, hold state until player taps continue
      if (choice.consequence && choice.consequence.length > 0) {
        set({
          pendingChoice: choice,
          pendingNextState: newState,
          pendingNextScene: nextScene,
          isLoading: false,
        })
        return
      }

      // No consequence text — crossfade then commit
      set({ isLoading: false, isSceneTransitioning: true })
      await new Promise<void>((resolve) => setTimeout(resolve, 350))
      if (!triggered) saveGame(newState.saveSlot, newState)
      set({
        gameState: newState,
        currentScene: nextScene,
        triggeredEnding: triggered,
        pendingChoice: null,
        pendingNextState: null,
        pendingNextScene: null,
        isSceneTransitioning: false,
        timeJustExpired: !preCrisis.timeExpired && postCrisis.timeExpired,
        awakeningJustTriggered: !preCrisis.awakeningReady && postCrisis.awakeningReady,
      })
    } catch (err) {
      console.error('[store] selectChoice failed:', err)
      set({ isLoading: false, error: { key: 'sceneNotFound', params: { id: 'unknown' } } })
    }
  },

  // ── Use an item from inventory ────────────────────────────────────────────────
  //
  // Full implementation:
  // 1. Verify item exists in inventory (quantity >= 1)
  // 2. Look up item definition in itemRegistry
  // 3. Verify item is flagged as usable
  // 4. Apply item's useEffect to game state (heal, morale, infection reduction, etc.)
  // 5. Consume 1 unit from inventory
  // 6. Auto-save
  useItem: (itemId: string) => {
    const { gameState } = get()

    // Guard: item must be in inventory
    const invItem = gameState.inventory.find((i) => i.itemId === itemId)
    if (!invItem || invItem.quantity < 1) return

    // Guard: item must exist in registry and be usable
    const def = getItemDef(itemId)
    if (!def) {
      console.warn(`[store] useItem: unknown item "${itemId}"`)
      return
    }
    if (!def.usable) {
      console.warn(`[store] useItem: "${itemId}" is not a usable item`)
      return
    }
    if (!def.useEffect) {
      console.warn(`[store] useItem: "${itemId}" has no useEffect defined`)
      return
    }

    // Apply the item's effect (health restore, morale, infection reduction, etc.)
    let newState = applyEffects(def.useEffect, gameState)

    // Consume 1 unit from inventory (separate applyEffects call to keep effects clean)
    newState = applyEffects({ items: [{ itemId, delta: -1 }] }, newState)

    saveGame(newState.saveSlot, newState)
    set({ gameState: newState })
  },

  // ── Load from a save slot ─────────────────────────────────────────────────────
  loadFromSave: async (slot: number) => {
    set({ isLoading: true, error: null })
    try {
      const saved = loadGame(slot)
      if (!saved) {
        set({ isLoading: false, error: { key: 'saveNotFound', params: { slot } } })
        return
      }
      const [scene, endings] = await Promise.all([loadScene(saved.currentSceneId), loadEndings()])
      set({
        gameState: saved,
        currentScene: scene,
        availableEndings: endings,
        triggeredEnding: null,
        isLoading: false,
      })
    } catch (err) {
      console.error('[store] loadFromSave failed:', err)
      set({ isLoading: false, error: { key: 'saveNotFound', params: { slot } } })
    }
  },

  // ── Commit consequence display ────────────────────────────────────────────────
  commitChoice: async () => {
    const { pendingNextState, pendingNextScene, availableEndings, gameState } = get()
    if (!pendingNextState || !pendingNextScene) return

    const preCrisis = checkCrisisState(gameState)
    const postCrisis = checkCrisisState(pendingNextState)
    const triggered = checkForEnding(availableEndings, pendingNextState)

    // Dismiss overlay immediately, start scene exit animation
    set({
      pendingChoice: null,
      pendingNextState: null,
      pendingNextScene: null,
      isSceneTransitioning: true,
    })
    await new Promise<void>((resolve) => setTimeout(resolve, 350))

    if (!triggered) saveGame(pendingNextState.saveSlot, pendingNextState)
    set({
      gameState: pendingNextState,
      currentScene: pendingNextScene,
      triggeredEnding: triggered,
      isSceneTransitioning: false,
      timeJustExpired: !preCrisis.timeExpired && postCrisis.timeExpired,
      awakeningJustTriggered: !preCrisis.awakeningReady && postCrisis.awakeningReady,
    })
  },

  dismissError: () => set({ error: null }),
  clearCrisisFlags: () => set({ timeJustExpired: false, awakeningJustTriggered: false }),
}))
