# 02 — Data Model

### Dead Hour | Schema Reference

All story content is stored as JSON. This document defines the exact shape of every data structure — both the JSON files and their corresponding TypeScript interfaces.

---

## Scene Schema

A **scene** is a single narrative moment — a location, a conversation, a crisis. It contains the text the player reads and the choices available to them.

### JSON File: `scene_101.json`

```json
{
  "id": "scene_101",
  "title": { "zh": "早班地铁" },
  "act": "act1",
  "gameTime": { "hoursFromStart": -48 },

  "narrative": [
    {
      "zh": "地铁又晚点了。你看了一眼手机——社交媒体上有一段模糊的视频在传，市政厅附近，一个人咬了一个警察。"
    },
    { "zh": "周围的人划过去，表情介于恶心和无聊之间。没有人显得警惕。" },
    { "zh": "你的站快到了，会议还有二十分钟。" }
  ],

  "conditions": {
    "requiredFlags": [],
    "blockedFlags": [],
    "requiredStats": [],
    "requiredItems": []
  },

  "choices": [
    {
      "id": "choice_101a",
      "text": { "zh": "截图保存，继续刷。大概没什么事。" },
      "conditions": {},
      "effects": {
        "flags": { "noticed_outbreak_signs": true },
        "stats": { "morale": 0 },
        "items": []
      },
      "nextSceneId": "scene_102"
    },
    {
      "id": "choice_101b",
      "text": { "zh": "把视频给旁边的人看，说了一句。" },
      "conditions": {},
      "effects": {
        "flags": { "noticed_outbreak_signs": true },
        "stats": { "leadership": 1 },
        "items": []
      },
      "nextSceneId": "scene_102"
    },
    {
      "id": "choice_101c",
      "text": { "zh": "下一站下车，去市政厅方向看看。" },
      "conditions": {
        "requiredStats": [{ "stat": "morale", "min": 5 }]
      },
      "effects": {
        "flags": { "researched_outbreak_early": true },
        "stats": { "leadership": 2, "health": -1 },
        "items": []
      },
      "nextSceneId": "scene_103"
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

// All user-facing text uses LocaleString. The base locale 'zh' is always required;
// 'en' is optional and falls back to 'zh' when absent.
export type LocaleString = { zh: string; en?: string }

export interface Scene {
  id: string
  title: LocaleString
  act: Act
  gameTime: { hoursFromStart: number }

  // Array of paragraphs — rendered sequentially
  narrative: LocaleString[]

  // Conditional paragraphs prepended/appended when their conditions pass
  conditionalNarrative?: ConditionalNarrativeParagraph[]

  // Conditions the player must meet to even enter this scene
  conditions: ConditionSet

  choices: Choice[]

  // Effects applied automatically when entering the scene (no choice required)
  onEnter?: EffectSet
}

export type ConditionalNarrativeParagraph = LocaleString & {
  conditions: ConditionSet
  position?: 'prefix' | 'suffix' // defaults to 'prefix'
}

export interface Choice {
  id: string
  text: LocaleString

  // Conditions the player must meet for this choice to appear
  conditions: ConditionSet

  // What happens when this choice is selected
  effects: EffectSet

  // Where this choice leads
  nextSceneId: string

  // Shown as a tooltip when the choice is locked
  hint?: LocaleString

  // Shown immediately after selection, before the next scene loads
  consequence?: LocaleString[]
}

export interface ConditionSet {
  requiredFlags?: GameFlag[]
  blockedFlags?: GameFlag[]
  requiredStats?: StatCondition[]
  requiredItems?: ItemCondition[]
  security?: { min?: number; max?: number } // gate on fortification level
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
  flags?: Partial<Record<GameFlag, boolean>>
  stats?: Partial<Record<StatKey, number>> // delta values — clamped by executor
  items?: ItemEffect[]
  security?: number // delta to fortification index
  timeCost?: number // hours consumed from countdown
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
      "label": { "zh": "急救箱" },
      "description": { "zh": "基础急救用品。使用后恢复3点生命值，感染值-1。" },
      "category": "medical",
      "stackable": true,
      "maxStack": 5,
      "usable": true,
      "useEffect": { "stats": { "health": 3, "infection": -1 } }
    },
    {
      "id": "canned_food",
      "label": { "zh": "罐头食品" },
      "description": { "zh": "耐储存食物。食用后恢复1点士气。" },
      "category": "food",
      "stackable": true,
      "maxStack": 20,
      "usable": true,
      "useEffect": { "stats": { "morale": 1 } }
    },
    {
      "id": "radio",
      "label": { "zh": "手提收音机" },
      "description": { "zh": "能接收广播信号。解锁基于无线电的场景选项。" },
      "category": "tool",
      "stackable": false,
      "maxStack": 1,
      "usable": false,
      "useEffect": null
    },
    {
      "id": "knife",
      "label": { "zh": "多功能折叠刀" },
      "description": { "zh": "轻巧多用。解锁部分近身对抗选项。" },
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
  label: LocaleString
  description: LocaleString
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
      "title": { "zh": "城市吞噬了你" },
      "type": "bad",
      "priority": 1,
      "conditions": {
        "requiredStats": [{ "stat": "health", "max": 0 }]
      },
      "narrative": [
        { "zh": "身体撑不住了。你试图守住的这座城市不再需要你了。" },
        { "zh": "但在某个地方，有人记得你的名字。" }
      ],
      "epilogue": null
    },
    {
      "id": "ending_solo_survivor",
      "title": { "zh": "废墟中的独行者" },
      "type": "neutral",
      "priority": 10,
      "conditions": {
        "requiredFlags": ["survived_one_year"],
        "blockedFlags": ["has_group"],
        "requiredStats": [{ "stat": "health", "min": 1 }]
      },
      "narrative": [
        { "zh": "你活下来了。一个人。城市现在安静多了——不是平静，是空了。" },
        { "zh": "你停止了数日子。这种感觉不像是活下来，只是还没有死。" }
      ],
      "epilogue": { "zh": "又过了三个月，你在废墟里搜刮时，收音机里出现了一段来自海岸线的信号。" }
    },
    {
      "id": "ending_community_leader",
      "title": { "zh": "最后的城市" },
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
        { "zh": "你不只是活下来了。你建了一些东西。" },
        { "zh": "四十三个人现在管这里叫家。他们争论口粮、轮班表和谁睡角落的那张床。" },
        { "zh": "普通的问题。人类的问题。你以前从没想过自己会为这种事感到感激。" }
      ],
      "epilogue": { "zh": "三年后，另一个定居点发来了无线电信号。他们听说过你。" }
    }
  ]
}
```

### TypeScript Interface

```typescript
export interface Ending {
  id: string
  title: LocaleString
  type: 'bad' | 'neutral' | 'good' | 'secret'
  priority: number // lower = checked first; bad endings have higher priority
  conditions: ConditionSet
  narrative: LocaleString[]
  epilogue: LocaleString | null
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
