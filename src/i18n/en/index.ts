import type { Translation } from '../i18n-types'

/**
 * English translation — scaffolded and ready for translation.
 *
 * STATUS: Untranslated. The engine falls back to the base locale (zh)
 * for any key that is absent here.
 *
 * TO TRANSLATE: fill in the string values below.
 * Keys must exactly match the structure in src/i18n/zh/index.ts.
 * Run `pnpm i18n:generate` after editing to regenerate types.
 */
const en: Translation = {

  // ── General UI ─────────────────────────────────────────────────────────────
  ui: {
    loading:      'Loading…',
    error:        'An error occurred',
    dismiss:      'Dismiss',
    back:         'Back',
    confirm:      'Confirm',
    cancel:       'Cancel',
  },

  // ── Title Page ─────────────────────────────────────────────────────────────
  title: {
    tagline:      '— a word adventure —',
    subtitle:     '48 hours before everything changed.',
    newGame:      'New Game',
    continue:     'Continue',
    version:      'v{version} — solo project',
  },

  // ── Game Page ──────────────────────────────────────────────────────────────
  game: {
    yourMove:         'Your move',
    loadingScene:     'Loading scene…',
    requiresHint:     'Requires {hint}',
    autoSaved:        'Auto-saved',
  },

  // ── Time display ───────────────────────────────────────────────────────────
  time: {
    beforeOutbreak:   'T-{hours}h — Before the Outbreak',
    dayOne:           'Day 1 — Hour Zero',
    day:              'Day {day}',
  },

  // ── Stats ──────────────────────────────────────────────────────────────────
  stats: {
    label:        'Status',
    health:       'Health',
    morale:       'Morale',
    leadership:   'Leadership',
    stealth:      'Stealth',
    trust:        'Trust',
  },

  // ── Inventory ──────────────────────────────────────────────────────────────
  inventory: {
    label:        'Inventory',
    empty:        'Nothing carried.',
    quantity:     '×{qty}',
  },

  // ── Ending Page ────────────────────────────────────────────────────────────
  ending: {
    type: {
      bad:     'bad ending',
      neutral: 'neutral ending',
      good:    'good ending',
      secret:  'secret ending',
    },
    choicesMade:    'Choices made: {count}',
    scenesVisited:  'Scenes visited: {count}',
    playAgain:      'Play Again',
    returnToTitle:  'Return to Title',
    noData:         'No ending data found.',
  },

  // ── Save slots ─────────────────────────────────────────────────────────────
  save: {
    slot:       'Save {slot}',
    empty:      'Empty slot',
    savedAt:    'Saved at {date}',
  },

  // ── Achievements ───────────────────────────────────────────────────────────
  achievements: {
    label:      'Achievements',
    unlocked:   'Unlocked: {title}',
    secret:     '???',
  },

  // ── Errors ─────────────────────────────────────────────────────────────────
  errors: {
    sceneNotFound:    'Scene not found: {id}',
    saveNotFound:     'Save slot {slot} does not exist.',
    choiceUnavailable:'That choice is no longer available.',
    noGameLoaded:     'No game loaded.',
  },

}

export default en