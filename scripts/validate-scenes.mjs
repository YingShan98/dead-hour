import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const ROOT = process.cwd()
const DATA_DIR = path.join(ROOT, 'src', 'data')
const VALID_ACTS = new Set(['act1', 'act2', 'act3', 'act4'])
const VALID_ITEM_CATEGORIES = new Set(['medical', 'food', 'tool', 'weapon', 'misc'])
const VALID_ENDING_TYPES = new Set(['bad', 'neutral', 'good', 'secret'])

const errors = []
const warnings = []

function addError(file, message) {
  errors.push(`${relative(file)}: ${message}`)
}

function addWarning(file, message) {
  warnings.push(`${relative(file)}: ${message}`)
}

function relative(file) {
  return path.relative(ROOT, file)
}

function readJson(file) {
  try {
    return JSON.parse(readFileSync(file, 'utf8'))
  } catch (error) {
    addError(file, `invalid JSON (${error.message})`)
    return null
  }
}

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function requireString(file, object, key, context) {
  if (typeof object[key] !== 'string' || object[key].trim() === '') {
    addError(file, `${context}.${key} must be a non-empty string`)
    return false
  }
  return true
}

function requireNumber(file, object, key, context) {
  if (typeof object[key] !== 'number' || Number.isNaN(object[key])) {
    addError(file, `${context}.${key} must be a number`)
    return false
  }
  return true
}

function requireBoolean(file, object, key, context) {
  if (typeof object[key] !== 'boolean') {
    addError(file, `${context}.${key} must be a boolean`)
    return false
  }
  return true
}

function collectFiles(dir, predicate) {
  if (!existsSync(dir)) return []

  const entries = readdirSync(dir)
  const files = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry)
    const stats = statSync(fullPath)
    if (stats.isDirectory()) {
      files.push(...collectFiles(fullPath, predicate))
    } else if (predicate(fullPath)) {
      files.push(fullPath)
    }
  }

  return files
}

function validateConditionSet(file, conditions, context, registries) {
  if (conditions === undefined) return
  if (!isObject(conditions)) {
    addError(file, `${context} must be an object`)
    return
  }

  validateStringArray(file, conditions.requiredFlags, `${context}.requiredFlags`)
  validateStringArray(file, conditions.blockedFlags, `${context}.blockedFlags`)

  for (const flag of conditions.requiredFlags ?? []) {
    registries.requiredFlags.add(flag)
  }

  for (const flag of conditions.blockedFlags ?? []) {
    registries.blockedFlags.add(flag)
  }

  if (conditions.requiredStats !== undefined) {
    if (!Array.isArray(conditions.requiredStats)) {
      addError(file, `${context}.requiredStats must be an array`)
    } else {
      conditions.requiredStats.forEach((condition, index) => {
        const itemContext = `${context}.requiredStats[${index}]`
        if (!isObject(condition)) {
          addError(file, `${itemContext} must be an object`)
          return
        }

        if (!registries.statKeys.has(condition.stat)) {
          addError(file, `${itemContext}.stat references unknown stat "${condition.stat}"`)
        }

        if (condition.min !== undefined && typeof condition.min !== 'number') {
          addError(file, `${itemContext}.min must be a number`)
        }

        if (condition.max !== undefined && typeof condition.max !== 'number') {
          addError(file, `${itemContext}.max must be a number`)
        }

        if (
          typeof condition.min === 'number' &&
          typeof condition.max === 'number' &&
          condition.min > condition.max
        ) {
          addError(file, `${itemContext}.min cannot be greater than max`)
        }
      })
    }
  }

  if (conditions.requiredItems !== undefined) {
    if (!Array.isArray(conditions.requiredItems)) {
      addError(file, `${context}.requiredItems must be an array`)
    } else {
      conditions.requiredItems.forEach((condition, index) => {
        const itemContext = `${context}.requiredItems[${index}]`
        if (!isObject(condition)) {
          addError(file, `${itemContext} must be an object`)
          return
        }

        if (!registries.itemIds.has(condition.itemId)) {
          addError(file, `${itemContext}.itemId references unknown item "${condition.itemId}"`)
        }

        if (
          condition.minQuantity !== undefined &&
          (!Number.isInteger(condition.minQuantity) || condition.minQuantity < 1)
        ) {
          addError(file, `${itemContext}.minQuantity must be a positive integer`)
        }
      })
    }
  }
}

function validateEffectSet(file, effects, context, registries) {
  if (effects === undefined) return
  if (!isObject(effects)) {
    addError(file, `${context} must be an object`)
    return
  }

  if (effects.flags !== undefined) {
    if (!isObject(effects.flags)) {
      addError(file, `${context}.flags must be an object`)
    } else {
      for (const [flag, value] of Object.entries(effects.flags)) {
        if (typeof value !== 'boolean') {
          addError(file, `${context}.flags.${flag} must be a boolean`)
        }
        registries.producedFlags.add(flag)
      }
    }
  }

  if (effects.stats !== undefined) {
    if (!isObject(effects.stats)) {
      addError(file, `${context}.stats must be an object`)
    } else {
      for (const [stat, delta] of Object.entries(effects.stats)) {
        if (!registries.statKeys.has(stat)) {
          addError(file, `${context}.stats references unknown stat "${stat}"`)
        }
        if (typeof delta !== 'number') {
          addError(file, `${context}.stats.${stat} must be a number`)
        }
      }
    }
  }

  if (effects.items !== undefined) {
    if (!Array.isArray(effects.items)) {
      addError(file, `${context}.items must be an array`)
    } else {
      effects.items.forEach((effect, index) => {
        const itemContext = `${context}.items[${index}]`
        if (!isObject(effect)) {
          addError(file, `${itemContext} must be an object`)
          return
        }

        if (!registries.itemIds.has(effect.itemId)) {
          addError(file, `${itemContext}.itemId references unknown item "${effect.itemId}"`)
        }

        if (!Number.isInteger(effect.delta)) {
          addError(file, `${itemContext}.delta must be an integer`)
        }
      })
    }
  }
}

function validateStringArray(file, value, context) {
  if (value === undefined) return
  if (!Array.isArray(value)) {
    addError(file, `${context} must be an array`)
    return
  }

  value.forEach((item, index) => {
    if (typeof item !== 'string' || item.trim() === '') {
      addError(file, `${context}[${index}] must be a non-empty string`)
    }
  })
}

function validateStats(localeDir) {
  const file = path.join(localeDir, 'stats.json')
  const data = readJson(file)
  const statKeys = new Set()

  if (!data) return statKeys
  if (!Array.isArray(data.stats)) {
    addError(file, 'stats must be an array')
    return statKeys
  }

  for (const [index, stat] of data.stats.entries()) {
    const context = `stats[${index}]`
    if (!isObject(stat)) {
      addError(file, `${context} must be an object`)
      continue
    }

    if (requireString(file, stat, 'key', context)) {
      if (statKeys.has(stat.key)) addError(file, `duplicate stat key "${stat.key}"`)
      statKeys.add(stat.key)
    }

    requireString(file, stat, 'label', context)
    requireString(file, stat, 'description', context)
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
  }

  return statKeys
}

function validateItems(localeDir, registries) {
  const file = path.join(localeDir, 'items.json')
  const data = readJson(file)
  const itemIds = new Set()

  if (!data) return itemIds
  if (!Array.isArray(data.items)) {
    addError(file, 'items must be an array')
    return itemIds
  }

  for (const [index, item] of data.items.entries()) {
    const context = `items[${index}]`
    if (!isObject(item)) {
      addError(file, `${context} must be an object`)
      continue
    }

    if (requireString(file, item, 'id', context)) {
      if (itemIds.has(item.id)) addError(file, `duplicate item id "${item.id}"`)
      itemIds.add(item.id)
    }

    requireString(file, item, 'label', context)
    requireString(file, item, 'description', context)
    requireBoolean(file, item, 'stackable', context)
    requireBoolean(file, item, 'usable', context)

    if (!VALID_ITEM_CATEGORIES.has(item.category)) {
      addError(file, `${context}.category has unsupported value "${item.category}"`)
    }

    if (!Number.isInteger(item.maxStack) || item.maxStack < 1) {
      addError(file, `${context}.maxStack must be a positive integer`)
    }

    if (item.useEffect !== null) {
      validateEffectSet(file, item.useEffect, `${context}.useEffect`, registries)
    }
  }

  return itemIds
}

function validateScenes(localeDir, registries) {
  const sceneDir = path.join(localeDir, 'scenes')
  const sceneFiles = collectFiles(sceneDir, (file) => file.endsWith('.json'))
  const scenes = new Map()
  const outgoingLinks = new Map()
  const incomingCounts = new Map()

  if (sceneFiles.length === 0) {
    addError(sceneDir, 'no scene JSON files found')
    return { scenes, outgoingLinks, incomingCounts }
  }

  for (const file of sceneFiles) {
    const scene = readJson(file)
    if (!scene) continue
    const context = 'scene'

    if (!isObject(scene)) {
      addError(file, 'scene file must contain an object')
      continue
    }

    if (requireString(file, scene, 'id', context)) {
      if (scenes.has(scene.id)) {
        addError(
          file,
          `duplicate scene id "${scene.id}" also found in ${relative(scenes.get(scene.id).file)}`,
        )
      }
      if (path.basename(file, '.json') !== scene.id) {
        addWarning(file, `filename does not match scene id "${scene.id}"`)
      }
      scenes.set(scene.id, { file, scene })
      incomingCounts.set(scene.id, 0)
    }

    requireString(file, scene, 'title', context)

    if (!VALID_ACTS.has(scene.act)) {
      addError(file, `${context}.act has unsupported value "${scene.act}"`)
    }

    if (!isObject(scene.gameTime)) {
      addError(file, `${context}.gameTime must be an object`)
    } else {
      requireNumber(file, scene.gameTime, 'hoursFromStart', `${context}.gameTime`)
    }

    if (!Array.isArray(scene.narrative) || scene.narrative.length === 0) {
      addError(file, `${context}.narrative must be a non-empty array`)
    } else {
      scene.narrative.forEach((paragraph, index) => {
        if (typeof paragraph !== 'string' || paragraph.trim() === '') {
          addError(file, `${context}.narrative[${index}] must be a non-empty string`)
        }
      })
    }

    validateConditionSet(file, scene.conditions, `${context}.conditions`, registries)
    validateEffectSet(file, scene.onEnter, `${context}.onEnter`, registries)

    if (!Array.isArray(scene.choices)) {
      addError(file, `${context}.choices must be an array`)
      continue
    }

    const choiceIds = new Set()
    outgoingLinks.set(scene.id, [])

    if (scene.choices.length === 0) {
      addWarning(file, 'scene has no choices; treat this as intentional terminal or draft content')
    }

    scene.choices.forEach((choice, index) => {
      const choiceContext = `${context}.choices[${index}]`
      if (!isObject(choice)) {
        addError(file, `${choiceContext} must be an object`)
        return
      }

      if (requireString(file, choice, 'id', choiceContext)) {
        if (choiceIds.has(choice.id)) addError(file, `duplicate choice id "${choice.id}"`)
        choiceIds.add(choice.id)
      }

      requireString(file, choice, 'text', choiceContext)
      requireString(file, choice, 'nextSceneId', choiceContext)
      if (choice.hint !== undefined && typeof choice.hint !== 'string') {
        addError(file, `${choiceContext}.hint must be a string when provided`)
      }

      validateConditionSet(file, choice.conditions, `${choiceContext}.conditions`, registries)
      validateEffectSet(file, choice.effects, `${choiceContext}.effects`, registries)

      if (typeof choice.nextSceneId === 'string') {
        outgoingLinks.get(scene.id).push(choice.nextSceneId)
      }
    })
  }

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

  for (const [sceneId, count] of incomingCounts.entries()) {
    if (sceneId !== 'scene_001' && count === 0) {
      addWarning(scenes.get(sceneId).file, `scene "${sceneId}" has no incoming links`)
    }
  }

  return { scenes, outgoingLinks, incomingCounts }
}

function findReachableScenes(startId, outgoingLinks) {
  const reachable = new Set()
  const stack = [startId]

  while (stack.length > 0) {
    const sceneId = stack.pop()
    if (reachable.has(sceneId)) continue
    reachable.add(sceneId)

    for (const nextSceneId of outgoingLinks.get(sceneId) ?? []) {
      stack.push(nextSceneId)
    }
  }

  return reachable
}

function validateEndings(localeDir, registries) {
  const file = path.join(localeDir, 'endings.json')
  const data = readJson(file)
  const endingIds = new Set()

  if (!data) return
  if (!Array.isArray(data.endings)) {
    addError(file, 'endings must be an array')
    return
  }

  for (const [index, ending] of data.endings.entries()) {
    const context = `endings[${index}]`
    if (!isObject(ending)) {
      addError(file, `${context} must be an object`)
      continue
    }

    if (requireString(file, ending, 'id', context)) {
      if (endingIds.has(ending.id)) addError(file, `duplicate ending id "${ending.id}"`)
      endingIds.add(ending.id)
    }

    requireString(file, ending, 'title', context)
    requireNumber(file, ending, 'priority', context)

    if (!VALID_ENDING_TYPES.has(ending.type)) {
      addError(file, `${context}.type has unsupported value "${ending.type}"`)
    }

    validateConditionSet(file, ending.conditions, `${context}.conditions`, registries)

    if (!Array.isArray(ending.narrative) || ending.narrative.length === 0) {
      addError(file, `${context}.narrative must be a non-empty array`)
    }

    if (ending.epilogue !== null && typeof ending.epilogue !== 'string') {
      addError(file, `${context}.epilogue must be a string or null`)
    }
  }
}

function validateLocale(localeDir) {
  const locale = path.basename(localeDir)
  const registries = {
    statKeys: new Set(),
    itemIds: new Set(),
    producedFlags: new Set(),
    requiredFlags: new Set(),
    blockedFlags: new Set(),
  }

  registries.statKeys = validateStats(localeDir)
  registries.itemIds = validateItems(localeDir, registries)
  validateScenes(localeDir, registries)
  validateEndings(localeDir, registries)

  for (const flag of registries.requiredFlags) {
    if (!registries.producedFlags.has(flag)) {
      addWarning(localeDir, `required flag "${flag}" is never produced in locale "${locale}"`)
    }
  }

  for (const flag of registries.blockedFlags) {
    if (!registries.producedFlags.has(flag)) {
      addWarning(localeDir, `blocked flag "${flag}" is never produced in locale "${locale}"`)
    }
  }
}

function main() {
  if (!existsSync(DATA_DIR)) {
    addError(DATA_DIR, 'data directory does not exist')
  } else {
    const localeDirs = readdirSync(DATA_DIR)
      .map((entry) => path.join(DATA_DIR, entry))
      .filter((entry) => statSync(entry).isDirectory())

    if (localeDirs.length === 0) {
      addError(DATA_DIR, 'no locale directories found')
    }

    for (const localeDir of localeDirs) {
      validateLocale(localeDir)
    }
  }

  if (warnings.length > 0) {
    console.warn('\nScene validation warnings:')
    for (const warning of warnings) {
      console.warn(`  - ${warning}`)
    }
  }

  if (errors.length > 0) {
    console.error('\nScene validation errors:')
    for (const error of errors) {
      console.error(`  - ${error}`)
    }
    process.exitCode = 1
    return
  }

  console.log(`Scene validation passed with ${warnings.length} warning(s).`)
}

main()
