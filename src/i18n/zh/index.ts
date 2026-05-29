import type { BaseTranslation } from '../i18n-types'

const zh: BaseTranslation = {
  // ── General UI ─────────────────────────────────────────────────────────────
  ui: {
    loading: '载入中…',
    error: '发生错误',
    dismiss: '关闭',
    back: '返回',
    confirm: '确认',
    cancel: '取消',
    continue: '继续 →',
  },

  // ── Title Page ─────────────────────────────────────────────────────────────
  title: {
    tagline: '一个文字冒险游戏',
    subtitle: '一切改变的前四十八小时。',
    newGame: '开始新游戏',
    continue: '继续游戏',
    version: 'v{version:string} — 独立开发',
  },

  // ── Game Page ──────────────────────────────────────────────────────────────
  game: {
    yourMove: '你的选择',
    loadingScene: '场景载入中…',
    requiresHint: '需要{hint:string}',
    autoSaved: '已自动存档',
    crisis: {
      timeExpired: '时间到了。外面的声音变了。',
      breachImminent: '防御正在失效。他们正在渗透进来。',
      baseOverrun: '基地已被攻陷。',
      awakening: '某些东西改变了。你还说不清楚是什么。',
    },
  },

  // ── Time display (scene narrative) ─────────────────────────────────────────
  time: {
    beforeOutbreak: 'T-{hours:number}小时 — 爆发前',
    dayOne: '第一天 — 零时',
    day: '第{day:number}天',
  },

  // ── Countdown widget ───────────────────────────────────────────────────────
  countdown: {
    label: '剩余时间',
    hours: '{hours:number}小时',
    expired: '——',
    urgency: {
      safe: '',
      warning: '时间不多',
      critical: '危急',
      expired: '危机已至',
    },
  },

  // ── Security meter widget ──────────────────────────────────────────────────
  security: {
    label: '防御指数',
    level: {
      none: '不设防',
      basic: '基础加固',
      solid: '相当安全',
      reinforced: '加固',
      secure: '安全',
      fortress: '钢铁要塞',
    },
  },

  // ── Transformation hints (shown between scene and choices) ─────────────────
  // Engine returns a key; components look up the string here.
  // Never reveal actual numbers — describe only what the body feels.
  hint: {
    infection: {
      subtle: '右手中指隐约有些不对劲，说不上来是什么。',
      noticeable: '皮下那种感觉越来越难以忽视。不是疼，是别的什么。',
      alarming: '某些念头出现的方式让你感到陌生。你花了更长时间才把它们压下去。',
      impending: '转化几乎完成。你正在失去自己。',
      critical: '边界在模糊。你已经不确定，某些念头，是不是你自己的。',
    },
    will: {
      awakening: '你的感知正在改变。但你依然是你。',
      collapse: '你开始不确定自己到底想要什么。',
    },
  },

  // ── Stat panel hidden-stat signals ─────────────────────────────────────────
  // Shown only when thresholds are crossed; never show numbers.
  statSignal: {
    infection: {
      dormant: '潜伏中',
      active: '活跃中',
      mutating: '变异中',
      spreading: '扩散中',
      critical: '异变临界',
    },
    will: {
      awakening: '觉醒临界',
      collapse: '濒临崩溃',
    },
  },

  // ── Stats ──────────────────────────────────────────────────────────────────
  stats: {
    label: '状态',
    health: '生命值',
    morale: '士气',
    leadership: '领导力',
    stealth: '潜行',
    trust: '信任',
  },

  // ── Inventory ──────────────────────────────────────────────────────────────
  inventory: {
    label: '背包',
    empty: '身无长物。',
    quantity: '×{qty:number}',
    use: '使用',
    workshop: '工作台',
    recipes: '配方',
    materials: '材料',
  },

  // ── Ending Page ────────────────────────────────────────────────────────────
  ending: {
    type: {
      bad: '坏结局',
      neutral: '普通结局',
      good: '好结局',
      secret: '隐藏结局',
    },
    choicesMade: '选择次数：{count:number}',
    scenesVisited: '访问场景：{count:number}',
    journal: '日记',
    journalEntries: '日记条目',
    journalEmpty: '暂无条目。',
    peiNotebook: '裴嘉应的笔记本',
    peiNotebookNewEntry: '有新条目可用！',
    overclock: '超频',
    depravedInsight: '异化视角',

    playAgain: '再玩一次',
    returnToTitle: '返回主菜单',
    noData: '未找到结局数据。',
  },

  // ── Save slots ─────────────────────────────────────────────────────────────
  save: {
    slot: '存档 {slot:number}',
    empty: '空存档',
    savedAt: '存档于 {date:string}',
  },

  // ── Achievements ───────────────────────────────────────────────────────────
  achievements: {
    label: '成就',
    unlocked: '已解锁：{title:string}',
    secret: '???',
  },

  // ── Errors ─────────────────────────────────────────────────────────────────
  errors: {
    sceneNotFound: '找不到场景：{id:string}',
    saveNotFound: '存档 {slot:number} 不存在。',
    choiceUnavailable: '该选项目前不可用。',
    noGameLoaded: '未载入游戏。',
  },
}

export default zh
