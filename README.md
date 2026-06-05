# Dead Hour

> A text-driven branching narrative game. A city. A zombie outbreak. One year to survive — or not.

---

## About

**Dead Hour** is a word adventure game where every choice you make shapes the story. You begin 48 hours before the first confirmed attack and navigate decisions across an in-game year — managing your stats, your inventory, and your conscience.

There are no right answers. There are only consequences.

Built with **React + TypeScript**, powered by a data-driven story engine where all narrative content lives in JSON files, fully separate from game logic.

---

## Features

- Branching narrative with real, lasting consequences
- 9-stat system — Health, Morale, Leadership, Stealth (visible bars); Trust, Infection, Will (signal-only UI hints); Money (obsoletes after outbreak); Hunger (tracked, passive drain pending)
- Infection transformation arc — survivor / awakening / turning / zombie paths
- Depraved Insight: conditional scene text that shifts with infection level (3 tiers)
- Trust & Leadership signal system: threshold-triggered UI indicators instead of raw numbers
- Journal log panel: contextual first-person entries, persists to ending screen
- Inventory and resource management — 14 item types across medical, food, tool, weapon, misc
- 50+ narrative flags driving scene branching and ending eligibility
- 8 endings implemented (17 planned) — bad, neutral, good, and secret
- Auto-save with 3 save slots (localStorage)
- i18n architecture: base locale `zh` (Chinese), `en` keys defined but not yet authored
- No server required — runs entirely client-side

---

## Tech Stack

| Concern          | Choice                         |
| ---------------- | ------------------------------ |
| Framework        | React 18 + TypeScript          |
| Build tool       | Vite                           |
| State management | Zustand                        |
| Styling          | Tailwind CSS                   |
| Routing          | React Router v6                |
| Testing          | Vitest + React Testing Library |
| Story content    | JSON (data-driven, no CMS)     |
| Persistence      | localStorage                   |

---

## Getting Started

### Prerequisites

- Node.js >= 22.13
- pnpm >= 11.3.0

### Install & Run

```bash
# Clone the repository
git clone https://github.com/your-username/dead-hour.git
cd dead-hour

# Install dependencies
pnpm install

# Start the development server
pnpm run dev
```

The app will be available at `http://localhost:5173`.

### Other Commands

```bash
# Run tests
pnpm test

# Type check
pnpm run typecheck

# Build for production
pnpm run build

# Preview production build
pnpm run preview

# Validate all scene JSON files
pnpm run validate-scenes
```

---

## Project Structure

```
src/
├── engine/               # Core game logic — pure TypeScript, no React
│   ├── evaluator.ts      # Evaluates conditions (flags, stats, items, security, time)
│   ├── executor.ts       # Applies choice effects immutably, clamps stats to min/max
│   ├── loader.ts         # Lazy-loads and caches scene JSON per act
│   ├── endingEvaluator.ts# Checks endings in priority order after each scene transition
│   ├── saveManager.ts    # localStorage persistence (3 slots, key: dead-hour:save:{slot})
│   ├── journalGenerator.ts # Generates contextual journal entries from game state
│   ├── timeManager.ts    # Crisis state, transformation path, stat signal keys
│   ├── defaults.ts       # DEFAULT_GAME_STATE and numeric thresholds
│   └── types.ts          # All shared TypeScript interfaces
├── store/                # Zustand global game state (thin orchestration layer)
│   └── gameStore.ts
├── data/                 # Story content (JSON — no TypeScript)
│   ├── scenes/           # All scene files in a flat directory (prefixed by phase/day)
│   │   ├── scene_101.json, scene_102.json ...  (pre-outbreak, T−48h)
│   │   ├── scene_day3_*.json, scene_day4_*.json ...  (Days 3–14)
│   │   └── scene_crisis_*.json  (crisis branch scenes)
│   ├── flags.ts          # GameFlag union type + FLAG_REGISTRY with descriptions
│   ├── items.json        # 14 item definitions
│   ├── stats.json        # 9 stat definitions with defaults, min/max, visibility
│   └── endings.json      # 8 endings (17 planned)
├── components/           # React UI components
│   └── game/             # SceneDisplay, StatPanel, InventoryPanel, JournalPanel, ...
├── pages/                # TitlePage, GamePage, EndingPage
├── i18n/                 # typesafe-i18n locale files
│   ├── zh/index.ts       # Base locale (Chinese) — required
│   └── en/index.ts       # English locale — defined, not yet authored
└── hooks/                # useGame, useSave
```

---

## Story Overview

| Phase | In-Game Time | GDD Name | Description | Status |
|---|---|---|---|---|
| Phase 1 | T−48h → Day 90 | 血色之冬 (Crimson Winter) | Outbreak, first survival week, Pei rescue, establish base | Days 1–14 playable |
| Phase 2 | Day 91–180 | 铁血之春 (Iron Spring) | Base building, NPC recruitment, infection arc, faction foreshadowing | Not started |
| Phase 3 | Day 181–270 | 瘟疫之夏 (Plague Summer) | Three-front pressure: plague, intelligent horde, human factions | Not started |
| Phase 4 | Day 271–365 | 审判之秋 (Judgment Autumn) | Siege, convergence, endings | Not started |

Protagonist: 喻城 (Yù Chéng), 23-year-old vocational school mechanic. Companion: 裴嘉应 (Péi Jiā-yīng), trainee nurse. The game is written in Chinese (base locale `zh`).

A single playthrough covers roughly 40–60 scenes out of 120–150 total. Infection level, will, trust, and the choices made in Hour −48 all echo through to the ending.

---

## Authoring Story Content

All scene files live in `src/data/scenes/`. All user-facing text uses `LocaleString` — a map keyed by locale code. Base locale `zh` is always required; `en` is optional.

A minimal scene looks like this:

```json
{
  "id": "scene_example",
  "title": { "zh": "某个场景" },
  "act": "act2",
  "gameTime": { "hoursFromStart": 48 },
  "narrative": [
    { "zh": "街角的药店还没有人来过。" }
  ],
  "conditions": {},
  "choices": [
    {
      "id": "scene_example_enter",
      "text": { "zh": "推开玻璃门，进去。" },
      "conditions": {},
      "effects": {
        "flags": { "scavenged_pharmacy": true },
        "items": [{ "itemId": "medkit", "delta": 1 }]
      },
      "consequence": [{ "zh": "货架已经被翻过了，但抽屉里还有一盒急救包。" }],
      "nextSceneId": "scene_day8_outside"
    }
  ]
}
```

Scenes also support `onEnter` effects (auto-applied on arrival), `conditionalNarrative` (extra text shown only when conditions are met), and `hint` text on locked choices.

See [`docs/06_CONTENT_AUTHORING_GUIDE.md`](docs/06_CONTENT_AUTHORING_GUIDE.md) for the full authoring reference.

---

## Documentation

Full project documentation lives in `/docs`:

| File                            | Contents                                    |
| ------------------------------- | ------------------------------------------- |
| `00_PROJECT_OVERVIEW.md`        | Goals, game loop, scope                     |
| `01_ARCHITECTURE.md`            | Folder structure, layer design, state shape |
| `02_DATA_MODEL.md`              | JSON schemas + TypeScript interfaces        |
| `03_GAME_ENGINE_SPEC.md`        | Engine implementation reference             |
| `04_STORY_STRUCTURE.md`         | Acts, branches, endings, NPC roster         |
| `05_DEVELOPMENT_ROADMAP.md`     | Phased plan, milestones, task checklists    |
| `06_CONTENT_AUTHORING_GUIDE.md` | How to write scenes in JSON                 |

---

## Development Status

| Phase                       | Status              | Notes |
| --------------------------- | ------------------- | ----- |
| Phase 0 — Project setup     | ✅ Complete         | Vite + React + TS + Tailwind + Vitest configured |
| Phase 1 — Engine core       | ✅ Complete         | evaluator, executor, loader, saveManager, endingEvaluator, timeManager all implemented and tested |
| Phase 2 — Act 1 playable    | 🟨 In progress      | UI complete; scene content covers T−48h through Day 14 (out of 90-day Act 1); game cannot yet be completed end-to-end |
| Phase 3 — Act 2 + branching | ⬜ Not started      | Requires Day 15–Day 90 scenes, base selection, NPC recruitment |
| Phase 4 — Act 3 + factions  | ⬜ Not started      | Faction system, plague mechanics, Pei kidnapping arc |
| Phase 5 — Act 4 + endings   | ⬜ Not started      | Siege mechanics, 9 remaining endings, NG+ |
| Phase 6 — Polish + release  | ⬜ Not started      | |

**Content scope:** ~32 scene JSON files implemented, covering the pre-outbreak period and the first two weeks of survival. The planned full game spans 365 in-game days across ~120–150 scenes. Passive mechanics (daily food/water consumption, cold damage, infection passive escalation) and deferred systems (crafting, overclocking, Pei's notebook) are not yet implemented.

---

## License

MIT — see [LICENSE](LICENSE) for details.
