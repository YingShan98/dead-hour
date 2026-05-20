# 03 — Game Engine Specification
### Dead Hour | Engine Logic

The engine is the heart of the game. It lives entirely in `src/engine/` and is made up of **pure TypeScript functions** — no React, no DOM, no side effects. This makes it independently testable and easy to reason about.

---

## Engine Modules

### 1. `evaluator.ts` — Condition Evaluation

Determines whether a condition set is satisfied given the current game state.

```typescript
// src/engine/evaluator.ts

import type { ConditionSet, GameState } from './types';

/**
 * Returns true if the player's current state satisfies all conditions.
 */
export function evaluate(conditions: ConditionSet, state: GameState): boolean {
  if (!conditions) return true;

  // Check required flags (all must be true)
  if (conditions.requiredFlags) {
    for (const flag of conditions.requiredFlags) {
      if (!state.flags[flag]) return false;
    }
  }

  // Check blocked flags (all must be false/absent)
  if (conditions.blockedFlags) {
    for (const flag of conditions.blockedFlags) {
      if (state.flags[flag] === true) return false;
    }
  }

  // Check stat requirements
  if (conditions.requiredStats) {
    for (const req of conditions.requiredStats) {
      const value = state.stats[req.stat];
      if (req.min !== undefined && value < req.min) return false;
      if (req.max !== undefined && value > req.max) return false;
    }
  }

  // Check item requirements
  if (conditions.requiredItems) {
    for (const req of conditions.requiredItems) {
      const item = state.inventory.find(i => i.itemId === req.itemId);
      const qty = item?.quantity ?? 0;
      const minQty = req.minQuantity ?? 1;
      if (qty < minQty) return false;
    }
  }

  return true;
}

/**
 * Filters a list of choices to only those the player can currently select.
 */
export function getAvailableChoices(choices: Choice[], state: GameState): Choice[] {
  return choices.filter(choice => evaluate(choice.conditions, state));
}
```

---

### 2. `executor.ts` — Effect Application

Applies the effects of a choice or scene entry to the game state. Returns a **new state object** (immutable update pattern).

```typescript
// src/engine/executor.ts

import type { EffectSet, GameState, StatKey } from './types';
import { STAT_DEFINITIONS } from '../data/stats';  // loaded from stats.json

/**
 * Applies an EffectSet to the current state and returns a new state.
 * Never mutates the input state.
 */
export function applyEffects(effects: EffectSet, state: GameState): GameState {
  if (!effects) return state;

  let newState = { ...state };

  // Apply flag changes
  if (effects.flags) {
    newState = {
      ...newState,
      flags: { ...newState.flags, ...effects.flags }
    };
  }

  // Apply stat changes (clamped to min/max)
  if (effects.stats) {
    const newStats = { ...newState.stats };
    for (const [key, delta] of Object.entries(effects.stats)) {
      const statKey = key as StatKey;
      const def = STAT_DEFINITIONS[statKey];
      const current = newStats[statKey];
      newStats[statKey] = Math.min(def.max, Math.max(def.min, current + delta));
    }
    newState = { ...newState, stats: newStats };
  }

  // Apply inventory changes
  if (effects.items) {
    let inventory = [...newState.inventory];
    for (const effect of effects.items) {
      const existing = inventory.find(i => i.itemId === effect.itemId);
      if (existing) {
        const newQty = Math.max(0, existing.quantity + effect.delta);
        if (newQty === 0) {
          inventory = inventory.filter(i => i.itemId !== effect.itemId);
        } else {
          inventory = inventory.map(i =>
            i.itemId === effect.itemId ? { ...i, quantity: newQty } : i
          );
        }
      } else if (effect.delta > 0) {
        inventory.push({ itemId: effect.itemId, quantity: effect.delta });
      }
    }
    newState = { ...newState, inventory };
  }

  return newState;
}
```

---

### 3. `loader.ts` — Scene Loading

Loads and validates scene JSON files. Uses dynamic import for lazy loading (load by act, not all at once).

```typescript
// src/engine/loader.ts

import type { Scene, Ending } from './types';

const sceneCache = new Map<string, Scene>();

/**
 * Loads a scene by ID. Scenes are cached after first load.
 * Throws if the scene cannot be found.
 */
export async function loadScene(sceneId: string): Promise<Scene> {
  if (sceneCache.has(sceneId)) {
    return sceneCache.get(sceneId)!;
  }

  // Dynamic import — Vite will code-split by act folder
  // Scene files are named: scene_{id}.json
  // This requires scenes to be organized by act in known subfolders
  try {
    const module = await findSceneModule(sceneId);
    const scene = module.default as Scene;
    sceneCache.set(sceneId, scene);
    return scene;
  } catch {
    throw new Error(`Scene not found: ${sceneId}`);
  }
}

async function findSceneModule(sceneId: string) {
  // Try each act folder — extend as you add acts
  const acts = ['act1_hour-48', 'act2_outbreak', 'act3_survival'];
  for (const act of acts) {
    try {
      return await import(`../data/scenes/${act}/${sceneId}.json`);
    } catch {
      continue;
    }
  }
  throw new Error(`Scene module not found: ${sceneId}`);
}

/**
 * Loads all endings (small file, always fully loaded).
 */
export async function loadEndings(): Promise<Ending[]> {
  const module = await import('../data/endings.json');
  return module.default.endings;
}
```

---

### 4. `saveManager.ts` — Persistence

```typescript
// src/engine/saveManager.ts

import type { GameState } from './types';

const SAVE_KEY_PREFIX = 'dead-hour:save:';

export function saveGame(slot: number, state: GameState): void {
  const key = `${SAVE_KEY_PREFIX}${slot}`;
  localStorage.setItem(key, JSON.stringify(state));
}

export function loadGame(slot: number): GameState | null {
  const key = `${SAVE_KEY_PREFIX}${slot}`;
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GameState;
  } catch {
    console.error(`Failed to parse save slot ${slot}`);
    return null;
  }
}

export function listSaves(): Array<{ slot: number; exists: boolean; savedAt?: string }> {
  return [0, 1, 2].map(slot => {
    const raw = localStorage.getItem(`${SAVE_KEY_PREFIX}${slot}`);
    if (!raw) return { slot, exists: false };
    try {
      const state = JSON.parse(raw) as GameState & { savedAt?: string };
      return { slot, exists: true, savedAt: state.savedAt };
    } catch {
      return { slot, exists: false };
    }
  });
}

export function deleteSave(slot: number): void {
  localStorage.removeItem(`${SAVE_KEY_PREFIX}${slot}`);
}
```

---

### 5. `endingEvaluator.ts` — Ending Detection

Checks all endings in priority order and returns the first one triggered. Called after every scene transition.

```typescript
// src/engine/endingEvaluator.ts

import type { Ending, GameState } from './types';
import { evaluate } from './evaluator';

/**
 * Returns the first triggered ending, or null if none apply.
 * Endings should be sorted by priority (ascending) before being passed in.
 */
export function checkForEnding(endings: Ending[], state: GameState): Ending | null {
  const sorted = [...endings].sort((a, b) => a.priority - b.priority);
  for (const ending of sorted) {
    if (evaluate(ending.conditions, state)) {
      return ending;
    }
  }
  return null;
}
```

---

## Zustand Store

The store wires the engine functions into React's world.

```typescript
// src/store/gameStore.ts

import { create } from 'zustand';
import type { GameState, Scene, Ending } from '../engine/types';
import { applyEffects } from '../engine/executor';
import { getAvailableChoices } from '../engine/evaluator';
import { loadScene, loadEndings } from '../engine/loader';
import { checkForEnding } from '../engine/endingEvaluator';
import { saveGame } from '../engine/saveManager';
import { DEFAULT_GAME_STATE } from '../engine/defaults';

interface GameStore {
  // State
  gameState: GameState;
  currentScene: Scene | null;
  availableEndings: Ending[];
  triggeredEnding: Ending | null;
  isLoading: boolean;

  // Actions
  startNewGame: () => Promise<void>;
  selectChoice: (choiceId: string) => Promise<void>;
  loadFromSave: (slot: number) => Promise<void>;
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: DEFAULT_GAME_STATE,
  currentScene: null,
  availableEndings: [],
  triggeredEnding: null,
  isLoading: false,

  startNewGame: async () => {
    set({ isLoading: true });
    const [scene, endings] = await Promise.all([
      loadScene('scene_001'),
      loadEndings()
    ]);
    const freshState = { ...DEFAULT_GAME_STATE, playthroughId: crypto.randomUUID() };
    set({
      gameState: freshState,
      currentScene: scene,
      availableEndings: endings,
      triggeredEnding: null,
      isLoading: false
    });
  },

  selectChoice: async (choiceId: string) => {
    const { gameState, currentScene, availableEndings } = get();
    if (!currentScene) return;

    const choice = currentScene.choices.find(c => c.id === choiceId);
    if (!choice) return;

    set({ isLoading: true });

    // 1. Apply choice effects
    let newState = applyEffects(choice.effects, gameState);

    // 2. Record choice in history
    newState = {
      ...newState,
      choiceHistory: [...newState.choiceHistory, { sceneId: currentScene.id, choiceId }]
    };

    // 3. Load next scene
    const nextScene = await loadScene(choice.nextSceneId);

    // 4. Apply scene onEnter effects
    if (nextScene.onEnter) {
      newState = applyEffects(nextScene.onEnter, newState);
    }

    // 5. Update scene tracking
    newState = {
      ...newState,
      currentSceneId: nextScene.id,
      visitedScenes: [...newState.visitedScenes, nextScene.id]
    };

    // 6. Check for ending
    const triggered = checkForEnding(availableEndings, newState);

    // 7. Auto-save
    saveGame(newState.saveSlot, newState);

    set({
      gameState: newState,
      currentScene: nextScene,
      triggeredEnding: triggered,
      isLoading: false
    });
  },

  loadFromSave: async (slot: number) => {
    // Implementation in saveManager integration
  }
}));
```

---

## Engine Testing Strategy

Engine functions are pure — test them with Vitest without mounting any React components.

```typescript
// tests/engine/evaluator.test.ts

import { describe, it, expect } from 'vitest';
import { evaluate } from '../../src/engine/evaluator';
import { mockState } from '../helpers/mockState';

describe('evaluate()', () => {
  it('returns true when no conditions are set', () => {
    expect(evaluate({}, mockState())).toBe(true);
  });

  it('requires flags to be present', () => {
    const state = mockState({ flags: { met_doctor: true } });
    expect(evaluate({ requiredFlags: ['met_doctor'] }, state)).toBe(true);
    expect(evaluate({ requiredFlags: ['met_militia'] }, state)).toBe(false);
  });

  it('blocks choices when blocked flags are set', () => {
    const state = mockState({ flags: { betrayed_militia: true } });
    expect(evaluate({ blockedFlags: ['betrayed_militia'] }, state)).toBe(false);
  });

  it('checks stat minimums', () => {
    const state = mockState({ stats: { leadership: 3 } });
    expect(evaluate({ requiredStats: [{ stat: 'leadership', min: 5 }] }, state)).toBe(false);
    expect(evaluate({ requiredStats: [{ stat: 'leadership', min: 3 }] }, state)).toBe(true);
  });
});
```
