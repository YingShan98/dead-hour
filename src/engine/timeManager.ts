/**
 * timeManager.ts — Pure logic only. No strings, no localization.
 *
 * All display text lives in src/i18n/{locale}/index.ts.
 * This file returns typed keys that components look up in LL.
 *
 * The rule: if a function would return a user-visible string,
 * it must instead return a typed key or null.
 */

import type { GameState } from './types'
import {
  CRISIS_ARRIVAL_HOUR,
  TIME_WARNING_THRESHOLD,
  TIME_CRITICAL_THRESHOLD,
  INFECTION_THRESHOLD_TURNING,
  INFECTION_FULL,
  WILL_AWAKENING_THRESHOLD,
  SECURITY_FORTRESS_THRESHOLD,
} from './defaults'

// ── Time urgency ──────────────────────────────────────────────────────────────
// Maps to: LL.countdown.urgency[urgency]

export type TimeUrgency = 'safe' | 'warning' | 'critical' | 'expired'

export function getTimeUrgency(hoursFromStart: number): TimeUrgency {
  const remaining = CRISIS_ARRIVAL_HOUR - hoursFromStart
  if (remaining <= 0) return 'expired'
  if (remaining <= TIME_CRITICAL_THRESHOLD) return 'critical'
  if (remaining <= TIME_WARNING_THRESHOLD) return 'warning'
  return 'safe'
}

// ── Security level ────────────────────────────────────────────────────────────
// Maps to: LL.security.level[level]

export type SecurityLevel = 'none' | 'basic' | 'solid' | 'fortress'

export function getSecurityLevel(security: number): SecurityLevel {
  if (security >= SECURITY_FORTRESS_THRESHOLD) return 'fortress'
  if (security >= 50) return 'solid'
  if (security >= 20) return 'basic'
  return 'none'
}

// ── Transformation path detection ─────────────────────────────────────────────

export type TransformationPath = 'survivor' | 'awakening' | 'turning' | 'zombie'

export function detectTransformationPath(state: GameState): TransformationPath {
  const { infection, will } = state.stats
  if (infection >= INFECTION_FULL) return 'zombie'
  if (infection >= INFECTION_THRESHOLD_TURNING) return 'turning'
  if (infection >= 3 && will >= WILL_AWAKENING_THRESHOLD) return 'awakening'
  return 'survivor'
}

// ── Infection hint ────────────────────────────────────────────────────────────
// Maps to: LL.hint.infection[hint.severity]
// Returns null when infection is too low to show any hint.

export type InfectionHintSeverity = 'subtle' | 'noticeable' | 'alarming' | 'critical'

export interface InfectionHint {
  severity: InfectionHintSeverity
}

export function getInfectionHint(infection: number): InfectionHint | null {
  if (infection >= 9) return { severity: 'critical' }
  if (infection >= 7) return { severity: 'alarming' }
  if (infection >= 5) return { severity: 'noticeable' }
  if (infection >= 3) return { severity: 'subtle' }
  return null
}

// ── Will hint ─────────────────────────────────────────────────────────────────
// Maps to: LL.hint.will[hint.type]
// Returns null when no will-related hint applies.

export type WillHintType = 'awakening' | 'collapse'

export interface WillHint {
  type: WillHintType
}

export function getWillHint(will: number, infection: number): WillHint | null {
  if (will >= WILL_AWAKENING_THRESHOLD && infection >= 3) return { type: 'awakening' }
  if (will <= 2) return { type: 'collapse' }
  return null
}

// ── Stat panel signal keys ────────────────────────────────────────────────────
// Maps to: LL.statSignal.infection[key] or LL.statSignal.will[key]

export type InfectionSignalKey = 'spreading' | 'critical'
export type WillSignalKey = 'awakening' | 'collapse'

export function getInfectionSignal(infection: number): InfectionSignalKey | null {
  if (infection >= INFECTION_THRESHOLD_TURNING) return 'critical'
  if (infection >= 5) return 'spreading'
  return null
}

export function getWillSignal(will: number): WillSignalKey | null {
  if (will >= WILL_AWAKENING_THRESHOLD) return 'awakening'
  if (will <= 2) return 'collapse'
  return null
}

export type TrustSignalKey = 'unstable' | 'critical'

export function getTrustSignal(trust: number): TrustSignalKey | null {
  if (trust <= 2) return 'critical'
  if (trust <= 4) return 'unstable'
  return null
}

export type LeadershipSignalKey = 'established' | 'pillar' | 'indispensable'

export function getLeadershipSignal(leadership: number): LeadershipSignalKey | null {
  if (leadership >= 20) return 'indispensable'
  if (leadership >= 15) return 'pillar'
  if (leadership >= 10) return 'established'
  return null
}

// ── Day label ─────────────────────────────────────────────────────────────────
// Pure computation: which in-game day does a given hoursFromStart fall on?
// Returns a discriminated union; callers look up display strings in LL.
// Maps to: LL.time.beforeOutbreak / LL.time.dayOne / LL.time.day

export type GameDayLabel =
  | { kind: 'beforeOutbreak'; hours: number }
  | { kind: 'dayOne' }
  | { kind: 'day'; day: number }

export function getGameDayLabel(hoursFromStart: number): GameDayLabel {
  if (hoursFromStart < 0) {
    return { kind: 'beforeOutbreak', hours: Math.abs(hoursFromStart) }
  }
  const days = Math.ceil(hoursFromStart / 24)
  if (days === 0) return { kind: 'dayOne' }
  return { kind: 'day', day: days }
}

// ── Crisis state ──────────────────────────────────────────────────────────────
// No strings — pure boolean flags for the store.

export interface CrisisState {
  timeExpired: boolean
  zombieTriggered: boolean
  awakeningReady: boolean
  fortressIrony: boolean
}

export function checkCrisisState(state: GameState): CrisisState {
  const { infection } = state.stats
  const path = detectTransformationPath(state)

  return {
    timeExpired: state.gameTime.hoursFromStart >= CRISIS_ARRIVAL_HOUR,
    zombieTriggered: infection >= INFECTION_THRESHOLD_TURNING,
    awakeningReady: path === 'awakening',
    fortressIrony:
      infection >= INFECTION_THRESHOLD_TURNING && state.security >= SECURITY_FORTRESS_THRESHOLD,
  }
}
