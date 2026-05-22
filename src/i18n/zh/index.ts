import type { BaseTranslation } from "../i18n-types"

const zh = {

  // ── General UI ─────────────────────────────────────────────────────────────
  ui: {
    loading:      '载入中…',
    error:        '发生错误',
    dismiss:      '关闭',
    back:         '返回',
    confirm:      '确认',
    cancel:       '取消',
  },

  // ── Title Page ─────────────────────────────────────────────────────────────
  title: {
    tagline:      '一个文字冒险游戏',
    subtitle:     '一切改变的前四十八小时。',
    newGame:      '开始新游戏',
    continue:     '继续游戏',
    version:      'v{version:string} — 独立开发',
  },

  // ── Game Page ──────────────────────────────────────────────────────────────
  game: {
    yourMove:         '你的选择',
    loadingScene:     '场景载入中…',
    requiresHint:     '需要{hint:string}',
    autoSaved:        '已自动存档',
  },

  // ── Time display ───────────────────────────────────────────────────────────
  time: {
    beforeOutbreak:   'T-{hours:number}小时 — 爆发前',
    dayOne:           '第一天 — 零时',
    day:              '第{day:number}天',
  },

  // ── Stats ──────────────────────────────────────────────────────────────────
  stats: {
    label:        '状态',
    health:       '生命值',
    morale:       '士气',
    leadership:   '领导力',
    stealth:      '潜行',
    trust:        '信任',
  },

  // ── Inventory ──────────────────────────────────────────────────────────────
  inventory: {
    label:        '背包',
    empty:        '身无长物。',
    quantity:     '×{qty:number}',
  },

  // ── Ending Page ────────────────────────────────────────────────────────────
  ending: {
    type: {
      bad:     '坏结局',
      neutral: '普通结局',
      good:    '好结局',
      secret:  '隐藏结局',
    },
    choicesMade:    '选择次数：{count:number}',
    scenesVisited:  '访问场景：{count:number}',
    playAgain:      '再玩一次',
    returnToTitle:  '返回主菜单',
    noData:         '未找到结局数据。',
  },

  // ── Save slots ─────────────────────────────────────────────────────────────
  save: {
    slot:       '存档 {slot:number}',
    empty:      '空存档',
    savedAt:    '存档于 {date:string}',
  },

  // ── Achievements ───────────────────────────────────────────────────────────
  achievements: {
    label:      '成就',
    unlocked:   '已解锁：{title:string}',
    secret:     '???',
  },

  // ── Errors ─────────────────────────────────────────────────────────────────
  errors: {
    sceneNotFound:    '找不到场景：{id:string}',
    saveNotFound:     '存档 {slot:number} 不存在。',
    choiceUnavailable:'该选项目前不可用。',
    noGameLoaded:     '未载入游戏。',
  },

} satisfies BaseTranslation

export default zh
