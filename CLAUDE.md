# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Dead Hour is a text-driven branching narrative game (zombie outbreak survival) built with React + TypeScript. All story content lives in JSON files, fully separate from game logic. Runs entirely client-side.

## Commands

```bash
pnpm run dev              # Dev server at http://localhost:5173
pnpm run build            # TypeScript check + Vite build (runs validate-scenes as prebuild)
pnpm run typecheck        # tsc --noEmit
pnpm run lint             # ESLint with --max-warnings 0
pnpm run format           # Prettier write
pnpm run format:check     # Prettier check

pnpm test                 # Vitest watch mode
pnpm test:run             # Vitest single run
pnpm test:run tests/engine/evaluator.test.ts  # Run a single test file

pnpm run validate-scenes  # Validate all scene JSON (structure, refs, reachability)
pnpm run i18n:generate    # Regenerate typesafe-i18n type definitions
```

Requires Node.js >= 22.13 and pnpm >= 11.3.0.

## Architecture

Three-layer separation — layers only depend downward:

```
Presentation (React components, pages, Tailwind)
     ↓ reads store
Store (Zustand — src/store/gameStore.ts)
     ↓ calls engine
Engine (pure TypeScript functions — src/engine/)
     ↓ reads
Data (JSON files — src/data/)
```

**Engine** (`src/engine/`) is pure TypeScript with no React dependency. Functions take state + input, return new state. This is where all game logic lives and where tests focus:
- `types.ts` — all TypeScript interfaces (GameState, Scene, Choice, ConditionSet, EffectSet, etc.)
- `evaluator.ts` — checks if conditions are met (flags, stats, items, security, time)
- `executor.ts` — applies effects immutably (stat deltas clamped to min/max)
- `loader.ts` — lazy-loads and caches scene JSON per act
- `saveManager.ts` — localStorage persistence (3 slots, key: `dead-hour:save:{slot}`)
- `endingEvaluator.ts` — matches ending conditions by priority
- `timeManager.ts` — crisis state and awakening checks
- `defaults.ts` — default GameState and game constants/thresholds

**Store** (`src/store/gameStore.ts`) is thin orchestration: calls engine functions and updates Zustand state. Key actions: `startNewGame`, `selectChoice`, `useItem`, `loadFromSave`.

**Pages**: `/` → TitlePage, `/game` → GamePage, `/ending/:endingId` → EndingPage.

## Data Model

Scene JSON files live in `src/data/scenes/`. Each scene has narrative text, conditions for visibility, choices with their own conditions/effects, and a `nextSceneId`. Scenes can have `onEnter` effects applied automatically.

All user-facing text uses `LocaleString` — a map keyed by locale code. Base locale `zh` (Chinese) is always required; `en` is optional. The engine falls back to `zh` when a locale key is absent.

Stats (7 total): health, morale, leadership, stealth (visible); trust, infection, will (hidden). Defined in `src/data/stats.json` with min/max/default. Infection at 8 triggers zombie_turning; will at 8 opens superpower path.

Items defined in `src/data/items.json` (categories: medical, food, tool, weapon, misc). Endings in `src/data/endings.json` with priority-based matching.

Flags (`src/data/flags.ts`) are the narrative memory system — a `GameFlag` union type. Choices set flags, conditions check them.

## Game Loop

When a player selects a choice: evaluate conditions → apply choice effects → check crisis/awakening → check ending conditions → load next scene → apply onEnter effects → auto-save → update store.

## i18n

Uses typesafe-i18n with base locale `zh`. Locale files at `src/i18n/zh/index.ts` and `src/i18n/en/index.ts`. Type definitions are auto-generated — run `pnpm run i18n:generate` after changing locale files. Access via `useI18n()` hook which returns `{ LL, locale, setLocale }`.

## Code Conventions

- Path alias: `@/` resolves to `src/` (e.g., `import { GameState } from '@/engine/types'`)
- TypeScript strict mode with `noUnusedLocals` and `noUnusedParameters`
- ESLint enforces `consistent-type-imports` (use `import type` for type-only imports)
- ESLint enforces PascalCase for types/interfaces/classes
- Prettier: 100 char width, 2-space indent, single quotes, no semicolons, trailing commas
- Lint allows zero warnings (`--max-warnings 0`)

## Testing

Tests live in `tests/` mirroring `src/` structure. Engine logic is the primary test target since it's pure functions. Vitest with jsdom environment, setup in `tests/setup.ts` (loads jest-dom).

## Content Validation

`pnpm run validate-scenes` checks all scene JSON for: valid structure, required fields, locale completeness (zh present), valid flag/stat/item references, scene graph connectivity, reachability from scene_101, and ID uniqueness. Runs automatically before every build.
