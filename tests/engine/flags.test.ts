import { describe, it, expect } from 'vitest'
import {
  FLAG_REGISTRY,
  getFlagDefinition,
  getAchievementFlags,
  getFlagsByCategory,
  getAllAchievements,
} from '@/data/flags'

describe('FLAG_REGISTRY', () => {
  it('has no duplicate keys', () => {
    const keys = FLAG_REGISTRY.map((f) => f.key)
    const unique = new Set(keys)
    expect(unique.size).toBe(keys.length)
  })

  it('every flag has a non-empty description', () => {
    for (const flag of FLAG_REGISTRY) {
      expect(flag.description.length, `Flag "${flag.key}" has empty description`).toBeGreaterThan(0)
    }
  })

  it('every achievement has a unique id', () => {
    const achievements = getAllAchievements()
    const ids = achievements.map((a) => a.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })
})

describe('getFlagDefinition()', () => {
  it('returns the correct definition for a known flag', () => {
    const def = getFlagDefinition('saw_patient_zero_video')
    expect(def).toBeDefined()
    expect(def?.category).toBe('narrative')
  })
})

describe('getAchievementFlags()', () => {
  it('returns only flags with achievements attached', () => {
    const flags = getAchievementFlags()
    expect(flags.every((f) => f.achievement !== null)).toBe(true)
  })
})

describe('getFlagsByCategory()', () => {
  it('returns only flags of the requested category', () => {
    const survival = getFlagsByCategory('survival')
    expect(survival.every((f) => f.category === 'survival')).toBe(true)
    expect(survival.length).toBeGreaterThan(0)
  })
})
