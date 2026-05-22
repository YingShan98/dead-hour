import type { GameFlag } from '@/data/flags'
import { Locales } from '@/i18n/i18n-types'
export type { GameFlag }

// ─── Stat Keys ───────────────────────────────────────────────────────────────

export type StatKey = 'health' | 'morale' | 'leadership' | 'stealth' | 'trust' | 'infection' | 'will'

export type PlayerStats = Record<StatKey, number>

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

// ─── Items ────────────────────────────────────────────────────────────────────

export type ItemCategory = 'medical' | 'food' | 'tool' | 'weapon' | 'misc'

export interface ItemDefinition {
  id: string
  label: LocaleString
  description: LocaleString
  category: ItemCategory
  stackable: boolean
  maxStack: number
  usable: boolean
  useEffect: EffectSet | null
}

export interface InventoryItem {
  itemId: string
  quantity: number
}

// ─── Conditions & Effects ─────────────────────────────────────────────────────

export interface StatCondition {
  stat: StatKey
  min?: number
  max?: number
}

export interface ItemCondition {
  itemId: string
  minQuantity?: number
}

export interface ConditionSet {
  requiredFlags?: GameFlag[]
  blockedFlags?: GameFlag[]
  requiredStats?: StatCondition[]
  requiredItems?: ItemCondition[]
}

export interface ItemEffect {
  itemId: string
  delta: number // positive = gain, negative = consume
}

export interface EffectSet {
  flags?: Partial<Record<GameFlag, boolean>>
  stats?: Partial<Record<StatKey, number>> // delta values
  items?: ItemEffect[]
}

// ─── Localisation ─────────────────────────────────────────────────────────────
//
// LocaleString is a map of locale → text.
// Only the base locale (zh) is required. Other locales are optional —
// the engine falls back to zh when a locale key is absent.
//
// In scene JSON:
//   "narrative": [
//     { "zh": "地铁又晚点了。" },
//     { "zh": "你看到手机上有一段病毒视频。", "en": "A viral video is trending on your phone." }
//   ]

export type LocaleString = {
  [L in Locales]?: string
} & {
  zh: string    // base locale always required
}

// ─── Scenes & Choices ─────────────────────────────────────────────────────────

export type Act = 'act1' | 'act2' | 'act3' | 'act4'

export interface GameTime {
  hoursFromStart: number // negative = before outbreak, positive = after
}

export interface Choice {
  id: string
  text: LocaleString
  conditions: ConditionSet
  effects: EffectSet
  nextSceneId: string
  hint?: LocaleString // shown as a tooltip when choice is locked
}

export interface Scene {
  id: string
  title: LocaleString
  act: Act
  gameTime: GameTime
  narrative: LocaleString[] // array of paragraphs
  conditions: ConditionSet
  choices: Choice[]
  onEnter?: EffectSet // effects applied automatically on scene entry
}

// ─── Endings ──────────────────────────────────────────────────────────────────

export type EndingType = 'bad' | 'neutral' | 'good' | 'secret'

export interface Ending {
  id: string
  title: LocaleString
  type: EndingType
  priority: number // lower = checked first; bad endings have higher priority
  conditions: ConditionSet
  narrative: LocaleString[]
  epilogue: LocaleString | null
}

// ─── Game State ───────────────────────────────────────────────────────────────

export interface ChoiceRecord {
  sceneId: string
  choiceId: string
}

export interface GameState {
  currentSceneId: string
  gameTime: GameTime
  stats: PlayerStats
  inventory: InventoryItem[]
  flags: Partial<Record<GameFlag, boolean>>
  visitedScenes: string[]
  choiceHistory: ChoiceRecord[]
  saveSlot: number
  playthroughId: string
  savedAt?: string
}
