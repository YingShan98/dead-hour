# Dead Hour — Next Steps

> Prioritised task list based on code analysis as of 2026-06-05.  
> Items marked **IMMEDIATE** should be done before the next public push.

---

## IMMEDIATE — Bugs

### 1. Day counter displays wrong day for most scenes

**File:** `src/components/game/SceneDisplay.tsx:29–31`

**Problem:**  
`Math.floor(hoursFromStart / 24)` produces 0-indexed days — Day 1 scenes show "Day 1" only because the special-case `=== 0` catches h<24, but Day 3 at h=56 shows "Day 2", Day 8 at h=176 shows "Day 7", etc.

**Root cause:**  
The data has TWO conventions mixed together: some scenes land within a day (h=56 = Day 3 morning) and others land on exact day boundaries (h=96 = exactly Day 4×24, h=240 = exactly Day 10×24). No single `floor`-based formula can satisfy both. `Math.ceil` handles both conventions correctly, with only 3 data changes needed.

**Verification — `Math.ceil(h/24)` vs all non-negative scenes:**

| Scene             | h   | `ceil(h/24)`     | Expected | OK?                          |
| ----------------- | --- | ---------------- | -------- | ---------------------------- |
| Outbreak          | 0   | 0 → special case | Day 1    | ✓                            |
| day1_morning      | 8   | 1                | Day 1    | ✓                            |
| scene_110         | 24  | **1**            | Day 2    | ✗ change h                   |
| day3_morning      | 56  | 3                | Day 3    | ✓                            |
| day3_night        | 72  | 3                | Day 3    | ✓ (floor+1 gives 4 — wrong)  |
| day4_morning      | 96  | 4                | Day 4    | ✓ (floor+1 gives 5 — wrong)  |
| day4_day          | 100 | **5**            | Day 4    | ✗ change h                   |
| pei_rescue        | 102 | 5                | Day 4–5  | ✓                            |
| day4_night        | 112 | **5**            | Day 4    | ✗ change h                   |
| day5_6_skip       | 120 | 5                | Days 5–6 | ✓                            |
| day7_milestone    | 168 | 7                | Day 7    | ✓ (floor+1 gives 8 — wrong)  |
| day8_outside      | 176 | 8                | Day 8    | ✓                            |
| day10_supermarket | 240 | 10               | Day 10   | ✓ (floor+1 gives 11 — wrong) |
| day14_exit        | 336 | 14               | Day 14   | ✓ (floor+1 gives 15 — wrong) |

**Fix (two steps):**

Step 1 — update `SceneDisplay.tsx:25–31` (the `formatGameTime` function):

```typescript
// Before:
const days = Math.floor(hoursFromStart / 24)
if (days === 0) return LL.time.dayOne()
return interpolate(LL.time.day, { day: days })

// After:
const days = Math.ceil(hoursFromStart / 24)
if (days === 0) return LL.time.dayOne() // h=0 exactly (outbreak start)
return interpolate(LL.time.day, { day: days })
```

Also check `TimeCountdown.tsx:35` — if it uses `floor(h/24)+1`, update it to `Math.ceil(h/24)` for consistency. The two components must use the same formula.

Step 2 — update the 3 scenes whose hours are non-multiples of 24 but land in the wrong day:

| Scene file              | Current h | `ceil` result    | Expected | Suggested h |
| ----------------------- | --------- | ---------------- | -------- | ----------- |
| `scene_110.json`        | 24        | 1 (wrong: Day 1) | Day 2    | 25          |
| `scene_day4_day.json`   | 100       | 5 (wrong: Day 5) | Day 4    | 88          |
| `scene_day4_night.json` | 112       | 5 (wrong: Day 5) | Day 4    | 94          |

No other scene files need their hours changed. Notably:

- `scene_day3_night.json` (h=72), `scene_day4_morning.json` (h=96), `scene_day7_milestone.json` (h=168), `scene_day10_supermarket.json` (h=240), `scene_day14_exit.json` (h=336) all resolve correctly under `ceil` — do **not** change them.

Note: changing day4_day (100→88) and day4_night (112→94) shifts their hunger-tick day from `lastProcessedDay=4` to `lastProcessedDay=3` in `hungerManager.ts` (which also uses `floor(h/24)`). This is a one-day shift in when the Day 4 hunger penalty fires — acceptable and narratively invisible.

---

### 2. Game dead-ends after Day 10 content is exhausted

**File:** `src/data/scenes/scene_day8_outside.json`

**Problem:**  
`scene_day8_outside` is the city exploration hub. It has 6 choices, but 5 of them are one-time (blocked by flags once completed). Once `visited_supermarket`, `scavenged_pharmacy`, `day8_returned_home`, `knows_city_layout` are all set and `pei_alive` is set, the only remaining choice is `scene_day8_outside_supermarket_retry` which loops back to itself. The game is uncompletable from this state.

Additionally, `scene_day14_exit.json` — which is supposed to be the "forced exit" pivot — routes both its choices back to `scene_day8_outside`, so it doesn't provide an escape from the loop.

**Fix:**  
Add a `scene_day15_morning.json` as the first post-hub scene with a new forward path. At minimum this can be a stub with narrative text and one choice that leads to an interim stub or `scene_day7_milestone` (for testing). Link it from `scene_day8_outside` with a new choice that fires once all exploration is done:

```json
{
  "id": "scene_day8_outside_move_on",
  "text": { "zh": "够了。是时候找一个能撑更久的地方了。" },
  "conditions": {
    "requiredFlags": ["visited_supermarket", "left_apartment"]
  },
  "effects": {},
  "nextSceneId": "scene_day15_morning"
}
```

The `scene_day15_morning.json` (stub for now) should advance the story — government broadcast, base selection, or Pei's ankle healing. See Phase 2 content roadmap below.

---

### 3. `scene_day7_milestone` lockout risk

**Source:** `pnpm run validate-scenes` warning

All 4 choices in `scene_day7_milestone.json` have conditions, which means a player not meeting any condition is shown zero choices — effectively soft-locked. Add a no-condition fallback choice (e.g., wait and observe) that is always available.

---

## IMMEDIATE — Documentation Corrections

### 4. ~~Hunger row in `docs/02_DATA_MODEL.md`~~ ✅ Already fixed

Corrected in a prior session. `docs/02_DATA_MODEL.md:180` now reads:

> "Passive daily tick active: auto-consumes 1 food/day, penalties at ≥6/8/10 via `hungerManager.ts`"

No action needed.

---

### 5. `docs/02_DATA_MODEL.md` Schema Example uses incorrect types

**File:** `docs/02_DATA_MODEL.md:90–154`  
The TypeScript interface example in the Scene Schema section shows `title: string` and `narrative: string[]`, but the actual types are `LocaleString` (`{zh: string, en?: string}`) and `LocaleString[]`. The `EffectSet` interface also shows `flags?: Record<string, boolean>` but actual scene JSON uses typed `GameFlag` keys. This creates confusion for content authors.

**Fix:** Update the interface block to show actual production types:

```typescript
export interface Scene {
  id: string
  title: LocaleString
  act: Act
  gameTime: { hoursFromStart: number }
  narrative: LocaleString[]
  conditions: ConditionSet
  choices: Choice[]
  onEnter?: EffectSet
  conditionalNarrative?: ConditionalNarrative[]
}
```

Also update the example JSON in the same section to show the real LocaleString format (like the README already does).

---

### 6. `docs/04_STORY_STRUCTURE.md` references wrong NPCs

**File:** `docs/04_STORY_STRUCTURE.md`  
References English NPC names (Dr. Lena Marsh, Rook, Yusuf, The Kid, Ghost) from an old design doc that don't exist in the GDD or any scene JSON. The GDD NPC roster is: 裴嘉应, 老许, 连珏, 阿福, 郑博士.

**Fix:** Full rewrite of the NPC roster and act structure sections to match `docs/GDD_FULL_STORYLINE.md`.

---

## IMMEDIATE — Dead Code

### 7. Remove orphan English-NPC flags from `src/data/flags.ts`

These flags reference NPCs (Dr. Lena Marsh, Rook, Yusuf) and a location (Westfield) that don't exist in the GDD or any scene JSON. They are never set or checked anywhere in the codebase.

**Remove these entries from both the `GameFlag` union type AND the `FLAG_REGISTRY` array:**

- `met_doctor`, `met_militia_leader`, `met_collective_organizer`, `met_the_kid`, `met_ghost`
- `betrayed_militia`, `betrayed_collective`
- `deferred_clinic_offer`
- `joined_clinic`, `joined_militia`, `joined_collective`
- `knows_westfield_name`, `located_westfield_signal`, `knows_westfield_location`

**Keep:** `has_group` (referenced in `endings.json` conditions for `ending_community_leader`).

**Note:** `saved_the_kid` is also not currently referenced in any scene — review whether to keep or remove once the kid NPC is defined for GDD content. For now, leave it.

After removing, run `pnpm run validate-scenes && pnpm run typecheck` to confirm no references remain.

---

## IMMEDIATE — Missing Data

### 8. Add water item to `src/data/items.json`

The GDD treats water as a separate critical resource from food, and the scenario text references water (e.g., `scene_day14_exit.json`: "食物已经见底了……喝水省着"). The hunger system in `hungerManager.ts` only auto-consumes food-category items.

Add a minimal water entry:

```json
{
  "id": "water_bottle",
  "label": { "zh": "饮用水" },
  "description": { "zh": "一瓶矿泉水。解渴用，不能替代食物。" },
  "category": "food",
  "stackable": true,
  "maxStack": 10,
  "usable": true,
  "useEffect": { "stats": { "morale": 1 } }
}
```

If water is to be tracked separately from hunger (dehydration system), add it as a `misc` category and hook a separate `thirstManager` in Phase 2. For now, `food` category is enough for the auto-consume to pick it up.

---

## Phase 2 Work (After Push)

These items are not bugs but are the main body of Phase 2 work.

### Content: Day 15 → Day 90 scenes

The current ceiling is Day 10 (+ Day 14 forced exit). The GDD's Phase 1 ends at Day 90. Key milestone scenes needed in order:

| Target day | Scene name               | Key beat                                                                |
| ---------- | ------------------------ | ----------------------------------------------------------------------- |
| 15         | `scene_day15_morning`    | Government broadcast via radio; first faction foreshadowing             |
| 22         | `scene_day22_truck`      | Military convoy passes — join, refuse, or scavenge aftermath            |
| 30         | `scene_day30_hospital`   | Hospital approach milestone; first real encounter with 郑博士 evidence  |
| 45         | `scene_day45_pei_bakery` | Pei rescue from the bakery staircase (anchor scene, heavily branched)   |
| 60         | `scene_day60_winter`     | Winter arrives; shelter established; cold damage introduced             |
| 75         | `scene_day75_broadcast`  | Radio signal from factions (if player has radio); base selection prompt |
| 90         | `scene_day90_spring`     | Spring thaw; Phase 1 exit gate; `survived_first_winter` flag set        |

This is the primary deliverable for Phase 2. Without it, the game remains a demo.

---

### Passive mechanics to implement during Day 15–90 authoring

These should be added alongside the scenes that make them narratively visible:

- **Cold/winter damage** (Day 60+): daily health drain when `base_type` has no heating. Stub: `src/engine/coldManager.ts` mirroring the pattern in `hungerManager.ts`.
- **Passive infection escalation** (Day 30+): if `wound_ignored` and no antibiotics used in N days, infection +1 per week. Currently infection only changes via explicit scene effects.
- **Water dehydration** (if added above): separate daily tick from hunger.

---

### Remaining endings

8 of 17 planned endings exist. The 9 missing are:

| ID                        | Name                 | Trigger condition                                           |
| ------------------------- | -------------------- | ----------------------------------------------------------- |
| `ending_cold_death`       | BE-1 极寒熄火        | Survived winter but health reaches 0 from cold              |
| `ending_last_stand_fail`  | BE-3 第364天功亏一篑 | Survived 364 days then health reaches 0                     |
| `ending_fortress_solo`    | H-1 最强钉子户       | High security + solo + survived one year                    |
| `ending_together`         | H-2 双向奔赴         | Pei alive + excessive_exertion + survived one year          |
| `ending_dawn_of_man`      | A-1 凡人钢铁黎明     | Survived without awakening or turning                       |
| `ending_gene_blocker`     | A-2 基因阻断剂       | 郑博士 saved + pei_research_complete + infection controlled |
| `ending_new_human_leader` | B-2 新人类领袖       | Awakening + factions_allied + leadership ≥15                |
| `ending_species_shift`    | C-2 物种更替         | Full zombie + zombie_signal_received                        |
| `ending_ceasefire`        | B-1 停战协议         | factions_allied + survived one year + no zombie arc         |

Add these to `src/data/endings.json` as each becomes reachable via content. Priority: BE-1 and H-1 can be added now (they have simpler conditions). The rest require Phase 2+ content.

---

### Design decisions already made (do not revisit without cause)

- **health default = 15** (GDD says 10): correct interim buffer until cold/hunger passive damage is live. Revisit when `coldManager` and full hunger chain are implemented.
- **will default = 6** (GDD says 5): one-point buffer, inert difference in current content. Fine.
- Both are documented in `docs/02_DATA_MODEL.md`.

---

## Phase 2 Work — Gaming Experience Enhancements

Grouped by effort. These are independent of each other and can be done in any order.

---

### Quick Polish (CSS / minimal logic — under half a day each)

#### A. Critical stat pulse animation

**Files:** `src/index.css`, `src/components/game/StatPanel.tsx`

StatPanel already switches the bar colour to `#8b2020` when `health ≤ 4` or `morale ≤ 4`, but there is no motion cue. Add a slow-pulse keyframe so the bar itself throbs when a stat is in danger range.

```css
/* src/index.css — new keyframe */
@keyframes statPulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.55;
  }
}
/* inside @theme */
--animate-stat-pulse: statPulse 1.4s ease-in-out infinite;
```

In `StatPanel.tsx`, add `animate-stat-pulse` to the `.stat-bar-fill` `className` when `value ≤ threshold` (use the same `≤ 4` check that already drives `barColour`). Health and morale only — stealth and money do not pulse.

---

#### B. Danger-state ambient vignette

**Files:** `src/components/ui/AmbientOverlay.tsx`, `src/pages/GamePage.tsx`

When `health ≤ 4`, shift the radial-gradient vignette from near-black to a deep blood-red tint. `AmbientOverlay` currently takes no props — add an optional `danger?: boolean` prop. When true, the second `div` uses:

```
radial-gradient(ellipse 85% 75% at 50% 45%, transparent 25%, rgba(60,0,0,0.65) 100%)
```

`GamePage` passes `danger={gameState.stats.health <= 4}`. Pure CSS, no animation library.

---

#### C. Days survived on ending screen

**File:** `src/pages/EndingPage.tsx`

EndingPage shows `choicesMade` and `scenesVisited` but not the day number. Add a third badge:

```tsx
<span className="panel-card py-2 px-3">
  {interpolate(LL.ending.daysSurvived, {
    count: Math.ceil(gameState.gameTime.hoursFromStart / 24),
  })}
</span>
```

Requires one new i18n key `ending.daysSurvived` in both locale files (e.g., `zh: "存活 {count} 天"`, `en: "Day {count}"`).

---

#### D. Visible hotkey hint strip

**File:** `src/components/game/ChoiceList.tsx`

The keyboard shortcuts `1`–`N` and `Enter`/`Space` already work but are undiscoverable. Add a single line below the choice nav:

```tsx
<p className="ui-label text-xs text-muted text-center mt-3" aria-hidden>
  {LL.game.keyHint()} {/* e.g. "按 1–N 选择 · Enter 确认" */}
</p>
```

Only render when `available.length > 0 && !pendingChoiceId`. Requires one i18n key.

---

### Replay & Engagement (new component or small system)

#### E. Endings gallery

**New file:** `src/engine/endingGallery.ts`  
**Modified:** `src/store/gameStore.ts`, `src/pages/TitlePage.tsx`

A lightweight discovery log stored in localStorage (`dead-hour:endings` — a JSON `string[]` of ending IDs). Independent of save slots.

`endingGallery.ts` exports:

```ts
recordEnding(id: string): void   // appends if not present
getDiscoveredEndings(): string[]  // returns sorted array
```

In `gameStore.ts`, call `recordEnding(triggered.id)` in both `selectChoice` and `commitChoice` when `triggered` is non-null (alongside the current `navigate` to `/ending/:id`).

On `TitlePage.tsx`, below the version label:

```tsx
<p className="ui-label text-muted text-xs">
  {interpolate(LL.title.endingsFound, { count: discovered.length, total: 17 })}
</p>
```

Motivates replay without requiring Phase 2 content to be finished first.

---

#### F. Run summary milestone flags

**File:** `src/pages/EndingPage.tsx`

Below the `choicesMade / scenesVisited / daysSurvived` badges, render a row of story milestone badges based on flags the player set. Hard-code a small ordered map of "notable" flags to display strings:

```ts
const NOTABLE_FLAGS: Array<{ flag: string; label: LocaleString }> = [
  { flag: 'pei_alive', label: { zh: '裴嘉应生还', en: 'Pei survived' } },
  { flag: 'pei_rescued', label: { zh: '救出裴嘉应', en: 'Pei rescued' } },
  { flag: 'superpower_awakening', label: { zh: '超能觉醒', en: 'Awakening' } },
  { flag: 'zombie_turning', label: { zh: '感染失控', en: 'Turning' } },
  { flag: 'has_group', label: { zh: '建立团队', en: 'Built a group' } },
  { flag: 'wrote_journal', label: { zh: '留下日记', en: 'Kept a journal' } },
]
```

Render only the ones that are `true` in `gameState.flags`. Each renders as a small `panel-card py-1 px-2 font-ui text-xs` badge. Empty if no notable flags are set.

---

#### G. NPC status panel

**New file:** `src/components/game/NpcStatusPanel.tsx`  
**Modified:** `src/pages/GamePage.tsx`

A sidebar widget showing key NPC statuses derived from flags. Keep it minimal — one row per NPC, status derived at render time with no new store state.

Initial NPC list (expandable when Phase 2 content adds scenes):

| NPC    | Flag logic                                                                                 | Status strings         |
| ------ | ------------------------------------------------------------------------------------------ | ---------------------- |
| 裴嘉应 | `pei_alive=true` → alive; `pei_rescued=true AND pei_alive=false` → missing; else → unknown | 生还 / 失踪 / 下落不明 |

Add to both the desktop sidebar and the mobile collapsible section. Only render the component when at least one NPC flag is present in `gameState.flags` (i.e., the player has encountered the character).

---

### Immersion (new component + store state)

#### H. Day transition overlay

**New file:** `src/components/ui/DayTransition.tsx`  
**Modified:** `src/store/gameStore.ts`, `src/pages/GamePage.tsx`

When the calendar day advances after a choice (compare `Math.ceil(pre / 24)` vs `Math.ceil(post / 24)`), show a centred full-screen overlay for ~1.8s:

```
── 第 X 天 ──
```

Same pattern as `timeJustExpired` / `awakeningJustTriggered` — a new `dayJustAdvanced: number | null` field in the store (holds the new day number, cleared after display). `DayTransition` fades in, holds, fades out using CSS, then `clearDayTransition()` resets it.

Style: `fixed inset-0 z-40 flex items-center justify-center bg-background/90 animate-fade-in pointer-events-none`. Large `font-display text-5xl text-text-dim` label with ornamental dashes.

---

#### I. Ambient audio (opt-in)

**New file:** `src/engine/audioManager.ts`  
**Modified:** `src/pages/TitlePage.tsx`, `src/pages/GamePage.tsx`

Web Audio API only — no external library. A single looping ambient track (atmospheric drone, 30–60s loop, <200 KB, royalty-free). Stored as a URL in a config constant.

`audioManager.ts` API:

```ts
initAudio(): void          // creates AudioContext + BufferSource on first user gesture
startAmbient(): void       // begins loop
stopAmbient(): void        // fades out over 1s
isEnabled(): boolean       // reads localStorage key dead-hour:audio (default false)
setEnabled(v: boolean): void
```

A small mute/unmute icon button in the TitlePage and a subtle `♪` / `✕` icon in the GamePage header. Audio is OFF by default — never starts without explicit opt-in. Browsers require a user gesture before `AudioContext` can be created; `initAudio()` is called on any button press.

---

### Accessibility & UX (settings system)

#### J. Reduce motion toggle

**New file:** `src/engine/settingsManager.ts`  
**Modified:** `src/pages/GamePage.tsx` (or a shared `App.tsx` wrapper)

`settingsManager.ts` manages a `dead-hour:settings` JSON blob in localStorage. Initial keys:

```ts
interface GameSettings {
  reducedMotion: boolean // default false
  fontSize: 'small' | 'default' | 'large' // default 'default'
  audioEnabled: boolean // merges with item I
}
```

When `reducedMotion: true`, set `data-reduced-motion="true"` on `<html>`. CSS then overrides all animation durations to 0:

```css
[data-reduced-motion='true'] * {
  animation-duration: 0.01ms !important;
  transition-duration: 0.01ms !important;
}
```

This also respects the OS-level `prefers-reduced-motion` media query — check both.

#### K. Narrative font-size preference

**Modified:** `src/engine/settingsManager.ts`, `src/index.css`, `src/pages/GamePage.tsx`

Three font-size levels for the narrative text:

| Size    | `--text-narrative` | `--text-narrative--line-height` |
| ------- | ------------------ | ------------------------------- |
| small   | 1rem               | 1.7                             |
| default | 1.125rem           | 1.85                            |
| large   | 1.3rem             | 1.9                             |

Applied via `data-font-size` attribute on `<html>`. A simple `A− / A / A+` control in a compact settings row in the GamePage sidebar (desktop) and collapsible header (mobile).

---

## Validation

After completing items 1–8, run:

```bash
pnpm run validate-scenes   # should pass with 0 warnings after item 3
pnpm run typecheck         # must pass cleanly after item 7
pnpm run lint              # zero warnings
pnpm test:run              # all tests green
```
