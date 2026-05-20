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
- Stats system — Health, Morale, Leadership, Stealth, Trust
- Inventory and resource management
- Flag-based narrative memory (choices made in Hour -48 echo into Month 6)
- Multiple endings — good, bad, neutral, and secret
- Auto-save with 3 save slots (localStorage)
- No server required — runs entirely client-side

---

## Tech Stack

| Concern | Choice |
|---------|--------|
| Framework | React 18 + TypeScript |
| Build tool | Vite |
| State management | Zustand |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| Testing | Vitest + React Testing Library |
| Story content | JSON (data-driven, no CMS) |
| Persistence | localStorage |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

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
├── engine/         # Core game logic — pure TypeScript, no React
│   ├── evaluator.ts        # Evaluates conditions against game state
│   ├── executor.ts         # Applies choice effects to game state
│   ├── loader.ts           # Loads and caches scene JSON files
│   ├── endingEvaluator.ts  # Checks ending conditions after each scene
│   ├── saveManager.ts      # localStorage save/load
│   └── types.ts            # All shared TypeScript interfaces
├── store/          # Zustand global game state
│   └── gameStore.ts
├── data/           # Story content (JSON — no TypeScript)
│   ├── scenes/
│   │   ├── act1_hour-48/
│   │   ├── act2_outbreak/
│   │   ├── act3_survival/
│   │   └── act4_year-mark/
│   ├── items.json
│   ├── stats.json
│   └── endings.json
├── components/     # React UI components
├── pages/          # TitlePage, GamePage, EndingPage
└── hooks/          # useGame, useSave
```

---

## Story Overview

| Act | In-Game Time | Description |
|-----|-------------|-------------|
| Act 1: The Warning | Hour −48 to Hour 0 | Life before the outbreak |
| Act 2: The Fall | Day 1–30 | The city collapses |
| Act 3: The Long Winter | Day 31–180 | Factions, scarcity, identity |
| Act 4: The Year Mark | Day 181–365 | Convergence and endings |

A single playthrough covers roughly 40–60 scenes out of 120–150 total. No two runs are the same.

---

## Authoring Story Content

All story content lives in `src/data/scenes/` as JSON files. The engine code never needs to change when you add new scenes.

A minimal scene looks like this:

```json
{
  "id": "scene_001",
  "title": "The Morning Commute",
  "act": "act1",
  "gameTime": { "hoursFromStart": -48 },
  "narrative": [
    "The subway is running late again.",
    "On your phone, a blurry video is trending. A man biting a police officer outside City Hall."
  ],
  "conditions": {},
  "choices": [
    {
      "id": "scene_001_choice_a",
      "text": "Keep scrolling. Probably nothing.",
      "conditions": {},
      "effects": { "flags": { "saw_patient_zero_video": true } },
      "nextSceneId": "scene_002_office"
    }
  ]
}
```

See [`docs/06_CONTENT_AUTHORING_GUIDE.md`](docs/06_CONTENT_AUTHORING_GUIDE.md) for the full authoring reference.

---

## Documentation

Full project documentation lives in `/docs`:

| File | Contents |
|------|----------|
| `00_PROJECT_OVERVIEW.md` | Goals, game loop, scope |
| `01_ARCHITECTURE.md` | Folder structure, layer design, state shape |
| `02_DATA_MODEL.md` | JSON schemas + TypeScript interfaces |
| `03_GAME_ENGINE_SPEC.md` | Engine implementation reference |
| `04_STORY_STRUCTURE.md` | Acts, branches, endings, NPC roster |
| `05_DEVELOPMENT_ROADMAP.md` | Phased plan, milestones, task checklists |
| `06_CONTENT_AUTHORING_GUIDE.md` | How to write scenes in JSON |

---

## Development Status

| Phase | Status |
|-------|--------|
| Phase 0 — Project setup | ⬜ Not started |
| Phase 1 — Engine core | ⬜ Not started |
| Phase 2 — Act 1 playable | ⬜ Not started |
| Phase 3 — Act 2 + branching | ⬜ Not started |
| Phase 4 — Act 3 + factions | ⬜ Not started |
| Phase 5 — Act 4 + endings | ⬜ Not started |
| Phase 6 — Polish + release | ⬜ Not started |

---

## License

MIT — see [LICENSE](LICENSE) for details.
