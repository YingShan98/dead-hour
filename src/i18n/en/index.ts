import type { BaseTranslation } from '../i18n-types'

const en = {
  // ── Title screen ─────────────────────────────────────────────────────────
  tagline: '— Text Adventure Game —',
  gameSubtitle: 'In the 48 hours before everything changes.',
  newGame: 'New Game',
  continue: 'Continue',
  versionLabel: 'v0.1.0 — Independent Game',

  // ── Loading & errors ──────────────────────────────────────────────────────
  loading: 'Loading...',
  loadingScene: 'Loading scene…',
  dismiss: 'Dismiss',

  // ── Game page ─────────────────────────────────────────────────────────────
  yourMove: 'Your Move',
  requirementsNotMet: 'Requirements not met',

  // ── Stat panel ────────────────────────────────────────────────────────────
  statusLabel: 'Status',
  statHealth: 'Health',
  statMorale: 'Morale',
  statLeadership: 'Leadership',
  statStealth: 'Stealth',

  // ── Inventory panel ───────────────────────────────────────────────────────
  inventoryLabel: 'Inventory',
  nothingCarried: 'Nothing carried.',

  // ── Scene time display ────────────────────────────────────────────────────
  timeBeforeOutbreak: 'T-{hours:number} hours — Before Outbreak',
  timeHourZero: 'Day 1 — Hour Zero',
  timeDay: 'Day {days:number}',

  // ── Ending screen ─────────────────────────────────────────────────────────
  endingTypeBad: 'Bad Ending',
  endingTypeNeutral: 'Neutral Ending',
  endingTypeGood: 'Good Ending',
  endingTypeSecret: 'Secret Ending',
  noEndingData: 'No ending data found.',
  returnToTitle: 'Return to Title',
  playAgain: 'Play Again',
  choicesMade: 'Choices Made: {count:number}',
  scenesVisited: 'Scenes Visited: {count:number}',
} satisfies BaseTranslation

export default en
