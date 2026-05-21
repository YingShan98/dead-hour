// ─── Stat Keys ───────────────────────────────────────────────────────────────

export type StatKey = 'health' | 'morale' | 'leadership' | 'stealth' | 'trust'

export type PlayerStats = Record<StatKey, number>

export interface StatDefinition {
  key: StatKey
  label: string
  description: string
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
  label: string
  description: string
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
  requiredFlags?: string[]
  blockedFlags?: string[]
  requiredStats?: StatCondition[]
  requiredItems?: ItemCondition[]
}

export interface ItemEffect {
  itemId: string
  delta: number // positive = gain, negative = consume
}

export interface EffectSet {
  flags?: Record<string, boolean>
  stats?: Partial<Record<StatKey, number>> // delta values
  items?: ItemEffect[]
}

// ─── Scenes & Choices ─────────────────────────────────────────────────────────

export type Act = 'act1' | 'act2' | 'act3' | 'act4'

export interface GameTime {
  hoursFromStart: number // negative = before outbreak, positive = after
}

export interface Choice {
  id: string
  text: string
  conditions: ConditionSet
  effects: EffectSet
  nextSceneId: string
  hint?: string // shown as a tooltip when choice is locked
}

export interface Scene {
  id: string
  title: string
  act: Act
  gameTime: GameTime
  narrative: string[] // array of paragraphs
  conditions: ConditionSet
  choices: Choice[]
  onEnter?: EffectSet // effects applied automatically on scene entry
}

// ─── Endings ──────────────────────────────────────────────────────────────────

export type EndingType = 'bad' | 'neutral' | 'good' | 'secret'

export interface Ending {
  id: string
  title: string
  type: EndingType
  priority: number // lower = checked first; good endings have higher priority
  conditions: ConditionSet
  narrative: string[]
  epilogue: string | null
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
  flags: Record<string, boolean>
  visitedScenes: string[]
  choiceHistory: ChoiceRecord[]
  saveSlot: number
  playthroughId: string
  savedAt?: string
}
