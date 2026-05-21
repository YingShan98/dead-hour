/**
 * Reads src/data/zh/flags.json and emits src/engine/flagKeys.ts.
 *
 * Flag IDs are locale-agnostic identifiers (English slugs). The zh locale is
 * the canonical source because it is where content is authored. When you add
 * a new locale, its flags.json must contain the same IDs — the validator will
 * warn if they diverge.
 *
 * Usage:  node scripts/gen-flag-types.mjs
 *         pnpm gen-flags
 */

import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const ROOT = process.cwd()
const FLAGS_FILE = path.join(ROOT, 'src', 'data', 'zh', 'flags.json')
const OUTPUT_FILE = path.join(ROOT, 'src', 'engine', 'flagKeys.ts')

// ── Read source ───────────────────────────────────────────────────────────────

let raw
try {
  raw = readFileSync(FLAGS_FILE, 'utf8')
} catch {
  console.error(`Error: could not read ${FLAGS_FILE}`)
  console.error('Make sure src/data/zh/flags.json exists before running gen-flags.')
  process.exitCode = 1
  process.exit()
}

let data
try {
  data = JSON.parse(raw)
} catch (err) {
  console.error(`Error: flags.json is not valid JSON — ${err.message}`)
  process.exitCode = 1
  process.exit()
}

if (!Array.isArray(data.flags) || data.flags.length === 0) {
  console.error('Error: flags.json must have a non-empty "flags" array')
  process.exitCode = 1
  process.exit()
}

// Valid category prefixes — every flag id must start with one of these.
const VALID_PREFIXES = [
  'act1_', 'act2_', 'act3_', 'act4_',
  'medical_', 'info_', 'prep_', 'social_',
  'resource_', 'npc_', 'shelter_', 'mobility_',
  'risk_', 'stealth_', 'faction_', 'ending_', 'draft_',
]

// Valid category values — the human-readable grouping shown in flags.json.
// These are intentionally distinct from ID prefixes (e.g. "information" vs "info_").
const VALID_CATEGORIES = new Set([
  'act1_warning', 'act2_branch', 'act3_branch', 'act4_branch',
  'medical', 'information', 'preparation', 'social',
  'resource', 'npc', 'shelter', 'mobility',
  'risk', 'stealth', 'faction', 'ending', 'authoring',
])

const ids = data.flags.map((f) => {
  if (typeof f.id !== 'string' || f.id.trim() === '') {
    console.error(`Error: every entry in flags.json must have a non-empty string "id"`)
    process.exitCode = 1
    process.exit()
  }
  return f.id
})

// Guard against duplicate IDs in flags.json
const seen = new Set()
for (const id of ids) {
  if (seen.has(id)) {
    console.error(`Error: duplicate flag id "${id}" in flags.json`)
    process.exitCode = 1
    process.exit()
  }
  seen.add(id)
}

// Guard against IDs that don't follow the naming convention
for (const id of ids) {
  if (!VALID_PREFIXES.some((p) => id.startsWith(p))) {
    console.error(
      `Error: flag id "${id}" does not follow the naming convention.\n` +
      `       Must start with one of: ${VALID_PREFIXES.join(', ')}`
    )
    process.exitCode = 1
    process.exit()
  }
}

// Guard against unknown category values
for (const flag of data.flags) {
  if (typeof flag.category === 'string' && !VALID_CATEGORIES.has(flag.category)) {
    console.error(
      `Error: flag "${flag.id}" has unknown category "${flag.category}".\n` +
      `       Must be one of: ${[...VALID_CATEGORIES].join(', ')}`
    )
    process.exitCode = 1
    process.exit()
  }
}

// ── Emit TypeScript ───────────────────────────────────────────────────────────

const lines = [
  '// ─── Flag Keys ───────────────────────────────────────────────────────────────',
  '//',
  '// AUTO-GENERATED — do not edit manually.',
  '// Source of truth: src/data/zh/flags.json',
  '// Regenerate:      pnpm gen-flags',
  '//',
  '',
  '// Tuple of every registered flag id. Used to derive KnownFlag and for',
  '// runtime membership checks without importing the full flags.json.',
  'export const FLAG_KEYS = [',
  ...ids.map((id) => `  '${id}',`),
  '] as const',
  '',
  '// Union of every registered flag id — use this for type-safe flag references.',
  'export type KnownFlag = (typeof FLAG_KEYS)[number]',
  '',
]

writeFileSync(OUTPUT_FILE, lines.join('\n'), 'utf8')
console.log(`✓ gen-flags: emitted ${ids.length} flag types → src/engine/flagKeys.ts`)
