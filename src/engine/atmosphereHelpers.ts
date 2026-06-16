import type { EndingType } from '@/engine/types'
import { INFECTION_MAX, WILL_MAX, WILL_AWAKENING_THRESHOLD } from '@/engine/defaults'

const INFECTION_TINT_FLOOR = 2

export function infectionTintOpacity(infection: number): number {
  const clamped = Math.min(Math.max(infection, INFECTION_TINT_FLOOR), INFECTION_MAX)
  return ((clamped - INFECTION_TINT_FLOOR) / (INFECTION_MAX - INFECTION_TINT_FLOOR)) * 0.5
}

export function baseVignetteColor(hoursFromStart: number): string {
  return hoursFromStart < 0 ? 'rgba(10, 18, 35, 0.55)' : 'rgba(0, 0, 0, 0.55)'
}

export function willTintOpacity(will: number): number {
  if (will < WILL_AWAKENING_THRESHOLD) return 0
  const clamped = Math.min(will, WILL_MAX)
  return ((clamped - WILL_AWAKENING_THRESHOLD) / (WILL_MAX - WILL_AWAKENING_THRESHOLD)) * 0.2
}

const ENDING_VIGNETTE_COLORS: Record<EndingType, string> = {
  bad: 'rgba(35, 0, 0, 0.65)',
  neutral: 'rgba(25, 20, 8, 0.6)',
  good: 'rgba(0, 18, 38, 0.6)',
  secret: 'rgba(18, 0, 42, 0.65)',
}

export function endingVignetteColor(type: EndingType): string {
  return ENDING_VIGNETTE_COLORS[type]
}
