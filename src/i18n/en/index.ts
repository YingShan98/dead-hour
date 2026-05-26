import type { Translation } from '../i18n-types'

/**
 * English translation — scaffolded and ready for translation.
 * Falls back to zh for any key absent here.
 * Run `pnpm i18n:generate` after editing to regenerate types.
 */
const en: Translation = {
  // ── General UI ─────────────────────────────────────────────────────────────
  ui: {
    loading: 'Loading…',
    error: 'An error occurred',
    dismiss: 'Dismiss',
    back: 'Back',
    confirm: 'Confirm',
    cancel: 'Cancel',
    continue: 'Continue →',
  },

  // ── Title Page ─────────────────────────────────────────────────────────────
  title: {
    tagline: '— a word adventure —',
    subtitle: '48 hours before everything changed.',
    newGame: 'New Game',
    continue: 'Continue',
    version: 'v{version} — solo project',
  },

  // ── Game Page ──────────────────────────────────────────────────────────────
  game: {
    yourMove: 'Your move',
    loadingScene: 'Loading scene…',
    requiresHint: 'Requires {hint}',
    autoSaved: 'Auto-saved',
    crisis: {
      timeExpired: 'Time is up. The sounds outside have changed.',
      awakening: "Something has changed. You can't name it yet.",
    },
  },

  // ── Time display (scene narrative) ─────────────────────────────────────────
  time: {
    beforeOutbreak: 'T-{hours}h — Before the Outbreak',
    dayOne: 'Day 1 — Hour Zero',
    day: 'Day {day}',
  },

  // ── Countdown widget ───────────────────────────────────────────────────────
  countdown: {
    label: 'Time Remaining',
    hours: '{hours}h',
    expired: '——',
    urgency: {
      safe: '',
      warning: 'Running low',
      critical: 'Critical',
      expired: 'Crisis',
    },
  },

  // ── Security meter widget ──────────────────────────────────────────────────
  security: {
    label: 'Security',
    level: {
      none: 'Undefended',
      basic: 'Basic',
      solid: 'Solid',
      fortress: 'Fortress',
    },
  },

  // ── Transformation hints ───────────────────────────────────────────────────
  hint: {
    infection: {
      subtle: "Something is off about your right middle finger. You can't say what.",
      noticeable:
        'The feeling under your skin is getting harder to ignore. Not pain. Something else.',
      alarming:
        'Some thoughts arrive in a way that feels unfamiliar. It takes you longer to push them down.',
      critical: "The boundary is blurring. You're no longer sure which thoughts are yours.",
    },
    will: {
      awakening: "Your perception is changing. But you're still you.",
      collapse: "You're starting to lose track of what you actually want.",
    },
  },

  // ── Stat panel signals ─────────────────────────────────────────────────────
  statSignal: {
    infection: {
      spreading: 'Spreading',
      critical: 'Critical',
    },
    will: {
      awakening: 'Awakening',
      collapse: 'Collapsing',
    },
  },

  // ── Stats ──────────────────────────────────────────────────────────────────
  stats: {
    label: 'Status',
    health: 'Health',
    morale: 'Morale',
    leadership: 'Leadership',
    stealth: 'Stealth',
    trust: 'Trust',
  },

  // ── Inventory ──────────────────────────────────────────────────────────────
  inventory: {
    label: 'Inventory',
    empty: 'Nothing carried.',
    quantity: '×{qty}',
    use: 'Use',
  },

  // ── Ending Page ────────────────────────────────────────────────────────────
  ending: {
    type: {
      bad: 'bad ending',
      neutral: 'neutral ending',
      good: 'good ending',
      secret: 'secret ending',
    },
    choicesMade: 'Choices made: {count}',
    scenesVisited: 'Scenes visited: {count}',
    playAgain: 'Play Again',
    returnToTitle: 'Return to Title',
    noData: 'No ending data found.',
  },

  // ── Save slots ─────────────────────────────────────────────────────────────
  save: {
    slot: 'Save {slot}',
    empty: 'Empty slot',
    savedAt: 'Saved at {date}',
  },

  // ── Achievements ───────────────────────────────────────────────────────────
  achievements: {
    label: 'Achievements',
    unlocked: 'Unlocked: {title}',
    secret: '???',
  },

  // ── Errors ─────────────────────────────────────────────────────────────────
  errors: {
    sceneNotFound: 'Scene not found: {id}',
    saveNotFound: 'Save slot {slot} does not exist.',
    choiceUnavailable: 'That choice is no longer available.',
    noGameLoaded: 'No game loaded.',
  },
}

export default en
