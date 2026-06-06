import type { GameState } from './types'

export const DEFAULT_GAME_STATE: GameState = {
  currentSceneId: 'scene_101',
  gameTime: { hoursFromStart: -48 },
  stats: {
    health: 15,
    morale: 10,
    leadership: 0,
    stealth: 0,
    money: 200,
    trust: 5,
    infection: 0, // rises to 1 via scene_101 onEnter (the wound)
    will: 6,
    hunger: 0,
  },
  inventory: [
    { itemId: 'canned_food', quantity: 2 },
    { itemId: 'iodine_kit', quantity: 1 },
    { itemId: 'painkillers', quantity: 1 },
  ],
  flags: {},
  visitedScenes: [],
  choiceHistory: [],
  journalLog: [],

  // ── Fortification ────────────────────────────────────────────────────────────
  security: 0, // fortification level — player builds this up

  // ── Hunger tracking ──────────────────────────────────────────────────────────
  lastProcessedDay: -2, // scene_101 starts at hoursFromStart -48 = day -2
  timeCostToday: 0,

  // ── Meta ─────────────────────────────────────────────────────────────────────
  saveSlot: 0,
  playthroughId: '',
}

// ── Constants used across engine and UI ──────────────────────────────────────

// The outbreak (hoursFromStart = 0) is when the infected arrive — matches "爆发前" scene label
export const CRISIS_ARRIVAL_HOUR = 0
export const SECURITY_MAX = 100
export const INFECTION_MAX = 10
export const WILL_MAX = 10

// Thresholds for narrative and UI signals
export const INFECTION_THRESHOLD_SUBTLE = 3 // first hint in prose
export const INFECTION_THRESHOLD_NOTICEABLE = 5
export const INFECTION_THRESHOLD_ALARMING = 7
export const INFECTION_THRESHOLD_TURNING = 8 // zombie_turning flag fires
export const INFECTION_FULL = 10 // full_zombie ending

export const WILL_AWAKENING_THRESHOLD = 8 // superpower path opens
export const WILL_COLLAPSE_THRESHOLD = 2 // morale collapse warning

export const SECURITY_FORTRESS_THRESHOLD = 80 // irony ending available
export const SECURITY_SOLID_THRESHOLD = 50
export const SECURITY_BASIC_THRESHOLD = 20

export const TIME_WARNING_THRESHOLD = 4 // amber
export const TIME_CRITICAL_THRESHOLD = 2 // red
