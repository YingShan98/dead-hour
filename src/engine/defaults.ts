import type { GameState } from './types'

export const DEFAULT_GAME_STATE: GameState = {
  currentSceneId: 'scene_101',
  gameTime: { hoursFromStart: -48 },
  stats: {
    health: 10,
    morale: 10,
    leadership: 0,
    stealth: 0,
    money: 200,
    trust: 5,
    infection: 0, // rises to 1 via scene_101 onEnter (the wound)
    will: 5,
  },
  inventory: [],
  flags: {},
  visitedScenes: [],
  choiceHistory: [],
  journalLog: [],

  // ── Hybrid system ────────────────────────────────────────────────────────────
  security: 0, // fortification level — player builds this up
  timeRemaining: 12, // 12 hours before the infected reach the building

  // ── Meta ─────────────────────────────────────────────────────────────────────
  saveSlot: 0,
  playthroughId: '',
}

// ── Constants used across engine and UI ──────────────────────────────────────

export const TIME_START = 12 // total hours at game start
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
