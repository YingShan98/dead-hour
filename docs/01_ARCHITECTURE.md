# 01 — Architecture

### Dead Hour | Technical Design

---

## Tech Stack

```
React 18 + TypeScript
├── Vite                  (build + dev server)
├── Zustand               (global game state)
├── Tailwind CSS          (styling)
├── React Router v6       (page routing — title, game, endings)
└── Vitest                (unit testing, especially engine logic)
```

### Why Zustand over Redux?

Game state is one large object that many components read. Zustand gives you that with minimal boilerplate. Redux is overkill for a single-player game.

### Why JSON files over a CMS?

- Zero infrastructure — no server, no account
- Version-controlled alongside code (Git)
- Human-readable and hand-editable
- Can migrate to a CMS later if needed
- Works offline

---

## Folder Structure

```
dead-hour/
├── public/
│   └── assets/           # Fonts, background images, audio (future)
│
├── src/
│   ├── engine/           # ← Core game logic (pure TypeScript, no React)
│   │   ├── evaluator.ts      # Evaluates conditions against game state
│   │   ├── executor.ts       # Applies choice effects to game state
│   │   ├── loader.ts         # Loads and validates JSON story data
│   │   ├── saveManager.ts    # localStorage save/load
│   │   └── types.ts          # All shared TypeScript interfaces
│   │
│   ├── store/            # ← Zustand store
│   │   └── gameStore.ts      # Global game state + actions
│   │
│   ├── data/             # ← Story content (JSON files, no TypeScript)
│   │   ├── scenes/
│   │   │   ├── act1_hour-48/
│   │   │   │   ├── scene_001.json
│   │   │   │   └── scene_002.json
│   │   │   ├── act2_outbreak/
│   │   │   └── act3_survival/
│   │   ├── items.json        # Master item registry
│   │   ├── stats.json        # Stat definitions + ranges
│   │   └── endings.json      # Ending conditions + text
│   │
│   ├── components/       # ← React components
│   │   ├── game/
│   │   │   ├── SceneDisplay.tsx      # Renders scene text
│   │   │   ├── ChoiceList.tsx        # Renders available choices
│   │   │   ├── StatPanel.tsx         # Player stats sidebar
│   │   │   ├── InventoryPanel.tsx    # Inventory display
│   │   │   └── TimelineBar.tsx       # Shows in-game time progress
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Tooltip.tsx
│   │   └── layout/
│   │       └── GameLayout.tsx
│   │
│   ├── pages/
│   │   ├── TitlePage.tsx
│   │   ├── GamePage.tsx
│   │   └── EndingPage.tsx
│   │
│   ├── hooks/
│   │   ├── useGame.ts        # Convenience hook wrapping gameStore
│   │   └── useSave.ts        # Save/load convenience hook
│   │
│   └── main.tsx
│
├── tests/
│   ├── engine/
│   │   ├── evaluator.test.ts
│   │   └── executor.test.ts
│   └── components/
│
├── scripts/
│   └── validate-scenes.mjs   # CLI tool to validate all JSON scene files
│
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.ts
```

---

## Layer Separation (Critical)

The project is split into **three distinct layers** that must not bleed into each other:

```
┌─────────────────────────────────────┐
│         PRESENTATION LAYER          │  React components, Tailwind
│  (knows about UI, knows about store)│
└────────────────┬────────────────────┘
                 │ reads/calls
┌────────────────▼────────────────────┐
│           STORE LAYER               │  Zustand gameStore
│  (knows about engine, not about UI) │
└────────────────┬────────────────────┘
                 │ calls
┌────────────────▼────────────────────┐
│           ENGINE LAYER              │  Pure TypeScript functions
│  (knows nothing about React/UI)     │  evaluator, executor, loader
└─────────────────────────────────────┘
                 │ reads
┌────────────────▼────────────────────┐
│           DATA LAYER                │  JSON files in /data/
│  (no logic, just structured content)│
└─────────────────────────────────────┘
```

**Rule:** Engine functions are pure — given state + input, they return new state. They never touch React or the DOM. This makes them trivially testable.

---

## State Shape

The top-level game state object (lives in Zustand):

```typescript
interface GameState {
  // Identity
  currentSceneId: string

  // Time tracking
  gameTime: GameTime // { hour: -48, day: 0, phase: 'pre-outbreak' }

  // Player character
  stats: PlayerStats // { health, morale, leadership, stealth, ... }

  // Resources
  inventory: InventoryItem[] // [{ itemId, quantity }]

  // Narrative memory
  flags: Record<string, boolean> // { 'met_doctor': true, 'betrayed_militia': false }
  visitedScenes: string[]

  // History
  choiceHistory: ChoiceRecord[] // For recap / journal feature

  // Meta
  saveSlot: number
  playthroughId: string // UUID for tracking unique runs
}
```

---

## Routing

```
/                   → TitlePage     (new game, load game, credits)
/game               → GamePage      (main game loop)
/ending/:endingId   → EndingPage    (displays ending + stats summary)
```

---

## Save System

- Uses `localStorage` with key `dead-hour:save:{slot}`
- Serializes the entire `GameState` as JSON
- Supports 3 save slots (easily expandable)
- Auto-save triggered after each scene transition
- No cloud sync in v1

---

## Performance Considerations

- All JSON scene files are lazy-loaded per act (not bundled all at once)
- Scene text supports basic markdown (bold, italic, line breaks) via a lightweight renderer — no full markdown library needed
- No server calls in v1; everything runs client-side
