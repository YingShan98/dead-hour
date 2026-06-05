# 02 — Data Model

### Dead Hour | Schema Reference

All story content is stored as JSON. This document defines the exact shape of every data structure — both the JSON files and their corresponding TypeScript interfaces.

---

## Scene Schema

A **scene** is a single narrative moment — a location, a conversation, a crisis. It contains the text the player reads and the choices available to them.

### JSON File: `scene_001.json`

```json
{
  "id": "scene_001",
  "title": "The Morning Commute",
  "act": "act1",
  "gameTime": { "hoursFromStart": -48 },

  "narrative": [
    "The subway is running late again. You check your phone — a blurry video trending on social media shows a man biting a police officer outside City Hall.",
    "People around you scroll past it with mild disgust. Nobody seems alarmed.",
    "Your stop is coming up. You have a meeting in 20 minutes."
  ],

  "conditions": {
    "requiredFlags": [],
    "blockedFlags": [],
    "requiredStats": [],
    "requiredItems": []
  },

  "choices": [
    {
      "id": "choice_001a",
      "text": "Save the video and keep scrolling. It's probably nothing.",
      "conditions": {},
      "effects": {
        "flags": { "saw_patient_zero_video": true },
        "stats": { "morale": 0 },
        "items": []
      },
      "nextSceneId": "scene_002_office"
    },
    {
      "id": "choice_001b",
      "text": "Show the video to the person beside you and say something.",
      "conditions": {},
      "effects": {
        "flags": {
          "saw_patient_zero_video": true,
          "warned_a_stranger": true
        },
        "stats": { "leadership": 1 },
        "items": []
      },
      "nextSceneId": "scene_002_office"
    },
    {
      "id": "choice_001c",
      "text": "Get off at the next stop and head toward City Hall to see for yourself.",
      "conditions": {
        "requiredStats": [{ "stat": "morale", "min": 5 }]
      },
      "effects": {
        "flags": {
          "saw_patient_zero_video": true,
          "went_to_city_hall_early": true
        },
        "stats": { "leadership": 2, "health": -1 },
        "items": []
      },
      "nextSceneId": "scene_003_city_hall"
    }
  ],

  "onEnter": {
    "flags": {},
    "stats": {},
    "items": []
  }
}
```

### TypeScript Interface

```typescript
// src/engine/types.ts

export interface Scene {
  id: string
  title: string
  act: Act
  gameTime: { hoursFromStart: number }

  // Array of paragraphs — rendered sequentially
  narrative: string[]

  // Conditions the player must meet to even enter this scene
  conditions: ConditionSet

  choices: Choice[]

  // Effects applied automatically when entering the scene (no choice required)
  onEnter?: EffectSet
}

export interface Choice {
  id: string
  text: string

  // Conditions the player must meet for this choice to appear
  conditions: ConditionSet

  // What happens when this choice is selected
  effects: EffectSet

  // Where this choice leads
  nextSceneId: string

  // Optional: flavour hint shown before committing (e.g. "Requires Morale 5+")
  hint?: string
}

export interface ConditionSet {
  requiredFlags?: string[]
  blockedFlags?: string[]
  requiredStats?: StatCondition[]
  requiredItems?: ItemCondition[]
}

export interface StatCondition {
  stat: StatKey
  min?: number
  max?: number
}

export interface ItemCondition {
  itemId: string
  minQuantity?: number
}

export interface EffectSet {
  flags?: Record<string, boolean>
  stats?: Partial<Record<StatKey, number>> // delta values (positive or negative)
  items?: ItemEffect[]
}

export interface ItemEffect {
  itemId: string
  delta: number // positive = gain, negative = consume
}
```

---

## Player Stats Schema

### JSON File: `stats.json`

Defines all stats, their starting values, valid range, and display labels. There are 9 stats total — 4 visible, 3 signal-only (hidden from the stat bar, shown via UI hints), 1 obsolete (money), and 1 pending (hunger).

**Display rules:**

- `visible: true` — shown as a numeric bar in StatPanel
- `visible: false` with signal logic in `timeManager.ts` — shown as a coloured icon/label when a threshold is crossed (infection, will, trust, leadership)
- `visible: false` with no signal — tracked internally only (hunger)

| Key          | Default | Max | Visible                                     | Notes                                                                                            |
| ------------ | ------- | --- | ------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `health`     | **15**  | 20  | Bar                                         | See note below                                                                                   |
| `morale`     | 10      | 20  | Bar                                         |                                                                                                  |
| `leadership` | 0       | 20  | Signal only                                 | Signal at ≥10/15/20                                                                              |
| `stealth`    | 0       | 20  | Bar                                         |                                                                                                  |
| `money`      | 200     | 200 | Bar (hidden once `money_obsolete` flag set) |                                                                                                  |
| `trust`      | 5       | 20  | Signal only                                 | Signal at ≤4 (unstable) / ≤2 (critical)                                                          |
| `infection`  | 0       | 10  | Signal only                                 | Signal at ≥5/≥8                                                                                  |
| `will`       | **6**   | 10  | Signal only                                 | Signal at ≥8 (awakening) / ≤2 (collapse)                                                         |
| `hunger`     | 0       | 10  | Hidden                                      | Passive daily tick active: auto-consumes 1 food/day, penalties at ≥6/8/10 via `hungerManager.ts` |

**Note — health default (15 vs. GDD's 10):** The GDD specifies health default 10, which is the right long-term value once passive cold and hunger damage are implemented. In the current build (Phase 2, Days 1–14 content only), the worst-case explicit damage chain totals 9 (Day 3 night breach −3, Day 7 front door −4, Day 8 hospital scout −2). At health=10 that leaves the player at 1 with no meaningful content remaining to reach. 15 is the interim buffer — revisit when the cold/hunger drain system is built.

**Note — will default (6 vs. GDD's 5):** One-point buffer. The awakening threshold is will≥8 AND infection≥3; infection only reaches 3 several scenes in regardless, so the difference is inert in current content.

```json
{
  "stats": [
    { "key": "health", "default": 15, "min": 0, "max": 20, "visible": true },
    { "key": "morale", "default": 10, "min": 0, "max": 20, "visible": true },
    { "key": "leadership", "default": 0, "min": 0, "max": 20, "visible": true },
    { "key": "stealth", "default": 0, "min": 0, "max": 20, "visible": true },
    { "key": "money", "default": 200, "min": 0, "max": 200, "visible": true },
    { "key": "trust", "default": 5, "min": 0, "max": 20, "visible": false },
    { "key": "infection", "default": 0, "min": 0, "max": 10, "visible": false },
    { "key": "will", "default": 6, "min": 0, "max": 10, "visible": false },
    { "key": "hunger", "default": 0, "min": 0, "max": 10, "visible": false }
  ]
}
```

### TypeScript Interface

```typescript
export type StatKey =
  | 'health'
  | 'morale'
  | 'leadership'
  | 'stealth'
  | 'money'
  | 'trust'
  | 'infection'
  | 'will'
  | 'hunger'

export interface StatDefinition {
  key: StatKey
  label: LocaleString
  description: LocaleString
  icon: string
  default: number
  min: number
  max: number
  visible: boolean
}

export type PlayerStats = Record<StatKey, number>
```

---

## Inventory / Items Schema

### JSON File: `items.json`

Master registry of all items that can exist in the game.

```json
{
  "items": [
    {
      "id": "medkit",
      "label": "Medical Kit",
      "description": "A basic first aid kit. Restores 3 health when used.",
      "category": "medical",
      "stackable": true,
      "maxStack": 5,
      "usable": true,
      "useEffect": { "stats": { "health": 3 } }
    },
    {
      "id": "canned_food",
      "label": "Canned Food",
      "description": "Non-perishable. Keeps morale from dropping during rest.",
      "category": "food",
      "stackable": true,
      "maxStack": 20,
      "usable": true,
      "useEffect": { "stats": { "morale": 1 } }
    },
    {
      "id": "radio",
      "label": "Emergency Radio",
      "description": "Lets you tune in to broadcasts. Unlocks radio-based scene options.",
      "category": "tool",
      "stackable": false,
      "maxStack": 1,
      "usable": false,
      "useEffect": null
    },
    {
      "id": "knife",
      "label": "Hunting Knife",
      "description": "Better than nothing. Enables certain confrontation choices.",
      "category": "weapon",
      "stackable": false,
      "maxStack": 1,
      "usable": false,
      "useEffect": null
    }
  ]
}
```

### TypeScript Interface

```typescript
export interface ItemDefinition {
  id: string
  label: string
  description: string
  category: 'medical' | 'food' | 'tool' | 'weapon' | 'misc'
  stackable: boolean
  maxStack: number
  usable: boolean
  useEffect: EffectSet | null
}

export interface InventoryItem {
  itemId: string
  quantity: number
}
```

---

## Endings Schema

### JSON File: `endings.json`

Each ending has a set of conditions that trigger it. Endings are evaluated **after each scene transition** in priority order.

```json
{
  "endings": [
    {
      "id": "ending_death_health",
      "title": "The City Took You",
      "type": "bad",
      "priority": 1,
      "conditions": {
        "requiredStats": [{ "stat": "health", "max": 0 }]
      },
      "narrative": [
        "Your body gave out. The city you tried to save had no more use for you.",
        "But somewhere, a stranger remembered your name."
      ],
      "epilogue": null
    },
    {
      "id": "ending_solo_survivor",
      "title": "Alone in the Ruins",
      "type": "neutral",
      "priority": 10,
      "conditions": {
        "requiredFlags": ["survived_one_year"],
        "blockedFlags": ["has_group"],
        "requiredStats": [{ "stat": "health", "min": 1 }]
      },
      "narrative": [
        "You made it. Alone. The city is quieter now — not peaceful, just empty.",
        "You stop counting the days. It doesn't feel like surviving anymore."
      ],
      "epilogue": "You scavenge the ruins for another three months before finding a radio signal from the coast."
    },
    {
      "id": "ending_community_leader",
      "title": "The Last City",
      "type": "good",
      "priority": 20,
      "conditions": {
        "requiredFlags": ["survived_one_year", "has_group", "built_shelter"],
        "requiredStats": [
          { "stat": "leadership", "min": 15 },
          { "stat": "trust", "min": 12 }
        ]
      },
      "narrative": [
        "You didn't just survive. You built something.",
        "Forty-three people call this place home now. They argue about rations and watch schedules and who gets the corner room.",
        "Normal problems. Human problems. You never thought you'd be grateful for those."
      ],
      "epilogue": "Three years later, another settlement sends a radio signal. They've heard about you."
    }
  ]
}
```

### TypeScript Interface

```typescript
export interface Ending {
  id: string
  title: string
  type: 'bad' | 'neutral' | 'good' | 'secret'
  priority: number // Higher = checked last; good endings should have higher priority
  conditions: ConditionSet
  narrative: string[]
  epilogue: string | null
}
```

---

## Flags Reference Convention

Flags are `string → boolean` values stored in game state. Naming convention:

| Pattern                | Example                                      |
| ---------------------- | -------------------------------------------- |
| `met_{npc}`            | `met_doctor`, `met_militia_leader`           |
| `did_{action}`         | `did_warn_neighbors`, `did_steal_supplies`   |
| `has_{thing}`          | `has_group`, `has_shelter`                   |
| `chose_{path}`         | `chose_to_stay`, `chose_to_flee`             |
| `survived_{milestone}` | `survived_one_year`, `survived_first_winter` |
| `betrayed_{npc}`       | `betrayed_militia`                           |

Flags are **permanent within a playthrough** — once set to `true`, they don't revert (unless a later scene explicitly sets them to `false`, which should be used sparingly).
