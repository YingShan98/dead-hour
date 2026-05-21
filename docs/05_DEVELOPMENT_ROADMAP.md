# 05 — Development Roadmap

### Dead Hour | Solo Dev Plan

---

## Principles for Solo Dev

- **Working software over perfect architecture.** Ship each phase; refactor after.
- **Content is king, engine serves content.** Don't over-engineer the engine before you have scenes to run.
- **One playthrough at a time.** Don't write Act 3 until Act 1 is playable end-to-end.
- **Defer anything you don't need yet.** Audio, animations, cloud saves — all Phase 4+.

---

## Phase Overview

| Phase       | Focus                     | Est. Duration |
| ----------- | ------------------------- | ------------- |
| **Phase 0** | Project setup             | 1–2 days      |
| **Phase 1** | Engine + data model       | 1–2 weeks     |
| **Phase 2** | Act 1 playable end-to-end | 2–3 weeks     |
| **Phase 3** | Act 2 + real branching    | 3–4 weeks     |
| **Phase 4** | Act 3 + factions          | 4–6 weeks     |
| **Phase 5** | Act 4 + endings           | 2–3 weeks     |
| **Phase 6** | Polish + release          | 2–3 weeks     |

**Rough total: 4–5 months** at a comfortable solo pace with part-time effort.

---

## Phase 0 — Project Setup (Days 1–2)

Goal: clean repo, working dev environment, CI-ready.

### Tasks

- [ ] `npm create vite@latest dead-hour -- --template react-ts`
- [ ] Install dependencies:
  ```bash
  npm install zustand react-router-dom
  npm install -D tailwindcss postcss autoprefixer vitest @testing-library/react @testing-library/user-event @vitejs/plugin-react
  npx tailwindcss init -p
  ```
- [ ] Configure `tsconfig.json` — strict mode on
- [ ] Configure `vite.config.ts` for path aliases (`@/` → `src/`)
- [ ] Set up `src/` folder structure (as per Architecture doc)
- [ ] Create placeholder files for all engine modules
- [ ] Create `.github/workflows/ci.yml` for lint + test on push
- [ ] Initialize `src/data/` with starter JSON files (`stats.json`, `items.json`, `endings.json`)
- [ ] Commit: `chore: initial project setup`

### Deliverable

Running dev server (`npm run dev`) shows a blank page with no TypeScript errors.

---

## Phase 1 — Engine Core (Week 1–2)

Goal: the game engine works and is tested, even without any real scenes.

### Tasks

- [ ] Define all TypeScript interfaces in `src/engine/types.ts`
- [ ] Implement `evaluator.ts` with unit tests
- [ ] Implement `executor.ts` with unit tests
- [ ] Implement `endingEvaluator.ts` with unit tests
- [ ] Implement `saveManager.ts` (localStorage)
- [ ] Implement `loader.ts` (start with static imports; lazy-load comes later)
- [ ] Define `DEFAULT_GAME_STATE` in `src/engine/defaults.ts`
- [ ] Implement Zustand store in `src/store/gameStore.ts`
- [ ] Write `scripts/validate-scenes.ts` — a CLI script to validate JSON scenes against the schema
- [ ] Write 3–5 mock scenes in JSON to exercise the engine
- [ ] Achieve >80% test coverage on engine functions

### Deliverable

`npm test` passes. All engine functions handle happy path + error cases.

---

## Phase 2 — Act 1 Playable (Weeks 3–5)

Goal: A human can sit down and play Act 1 from start to finish.

### Tasks

**UI (build just enough):**

- [ ] `TitlePage` — Start Game / Load Game buttons
- [ ] `GamePage` — scene text + choice list + basic stat display
- [ ] `EndingPage` — placeholder, just shows ending title
- [ ] `GameLayout` — sidebar with stats and inventory
- [ ] Basic Tailwind dark theme (noir/post-apocalyptic atmosphere)

**Content:**

- [ ] Write all Act 1 scenes (~15–20 scenes)
- [ ] At minimum, 2–3 meaningful branch points in Act 1
- [ ] Validate all scenes pass `validate-scenes.ts`
- [ ] At least one "bad" ending triggerable in Act 1 (health = 0)

**Engine integration:**

- [ ] Hook `selectChoice` in store to actual UI
- [ ] Auto-save after each scene
- [ ] `TimelineBar` component showing progress through act

### Deliverable

Playable Act 1. Show it to one other person and watch them play it without your help.

---

## Phase 3 — Act 2 + Real Branching (Weeks 6–9)

Goal: The game's first major branch (Stay in city vs. Flee to suburbs) is implemented and both paths are playable through to Day 30.

### Tasks

**Content:**

- [ ] Write Act 2 scenes — both branches (~30–40 total)
- [ ] Implement first major NPC encounters (Dr. Marsh, Rook)
- [ ] Implement first resource scarcity mechanics in scenes
- [ ] Write 2–3 additional "bad" endings that can trigger in Act 2

**UI:**

- [ ] `InventoryPanel` — shows items with quantities
- [ ] Item use action (usable items can be activated from inventory)
- [ ] Scene transition animation (simple fade)
- [ ] Choice tooltip showing stat requirements

**Engine:**

- [ ] Lazy loading by act folder (code splitting)
- [ ] Journal/history view showing past choices (stretch goal)

### Deliverable

Full Acts 1–2 playable. At least 4 distinct bad endings reachable. At least 2 meaningfully different paths through Act 2.

---

## Phase 4 — Act 3 + Factions (Weeks 10–15)

Goal: The faction system is alive. Joining a faction changes what you see.

### Tasks

**Content:**

- [ ] Write Act 3 scenes — all three faction paths
- [ ] Implement Yusuf (Collective) storyline
- [ ] Implement The Kid recurring thread
- [ ] Implement the major moral choice (Day 90 branch)
- [ ] "Ghost" — the Loner NPC that mirrors player dominant stat

**Engine:**

- [ ] Faction membership gating (scenes only load if correct flag is set)
- [ ] Recurring NPC state — NPCs can be dead, alive, or hostile based on flags
- [ ] In-game day counter prominently displayed

**UI:**

- [ ] NPC relationship sidebar (optional — shows trust level with key characters)
- [ ] Multiple save slots (3 slots, selectable from title screen)

### Deliverable

Full Acts 1–3 playable. At least 6 distinct endings triggerable across all acts.

---

## Phase 5 — Act 4 + Endings (Weeks 16–18)

Goal: The game is completable. All major endings are reachable.

### Tasks

**Content:**

- [ ] Write Act 4 scenes (~20–30)
- [ ] Write `scene_final` — the convergence scene
- [ ] Implement all 8 planned endings
- [ ] Write epilogue text for each ending

**Engine:**

- [ ] Final ending evaluator pass — verify priority ordering is correct
- [ ] Playthrough stats: time played, choices made, deaths
- [ ] "New Game+" flag — carry knowledge between runs (optional)

**UI:**

- [ ] `EndingPage` — full ending text, epilogue, playthrough summary
- [ ] Share/screenshot ending card (stretch goal)

### Deliverable

Full game completable. All planned endings reachable through normal play.

---

## Phase 6 — Polish + Release (Weeks 19–21)

Goal: A game you're proud to share publicly.

### Tasks

- [ ] Full playtesting — play each major path yourself end to end
- [ ] Accessibility: keyboard navigation, readable font sizes, contrast
- [ ] Responsive layout (desktop-first but mobile-readable)
- [ ] Loading states and error boundaries
- [ ] Open Graph / meta tags for social sharing
- [ ] Deploy to Vercel or Netlify (free tier)
- [ ] Custom domain (optional)
- [ ] Write a brief "About" page explaining the project

---

## Technical Debt Register

Track things you're deferring deliberately:

| Item                        | Deferred Until | Why                                               |
| --------------------------- | -------------- | ------------------------------------------------- |
| Audio/music                 | Phase 6+       | Scope; can be added without engine changes        |
| Cloud save / account system | Extension      | Requires backend                                  |
| Localization                | Extension      | Architecture supports it (string externalization) |
| Mobile-native app           | Extension      | Could wrap in Capacitor later                     |
| Scene editor GUI            | Extension      | `validate-scenes.ts` is sufficient for now        |
| Procedural content          | Extension      | All content is hand-authored in v1                |

---

## Git Branching Strategy (Solo)

Simple is fine for solo:

```
main          ← always deployable
├── dev       ← working branch
├── content/act-2    ← content writing branch
└── feature/inventory-ui  ← feature branches
```

Merge `dev` → `main` at the end of each phase.

---

## Definition of "Done" per Phase

A phase is done when:

1. All tasks are checked off
2. `npm test` passes with no failures
3. `npm run build` produces no TypeScript errors
4. The deliverable has been played through manually
