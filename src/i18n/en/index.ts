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
    endingsFound: 'Endings found: {count} / {total}',
    slots: {
      heading: 'Choose Save',
      empty: 'Empty',
      continue: 'Continue',
      startNew: 'New Game',
      overwrite: 'New Game',
      delete: 'Delete',
      confirmOverwrite: 'This will overwrite Save {slot} ({day}) — confirm?',
      confirmDelete: 'This will permanently delete Save {slot} ({day}) — confirm?',
    },
  },

  // ── Game Page ──────────────────────────────────────────────────────────────
  game: {
    yourMove: 'Your move',
    loadingScene: 'Loading scene…',
    requiresHint: 'Requires {hint}',
    autoSaved: 'Auto-saved',
    keyHint: 'Press 1–N to select · Enter to confirm',
    crisis: {
      timeExpired: 'Time is up. The sounds outside have changed.',
      breachImminent: 'The defenses are failing. They are getting in.',
      baseOverrun: 'The base has been overrun.',
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
    label: 'Until Outbreak',
    labelElapsed: 'Time Elapsed',
    hours: '{hours}h',
    expired: '——',
    day: 'Day {day}',
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
      reinforced: 'Reinforced',
      secure: 'Secure',
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
      impending: 'The transformation is almost complete. You are losing yourself.',
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
      dormant: 'Dormant',
      active: 'Active',
      mutating: 'Mutating',
      spreading: 'Spreading',
      critical: 'Critical',
    },
    will: {
      awakening: 'Awakening',
      collapse: 'Collapsing',
    },
    trust: {
      unstable: 'Trust · Wavering',
      critical: 'Trust · Collapse Imminent',
    },
    leadership: {
      established: 'Leadership · Respected',
      pillar: 'Leadership · Cornerstone',
      indispensable: 'Leadership · Indispensable',
    },
  },

  // ── Stats ──────────────────────────────────────────────────────────────────
  stats: {
    label: 'Status',
    health: 'Health',
    morale: 'Morale',
    leadership: 'Leadership',
    stealth: 'Stealth',
    money: 'Money',
    trust: 'Trust',
  },

  // ── Inventory ──────────────────────────────────────────────────────────────
  inventory: {
    label: 'Inventory',
    empty: 'Nothing carried.',
    quantity: '×{qty}',
    use: 'Use',
    workshop: 'Workshop',
    recipes: 'Recipes',
    materials: 'Materials',
  },

  // ── Journal panel ─────────────────────────────────────────────────────────
  journal: {
    label: 'Journal',
    day: 'Day {day}',
    empty: "You haven't written anything yet.",
    toggle: 'Expand',
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
    daysSurvived: 'Day {count}',
    journal: 'Journal',
    journalEntries: 'Journal Entries',
    journalEmpty: 'No entries yet.',
    peiNotebook: "Pei's Notebook",
    peiNotebookNewEntry: 'New entry available!',
    overclock: 'Overclock',
    depravedInsight: 'Depraved Insight',

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

  // ── NPC status panel ──────────────────────────────────────────────────────
  npcs: {
    label: 'Characters',
  },

  // ── Settings panel ────────────────────────────────────────────────────────
  settings: {
    label: 'Settings',
    fontSize: 'Text size',
    reduceMotion: 'Reduce motion',
    soundEnable: 'Enable sound',
    soundDisable: 'Disable sound',
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
