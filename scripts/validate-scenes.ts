/**
 * validate-scenes.ts
 *
 * Validates all game data files against their schemas.
 * Run with: pnpm validate-scenes
 *
 * Checks:
 *   [PARSE]     Valid JSON / parseable TypeScript source
 *   [STRUCTURE] Required fields exist and are the correct type
 *   [LOCALE]    Every LocaleString has a 'zh' key
 *   [FLAGS]     All flag references exist in the GameFlag union (flags.ts)
 *   [STATS]     All stat keys reference a key declared in stats.json
 *   [ITEMS]     All itemIds reference an id declared in items.json
 *   [GRAPH]     Every nextSceneId resolves to a real scene
 *   [GRAPH]     Every scene is reachable from scene_001
 *   [IDS]       scene.id matches filename; no duplicate IDs
 *   [IDS]       No duplicate choice IDs within a scene
 *
 * Exit codes: 0 = all valid, 1 = one or more errors
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.join(__dirname, '..')
const DATA_DIR = path.join(ROOT, 'src', 'data')

const VALID_ITEM_CATEGORIES = new Set(['medical', 'food', 'tool', 'weapon', 'misc'])
const VALID_ENDING_TYPES = new Set(['bad', 'neutral', 'good', 'secret'])
const VALID_ACTS = new Set(['act1', 'act2', 'act3', 'act4'])
const BASE_LOCALE = 'zh'

// ─── Types ────────────────────────────────────────────────────────────────────

interface LocaleString {
  zh: string
  en?: string
  [key: string]: string | undefined
}

interface StatCondition {
  stat: string
  min?: number
  max?: number
}

interface ItemCondition {
  itemId: string
  minQuantity?: number
}

interface ConditionSet {
  requiredFlags?: string[]
  blockedFlags?: string[]
  requiredStats?: StatCondition[]
  requiredItems?: ItemCondition[]
}

interface ItemEffect {
  itemId: string
  delta: number
}

interface EffectSet {
  flags?: Record<string, boolean>
  stats?: Record<string, number>
  items?: ItemEffect[]
}

interface Choice {
  id: string
  text: LocaleString
  hint?: LocaleString
  conditions: ConditionSet
  effects?: EffectSet
  nextSceneId: string
}

interface Scene {
  id: string
  title: LocaleString
  act: string
  gameTime: { hoursFromStart: number }
  narrative: LocaleString[]
  conditions: ConditionSet
  choices: Choice[]
  onEnter?: EffectSet
}

interface Registries {
  statKeys: Set<string>
  itemIds: Set<string>
  validFlags: Set<string>
}

// ─── Error tracking ───────────────────────────────────────────────────────────

const errors: string[] = []
const warnings: string[] = []

function addError(file: string, message: string) {
  errors.push(`${relative(file)}: ${message}`)
}

function addWarning(file: string, message: string) {
  warnings.push(`${relative(file)}: ${message}`)
}

function relative(file: string) {
  return path.relative(ROOT, file)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function readJson(file: string): unknown {
  try {
    return JSON.parse(readFileSync(file, 'utf8'))
  } catch (err) {
    addError(file, `invalid JSON (${(err as Error).message})`)
    return null
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function requireString(file: string, obj: Record<string, unknown>, key: string, context: string): boolean {
  if (typeof obj[key] !== 'string' || (obj[key] as string).trim() === '') {
    addError(file, `${context}.${key} must be a non-empty string`)
    return false
  }
  return true
}

function requireNumber(file: string, obj: Record<string, unknown>, key: string, context: string): boolean {
  if (typeof obj[key] !== 'number' || Number.isNaN(obj[key])) {
    addError(file, `${context}.${key} must be a number`)
    return false
  }
  return true
}

function requireBoolean(file: string, obj: Record<string, unknown>, key: string, context: string): boolean {
  if (typeof obj[key] !== 'boolean') {
    addError(file, `${context}.${key} must be a boolean`)
    return false
  }
  return true
}

function requireLocaleString(file: string, obj: Record<string, unknown>, key: string, context: string): boolean {
  const value = obj[key]
  if (!isObject(value)) {
    addError(file, `${context}.${key} must be a LocaleString object, got ${typeof value}`)
    return false
  }
  if (typeof value[BASE_LOCALE] !== 'string' || (value[BASE_LOCALE] as string).trim() === '') {
    addError(file, `${context}.${key} is missing required "${BASE_LOCALE}" key`)
    return false
  }
  return true
}

function validateLocaleString(file: string, value: unknown, fieldPath: string): boolean {
  if (!isObject(value)) {
    addError(file, `"${fieldPath}" must be a LocaleString object, got ${typeof value}`)
    return false
  }
  if (typeof value[BASE_LOCALE] !== 'string' || (value[BASE_LOCALE] as string).trim() === '') {
    addError(file, `"${fieldPath}" is missing required "${BASE_LOCALE}" key`)
    return false
  }
  return true
}

function collectFiles(dir: string, predicate: (f: string) => boolean): string[] {
  if (!existsSync(dir)) return []
  const files: string[] = []
  for (const entry of readdirSync(dir)) {
    const fullPath = path.join(dir, entry)
    if (statSync(fullPath).isDirectory()) {
      files.push(...collectFiles(fullPath, predicate))
    } else if (predicate(fullPath)) {
      files.push(fullPath)
    }
  }
  return files
}

// ─── Condition / Effect set validators ───────────────────────────────────────

function validateConditionSet(
  file: string,
  conditions: unknown,
  context: string,
  reg: Registries,
) {
  if (conditions === undefined) return
  if (!isObject(conditions)) {
    addError(file, `${context} must be an object`)
    return
  }

  if (conditions.requiredFlags !== undefined) {
    if (!Array.isArray(conditions.requiredFlags)) {
      addError(file, `${context}.requiredFlags must be an array`)
    } else {
      ;(conditions.requiredFlags as unknown[]).forEach((flag, i) => {
        if (typeof flag !== 'string') {
          addError(file, `${context}.requiredFlags[${i}] must be a string`)
        } else if (reg.validFlags.size > 0 && !reg.validFlags.has(flag)) {
          addError(file, `${context}.requiredFlags[${i}] references unknown flag "${flag}"`)
        }
      })
    }
  }

  if (conditions.blockedFlags !== undefined) {
    if (!Array.isArray(conditions.blockedFlags)) {
      addError(file, `${context}.blockedFlags must be an array`)
    } else {
      ;(conditions.blockedFlags as unknown[]).forEach((flag, i) => {
        if (typeof flag !== 'string') {
          addError(file, `${context}.blockedFlags[${i}] must be a string`)
        } else if (reg.validFlags.size > 0 && !reg.validFlags.has(flag)) {
          addError(file, `${context}.blockedFlags[${i}] references unknown flag "${flag}"`)
        }
      })
    }
  }

  if (conditions.requiredStats !== undefined) {
    if (!Array.isArray(conditions.requiredStats)) {
      addError(file, `${context}.requiredStats must be an array`)
    } else {
      ;(conditions.requiredStats as unknown[]).forEach((cond, i) => {
        const ctx = `${context}.requiredStats[${i}]`
        if (!isObject(cond)) { addError(file, `${ctx} must be an object`); return }
        if (!reg.statKeys.has(cond.stat as string)) {
          addError(file, `${ctx}.stat references unknown stat "${cond.stat}"`)
        }
        if (cond.min !== undefined && typeof cond.min !== 'number') {
          addError(file, `${ctx}.min must be a number`)
        }
        if (cond.max !== undefined && typeof cond.max !== 'number') {
          addError(file, `${ctx}.max must be a number`)
        }
        if (typeof cond.min === 'number' && typeof cond.max === 'number' && cond.min > cond.max) {
          addError(file, `${ctx}.min cannot be greater than max`)
        }
      })
    }
  }

  if (conditions.requiredItems !== undefined) {
    if (!Array.isArray(conditions.requiredItems)) {
      addError(file, `${context}.requiredItems must be an array`)
    } else {
      ;(conditions.requiredItems as unknown[]).forEach((cond, i) => {
        const ctx = `${context}.requiredItems[${i}]`
        if (!isObject(cond) || typeof cond.itemId !== 'string') {
          addError(file, `${ctx} must have an itemId string`); return
        }
        if (!reg.itemIds.has(cond.itemId)) {
          addError(file, `${ctx}.itemId references unknown item "${cond.itemId}"`)
        }
        if (cond.minQuantity !== undefined &&
            (!Number.isInteger(cond.minQuantity) || (cond.minQuantity as number) < 1)) {
          addError(file, `${ctx}.minQuantity must be a positive integer`)
        }
      })
    }
  }
}

function validateEffectSet(
  file: string,
  effects: unknown,
  context: string,
  reg: Registries,
) {
  if (effects === undefined || effects === null) return
  if (!isObject(effects)) {
    addError(file, `${context} must be an object`)
    return
  }

  if (effects.flags !== undefined) {
    if (!isObject(effects.flags)) {
      addError(file, `${context}.flags must be an object`)
    } else {
      for (const [key, val] of Object.entries(effects.flags)) {
        if (reg.validFlags.size > 0 && !reg.validFlags.has(key)) {
          addError(file, `${context}.flags sets unknown flag "${key}"`)
        }
        if (typeof val !== 'boolean') {
          addError(file, `${context}.flags.${key} must be a boolean`)
        }
      }
    }
  }

  if (effects.stats !== undefined) {
    if (!isObject(effects.stats)) {
      addError(file, `${context}.stats must be an object`)
    } else {
      for (const [key, val] of Object.entries(effects.stats)) {
        if (!reg.statKeys.has(key)) {
          addError(file, `${context}.stats references unknown stat "${key}"`)
        }
        if (typeof val !== 'number') {
          addError(file, `${context}.stats.${key} must be a number`)
        }
      }
    }
  }

  if (effects.items !== undefined) {
    if (!Array.isArray(effects.items)) {
      addError(file, `${context}.items must be an array`)
    } else {
      ;(effects.items as unknown[]).forEach((item, i) => {
        const ctx = `${context}.items[${i}]`
        if (!isObject(item)) { addError(file, `${ctx} must be an object`); return }
        if (typeof item.itemId !== 'string') {
          addError(file, `${ctx}.itemId must be a string`); return
        }
        if (!reg.itemIds.has(item.itemId)) {
          addError(file, `${ctx}.itemId references unknown item "${item.itemId}"`)
        }
        if (!Number.isInteger(item.delta)) {
          addError(file, `${ctx}.delta must be an integer`)
        }
      })
    }
  }
}

// ─── File validators ──────────────────────────────────────────────────────────

function loadValidFlags(): Set<string> {
  const file = path.join(DATA_DIR, 'flags.ts')
  const src = readFileSync(file, 'utf-8')
  const start = src.indexOf('export type GameFlag =')
  if (start === -1) {
    console.warn('  ⚠  Could not find GameFlag type in flags.ts — flag validation skipped')
    return new Set()
  }
  // Collect until the next top-level export or end of file
  const nextExport = src.indexOf('\nexport ', start + 1)
  const section = src.slice(start, nextExport > -1 ? nextExport : undefined)
  const flags = [...section.matchAll(/\|\s*'([\w_]+)'/g)].map(m => m[1])
  return new Set(flags)
}

function validateStats(): Set<string> {
  const file = path.join(DATA_DIR, 'stats.json')
  const data = readJson(file)
  const statKeys = new Set<string>()

  if (!data) return statKeys
  if (!isObject(data) || !Array.isArray(data.stats)) {
    addError(file, 'stats must be an array at root key "stats"')
    return statKeys
  }

  ;(data.stats as unknown[]).forEach((stat, i) => {
    const context = `stats[${i}]`
    if (!isObject(stat)) { addError(file, `${context} must be an object`); return }

    if (requireString(file, stat, 'key', context)) {
      if (statKeys.has(stat.key as string)) addError(file, `duplicate stat key "${stat.key}"`)
      statKeys.add(stat.key as string)
    }

    requireLocaleString(file, stat, 'label', context)
    requireLocaleString(file, stat, 'description', context)
    requireString(file, stat, 'icon', context)
    requireNumber(file, stat, 'default', context)
    requireNumber(file, stat, 'min', context)
    requireNumber(file, stat, 'max', context)
    requireBoolean(file, stat, 'visible', context)

    if (typeof stat.min === 'number' && typeof stat.max === 'number' && stat.min > stat.max) {
      addError(file, `${context}.min cannot be greater than max`)
    }
    if (
      typeof stat.default === 'number' &&
      typeof stat.min === 'number' &&
      typeof stat.max === 'number' &&
      (stat.default < stat.min || stat.default > stat.max)
    ) {
      addError(file, `${context}.default must be between min and max`)
    }
  })

  return statKeys
}

function validateItems(reg: Registries): Set<string> {
  const file = path.join(DATA_DIR, 'items.json')
  const data = readJson(file)
  const itemIds = new Set<string>()

  if (!data) return itemIds
  if (!isObject(data) || !Array.isArray(data.items)) {
    addError(file, 'items must be an array at root key "items"')
    return itemIds
  }

  ;(data.items as unknown[]).forEach((item, i) => {
    const context = `items[${i}]`
    if (!isObject(item)) { addError(file, `${context} must be an object`); return }

    if (requireString(file, item, 'id', context)) {
      if (itemIds.has(item.id as string)) addError(file, `duplicate item id "${item.id}"`)
      itemIds.add(item.id as string)
    }

    requireLocaleString(file, item, 'label', context)
    requireLocaleString(file, item, 'description', context)
    requireBoolean(file, item, 'stackable', context)
    requireBoolean(file, item, 'usable', context)

    if (!VALID_ITEM_CATEGORIES.has(item.category as string)) {
      addError(file, `${context}.category has unsupported value "${item.category}"`)
    }
    if (!Number.isInteger(item.maxStack) || (item.maxStack as number) < 1) {
      addError(file, `${context}.maxStack must be a positive integer`)
    }

    if (item.useEffect !== null) {
      validateEffectSet(file, item.useEffect, `${context}.useEffect`, reg)
    }
  })

  return itemIds
}

function validateEndings(reg: Registries) {
  const file = path.join(DATA_DIR, 'endings.json')
  const data = readJson(file)
  const endingIds = new Set<string>()

  if (!data) return
  if (!isObject(data) || !Array.isArray(data.endings)) {
    addError(file, 'endings must be an array at root key "endings"')
    return
  }

  ;(data.endings as unknown[]).forEach((ending, i) => {
    const context = `endings[${i}]`
    if (!isObject(ending)) { addError(file, `${context} must be an object`); return }

    if (requireString(file, ending, 'id', context)) {
      if (endingIds.has(ending.id as string)) addError(file, `duplicate ending id "${ending.id}"`)
      endingIds.add(ending.id as string)
    }

    requireLocaleString(file, ending, 'title', context)
    requireNumber(file, ending, 'priority', context)

    if (!VALID_ENDING_TYPES.has(ending.type as string)) {
      addError(file, `${context}.type has unsupported value "${ending.type}"`)
    }

    validateConditionSet(file, ending.conditions, `${context}.conditions`, reg)

    if (!Array.isArray(ending.narrative) || (ending.narrative as unknown[]).length === 0) {
      addError(file, `${context}.narrative must be a non-empty array`)
    } else {
      ;(ending.narrative as unknown[]).forEach((para, j) => {
        validateLocaleString(file, para, `${context}.narrative[${j}]`)
      })
    }

    if (ending.epilogue !== null && ending.epilogue !== undefined) {
      validateLocaleString(file, ending.epilogue, `${context}.epilogue`)
    }
  })
}

function validateScenes(reg: Registries) {
  const sceneDir = path.join(DATA_DIR, 'scenes')
  const sceneFiles = collectFiles(sceneDir, f => f.endsWith('.json'))

  if (sceneFiles.length === 0) {
    addError(sceneDir, 'no scene JSON files found')
    return
  }

  const scenes = new Map<string, { file: string; scene: Scene }>()
  const outgoingLinks = new Map<string, string[]>()
  const incomingCounts = new Map<string, number>()

  // ── Per-scene validation ──────────────────────────────────────────────────
  for (const file of sceneFiles) {
    const raw = readJson(file)
    if (!raw) continue
    const context = 'scene'

    if (!isObject(raw)) { addError(file, 'scene file must contain an object'); continue }

    if (requireString(file, raw, 'id', context)) {
      if (scenes.has(raw.id as string)) {
        addError(file, `duplicate scene id "${raw.id}" also found in ${relative(scenes.get(raw.id as string)!.file)}`)
      }
      const expectedId = path.basename(file, '.json')
      if (raw.id !== expectedId) {
        addWarning(file, `filename does not match scene id "${raw.id}"`)
      }
      scenes.set(raw.id as string, { file, scene: raw as unknown as Scene })
      incomingCounts.set(raw.id as string, 0)
    }

    requireLocaleString(file, raw, 'title', context)

    if (!VALID_ACTS.has(raw.act as string)) {
      addError(file, `${context}.act has unsupported value "${raw.act}"`)
    }

    if (!isObject(raw.gameTime)) {
      addError(file, `${context}.gameTime must be an object`)
    } else {
      requireNumber(file, raw.gameTime as Record<string, unknown>, 'hoursFromStart', `${context}.gameTime`)
    }

    if (!Array.isArray(raw.narrative) || (raw.narrative as unknown[]).length === 0) {
      addError(file, `${context}.narrative must be a non-empty array`)
    } else {
      ;(raw.narrative as unknown[]).forEach((para, i) => {
        validateLocaleString(file, para, `${context}.narrative[${i}]`)
      })
    }

    validateConditionSet(file, raw.conditions, `${context}.conditions`, reg)
    validateEffectSet(file, raw.onEnter, `${context}.onEnter`, reg)

    if (!Array.isArray(raw.choices)) {
      addError(file, `${context}.choices must be an array`)
      continue
    }

    const choiceIds = new Set<string>()
    outgoingLinks.set(raw.id as string, [])

    if ((raw.choices as unknown[]).length === 0) {
      addWarning(file, 'scene has no choices')
    }

    ;(raw.choices as unknown[]).forEach((choice, i) => {
      const choiceCtx = `${context}.choices[${i}]`
      if (!isObject(choice)) { addError(file, `${choiceCtx} must be an object`); return }

      if (requireString(file, choice, 'id', choiceCtx)) {
        if (choiceIds.has(choice.id as string)) addError(file, `duplicate choice id "${choice.id}"`)
        choiceIds.add(choice.id as string)
      }

      validateLocaleString(file, choice.text, `${choiceCtx}.text`)
      requireString(file, choice, 'nextSceneId', choiceCtx)

      if (choice.hint !== undefined) {
        validateLocaleString(file, choice.hint, `${choiceCtx}.hint`)
      }

      validateConditionSet(file, choice.conditions, `${choiceCtx}.conditions`, reg)
      validateEffectSet(file, choice.effects, `${choiceCtx}.effects`, reg)

      if (typeof choice.nextSceneId === 'string') {
        outgoingLinks.get(raw.id as string)!.push(choice.nextSceneId)
      }
    })
  }

  // ── Graph: broken links + incoming counts ─────────────────────────────────
  for (const [sceneId, links] of outgoingLinks.entries()) {
    const file = scenes.get(sceneId)?.file ?? sceneDir
    for (const targetId of links) {
      if (!scenes.has(targetId)) {
        addError(file, `choice points to missing scene "${targetId}"`)
      } else {
        incomingCounts.set(targetId, (incomingCounts.get(targetId) ?? 0) + 1)
      }
    }
  }

  // ── Graph: reachability from scene_001 ────────────────────────────────────
  if (scenes.has('scene_001')) {
    const reachable = findReachableScenes('scene_001', outgoingLinks)
    for (const [sceneId, { file }] of scenes.entries()) {
      if (!reachable.has(sceneId)) {
        addWarning(file, `scene "${sceneId}" is not reachable from scene_001`)
      }
    }
  } else {
    addError(sceneDir, 'required starting scene "scene_001" was not found')
  }

  // ── Graph: no-incoming warnings (orphans) ─────────────────────────────────
  for (const [sceneId, count] of incomingCounts.entries()) {
    if (sceneId !== 'scene_001' && count === 0) {
      const file = scenes.get(sceneId)?.file ?? sceneDir
      addWarning(file, `scene "${sceneId}" has no incoming links`)
    }
  }
}

function findReachableScenes(startId: string, outgoingLinks: Map<string, string[]>): Set<string> {
  const reachable = new Set<string>()
  const stack = [startId]
  while (stack.length > 0) {
    const id = stack.pop()!
    if (reachable.has(id)) continue
    reachable.add(id)
    for (const next of outgoingLinks.get(id) ?? []) {
      stack.push(next)
    }
  }
  return reachable
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  console.log('\n  Dead Hour — Data Validator\n')

  if (!existsSync(DATA_DIR)) {
    addError(DATA_DIR, 'data directory does not exist')
  } else {
    const validFlags = loadValidFlags()
    const statKeys = validateStats()
    const reg: Registries = { statKeys, itemIds: new Set(), validFlags }
    reg.itemIds = validateItems(reg)
    validateEndings(reg)
    validateScenes(reg)

    console.log(`  Flags:  ${validFlags.size}`)
    console.log(`  Stats:  ${statKeys.size}`)
    console.log(`  Items:  ${reg.itemIds.size}\n`)
  }

  if (warnings.length > 0) {
    console.warn('  Warnings:')
    for (const w of warnings) console.warn(`    - ${w}`)
    console.warn('')
  }

  if (errors.length > 0) {
    console.error('  Errors:')
    for (const e of errors) console.error(`    - ${e}`)
    console.error(`\n  FAILED — ${errors.length} error(s), ${warnings.length} warning(s)\n`)
    process.exitCode = 1
    return
  }

  console.log(`  PASSED — ${warnings.length} warning(s)\n`)
}

main()
