/**
 * Scans all scene and ending JSON files, then auto-updates the setBy and
 * usedBy fields in flags.json so they never need manual maintenance.
 *
 * setBy  — choice IDs whose effects set this flag
 * usedBy — scene/choice/ending IDs that gate on this flag in conditions
 *
 * Usage:  node scripts/sync-flags.mjs
 *         pnpm sync-flags
 *         pnpm flags          (sync + gen-flags in one step)
 */

import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const ROOT = process.cwd()
const FLAGS_FILE = path.join(ROOT, 'src', 'data', 'zh', 'flags.json')
const SCENES_DIR = path.join(ROOT, 'src', 'data', 'zh', 'scenes')
const ENDINGS_FILE = path.join(ROOT, 'src', 'data', 'zh', 'endings.json')

// ── Helpers ───────────────────────────────────────────────────────────────────

function readJson(file) {
  try {
    return JSON.parse(readFileSync(file, 'utf8'))
  } catch (err) {
    console.error(`Error: could not parse ${file} — ${err.message}`)
    process.exitCode = 1
    process.exit()
  }
}

function collectJsonFiles(dir) {
  if (!existsSync(dir)) return []
  const results = []
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry)
    if (statSync(full).isDirectory()) {
      results.push(...collectJsonFiles(full))
    } else if (entry.endsWith('.json')) {
      results.push(full)
    }
  }
  return results
}

// ── Scan scenes ───────────────────────────────────────────────────────────────

/** @type {Map<string, Set<string>>} flagId → Set of choice IDs that set it */
const setByMap = new Map()

/** @type {Map<string, Set<string>>} flagId → Set of scene/choice/ending IDs that gate on it */
const usedByMap = new Map()

function trackSetBy(flagId, choiceId) {
  if (!setByMap.has(flagId)) setByMap.set(flagId, new Set())
  setByMap.get(flagId).add(choiceId)
}

function trackUsedBy(flagId, id) {
  if (!usedByMap.has(flagId)) usedByMap.set(flagId, new Set())
  usedByMap.get(flagId).add(id)
}

function scanConditions(conditions, id) {
  if (!conditions) return
  for (const flag of conditions.requiredFlags ?? []) trackUsedBy(flag, id)
  for (const flag of conditions.blockedFlags ?? []) trackUsedBy(flag, id)
}

for (const file of collectJsonFiles(SCENES_DIR)) {
  const scene = readJson(file)

  scanConditions(scene.conditions, scene.id)
  for (const [flag] of Object.entries(scene.onEnter?.flags ?? {})) {
    trackSetBy(flag, scene.id)
  }

  for (const choice of scene.choices ?? []) {
    scanConditions(choice.conditions, choice.id)
    for (const [flag] of Object.entries(choice.effects?.flags ?? {})) {
      trackSetBy(flag, choice.id)
    }
  }
}

if (existsSync(ENDINGS_FILE)) {
  const { endings } = readJson(ENDINGS_FILE)
  for (const ending of endings ?? []) {
    scanConditions(ending.conditions, ending.id)
  }
}

// ── Patch flags.json ──────────────────────────────────────────────────────────

const flagsData = readJson(FLAGS_FILE)
let changed = 0

for (const flag of flagsData.flags) {
  const newSetBy = [...(setByMap.get(flag.id) ?? [])].sort()
  const newUsedBy = [...(usedByMap.get(flag.id) ?? [])].sort()

  const setByChanged =
    JSON.stringify(flag.setBy ?? []) !== JSON.stringify(newSetBy)
  const usedByChanged =
    JSON.stringify(flag.usedBy ?? []) !== JSON.stringify(newUsedBy)

  if (setByChanged || usedByChanged) {
    flag.setBy = newSetBy
    flag.usedBy = newUsedBy
    changed++
  }
}

writeFileSync(FLAGS_FILE, JSON.stringify(flagsData, null, 2) + '\n', 'utf8')
console.log(
  changed > 0
    ? `✓ sync-flags: updated ${changed} flag(s) — run pnpm gen-flags to refresh flagKeys.ts`
    : '✓ sync-flags: flags.json is already in sync'
)
