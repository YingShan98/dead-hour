import type { BaseTranslation } from '../i18n-types'

const zh = {
  // ── Title screen ─────────────────────────────────────────────────────────
  tagline: '— 文字冒险游戏 —',
  gameSubtitle: '在一切改变前的48小时。',
  newGame: '新游戏',
  continue: '继续',
  versionLabel: 'v0.1.0 — 独立作品',

  // ── Loading & errors ──────────────────────────────────────────────────────
  loading: '载入中...',
  loadingScene: '正在载入场景…',
  dismiss: '关闭',

  // ── Game page ─────────────────────────────────────────────────────────────
  yourMove: '你的选择',
  requirementsNotMet: '条件不满足',

  // ── Stat panel ────────────────────────────────────────────────────────────
  statusLabel: '状态',
  statHealth: '生命值',
  statMorale: '士气',
  statLeadership: '领导力',
  statStealth: '潜行',

  // ── Inventory panel ───────────────────────────────────────────────────────
  inventoryLabel: '背包',
  nothingCarried: '身无长物。',

  // ── Scene time display ────────────────────────────────────────────────────
  timeBeforeOutbreak: 'T-{hours:number}小时 — 爆发前',
  timeHourZero: '第一天 — 零时刻',
  timeDay: '第{days:number}天',

  // ── Ending screen ─────────────────────────────────────────────────────────
  endingTypeBad: '坏结局',
  endingTypeNeutral: '中立结局',
  endingTypeGood: '好结局',
  endingTypeSecret: '隐藏结局',
  noEndingData: '找不到结局数据。',
  returnToTitle: '返回主界面',
  playAgain: '再玩一次',
  choicesMade: '做出的选择：{count:number}',
  scenesVisited: '访问的场景：{count:number}',
} satisfies BaseTranslation

export default zh
