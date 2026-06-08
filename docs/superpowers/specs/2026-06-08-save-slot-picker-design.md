# Save Slot Picker — Design

## Problem

The engine already supports 3 save slots (`SLOT_COUNT = 3` in `saveManager.ts`, with `saveGame`, `loadGame`, `listSaves`, `deleteSave` all implemented and slot-aware), but the title screen doesn't expose them:

- "New Game" always calls `startNewGame(0)` — every new game silently overwrites slot 0
- "Continue" calls `loadFromSave` on whichever slot `listSaves()` finds first that exists — the player never chooses
- There is no way to run parallel playthroughs, see what's in each slot, or delete a save

This is an engine/UI capability mismatch: the data layer is ready, the UI isn't.

## Goal

Add a slot-picker modal to the title screen so players can see all 3 slots (what day each save reached, when it was last played), choose which to continue, start a new game in a specific slot, or delete a save — with confirmation before any destructive action.

## Decisions made during brainstorming

1. **Modal overlay** (not inline expansion or a separate screen/route) — keeps the title screen's minimal first impression; only surfaces complexity on demand.
2. **One unified modal** for both "New Game" and "Continue" — both buttons open the identical picker; the picker shows all 3 slots with full per-slot actions regardless of which button opened it. No mode-tracking.
3. **Confirm before both overwrite and delete** — both are irreversible losses of potentially-hours of progress.
4. **Each occupied slot shows in-game day + real-world date/time** (e.g. "第7天 · 06-08 14:30") — the most useful way to tell saves apart. Requires a small, contained extension to `SaveSlotInfo`.
5. **Modal is dismissible** via Escape, backdrop click, and a Cancel button — a player may open it just to glance at their saves.

## Architecture

**New component:** `src/components/ui/SaveSlotPicker.tsx`

Lives alongside `AmbientOverlay` (not under `components/game/`) because — unlike `StatPanel`, `InventoryPanel`, etc. — it has no `GameState` dependency; it only operates on `SaveSlotInfo[]`.

It follows the existing overlay convention established by `ConsequenceDisplay`:

- `fixed inset-0 z-50` backdrop with `role="dialog" aria-modal="true"`
- Escape key, backdrop click, and an explicit Cancel button all close it
- Owns its own internal UI state (which slot, if any, has a pending confirm step open)

This keeps `TitlePage` a thin presentational page (as it is today) and avoids inventing a generic `Modal` primitive that nothing else currently needs — the one other overlay in the codebase (`ConsequenceDisplay`) is purpose-built, not modal-shaped, so there's no existing reusable abstraction to extend, and building one for a single consumer would be premature generalization.

**`TitlePage.tsx` changes:**

- Add `const [pickerOpen, setPickerOpen] = useState(false)`
- "New Game" and "Continue" both set `pickerOpen = true` instead of acting immediately
- Render `<SaveSlotPicker>` conditionally; wire its callbacks to `startNewGame(slot)`, `loadFromSave(slot)` (existing store actions, both already accept a slot argument), and `deleteSave(slot)` (already exported from `saveManager.ts`, called directly — matching how `listSaves` is already called directly from `TitlePage` rather than through the store)

## Component interface

```ts
interface SaveSlotPickerProps {
  saves: SaveSlotInfo[] // from listSaves(), re-fetched after each mutation
  isLoading: boolean // disables interaction during async start/load
  onStartNew: (slot: number) => void
  onContinue: (slot: number) => void
  onDelete: (slot: number) => void
  onClose: () => void
}
```

`listSaves()` is a synchronous, one-shot `localStorage` read — not reactive — so `TitlePage` holds the slot list in local state (`const [saves, setSaves] = useState(() => listSaves())`), seeded on mount and refreshed via `setSaves(listSaves())`:

- when the picker opens (in case saves changed since the title screen first loaded — e.g. returning from a game session)
- after `onDelete` and after a confirmed `onStartNew` overwrite (both mutate `localStorage` and must be reflected in the still-open modal)

This keeps the picker's view of slots in sync with reality without closing it after a delete, and without a store round-trip (consistent with how `TitlePage` already calls `listSaves()` directly rather than through the store).

## Per-slot interaction

- **Empty slot** — shows "存档 N — 空" and a single primary action "开始新游戏". Clicking it calls `onStartNew(slot)` directly. No confirmation: there's nothing to lose.
- **Occupied slot** — shows "存档 N — 第7天 · 06-08 14:30" plus:
  - **"继续"** (primary) — calls `onContinue(slot)` directly
  - **"新游戏"** (secondary, destructive) — opens an inline confirm step ("这将覆盖存档 N（第7天）— 确定？") before calling `onStartNew(slot)`
  - **"删除"** (secondary, destructive) — opens an inline confirm step ("这将永久删除存档 N（第7天）— 确定？") before calling `onDelete(slot)`
- The confirm step renders **inline within that slot's row**, replacing its action buttons momentarily with Confirm/Cancel — this avoids stacking a dialog on top of a dialog and keeps focus management simple (focus stays within the same row).

## Engine changes

These are small, contained, and serve the UI directly — no speculative generalization:

1. **Extend `SaveSlotInfo`** in `src/engine/saveManager.ts` with an optional `hoursFromStart?: number`, populated in `listSaves()` from the parsed save state. This is the only new data the UI needs that isn't already exposed.

2. **Extract day-label computation into a shared pure helper.** `SceneDisplay.tsx` currently has a private `formatGameTime(hoursFromStart)` that computes which in-game day a given `hoursFromStart` falls on (and has a known off-by-one edge case noted in prior sessions — `Math.ceil(hoursFromStart / 24)` mislabels the boundary hours). Rather than re-implementing similar math a second time for the slot picker (and risking a second, possibly-divergent bug), extract the pure computation into `src/engine/timeManager.ts` as something like:

   ```ts
   type GameDayLabel =
     | { kind: 'beforeOutbreak'; hours: number }
     | { kind: 'dayOne' }
     | { kind: 'day'; day: number }

   export function getGameDayLabel(hoursFromStart: number): GameDayLabel
   ```

   `SceneDisplay` and `SaveSlotPicker` both call this and map the result to localized strings via `LL.time.beforeOutbreak` / `LL.time.dayOne` / `LL.time.day`. This is a targeted refactor of code this feature directly depends on (not a drive-by cleanup) — it ensures the slot picker shows a day number consistent with what the player sees in-game, off-by-one and all, rather than a second implementation that might disagree.

3. **`deleteSave`** is already exported from `saveManager.ts` — `TitlePage` just imports and calls it.

No changes to `gameStore.ts` are needed: `startNewGame(slot)` and `loadFromSave(slot)` already accept a slot argument.

## i18n additions

New keys added to `src/i18n/zh/index.ts` and `src/i18n/en/index.ts` (then `pnpm run i18n:generate`), grouped under `title.slots`:

- `heading` — "选择存档"
- `empty` — "空"
- `slotLabel` — interpolated: slot number + day label + date (e.g. "存档 {slot:number} — {day:string} · {date:string}")
- Action labels: `continue` (继续), `startNew` (开始新游戏), `overwrite` (新游戏), `delete` (删除), `cancel` (取消), `confirm` (确定)
- Confirm prompts: `confirmOverwrite` and `confirmDelete`, each interpolating slot number + day label

## Styling & accessibility

Reuses existing design primitives rather than introducing new ones:

- `panel-card` for slot rows, `choice-btn` / `choice-btn-primary` for actions
- `ui-label` for the heading and slot metadata
- The existing `crisis-banner--danger` red treatment for destructive confirm prompts (matches how the game already signals dangerous/irreversible states)

Accessibility, following `ConsequenceDisplay`'s established pattern:

- `role="dialog" aria-modal="true"`, labelled by the heading
- Escape closes; backdrop click closes (with `stopPropagation` on the inner content, exactly as `ConsequenceDisplay` does)
- Focus moves into the dialog on open, returns to the triggering button (`New Game` or `Continue`) on close
- `Enter`/`Space` activate the focused action, matching the keyboard pattern already used elsewhere

## Testing

- `tests/engine/saveManager.test.ts` — extend coverage for the new `hoursFromStart` field returned by `listSaves()`
- New `tests/engine/timeManager.test.ts` (no test file exists for this module yet) — covers `getGameDayLabel` across day boundaries, including the previously-flagged off-by-one cases (`hoursFromStart = 24`, and the 48–71 range)
- `SaveSlotPicker` and the updated `TitlePage` flow are verified manually via the dev server (consistent with the project's existing convention — there are no component-level tests for `TitlePage` or `ConsequenceDisplay` either; engine logic is the primary automated-test target per `CLAUDE.md`)

## Out of scope

- No changes to the in-game save/load flow (only the title screen's entry points change)
- No "New Game+" or cross-playthrough data carryover
- No generic `Modal` primitive — this is the only modal-shaped overlay in the app; extracting one now would be speculative
