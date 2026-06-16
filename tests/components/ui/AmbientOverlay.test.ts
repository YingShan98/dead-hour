import { describe, expect, it } from 'vitest'
import {
  infectionTintOpacity,
  baseVignetteColor,
  willTintOpacity,
  endingVignetteColor,
} from '@/engine/atmosphereHelpers'

describe('infectionTintOpacity', () => {
  it('returns 0 at and below infection 2', () => {
    expect(infectionTintOpacity(0)).toBe(0)
    expect(infectionTintOpacity(2)).toBe(0)
  })

  it('interpolates linearly between infection 2 and 10', () => {
    expect(infectionTintOpacity(6)).toBeCloseTo(0.25)
  })

  it('caps at 0.5 at and above infection 10', () => {
    expect(infectionTintOpacity(10)).toBe(0.5)
    expect(infectionTintOpacity(15)).toBe(0.5)
  })

  it('clamps below 2 (no negative opacity)', () => {
    expect(infectionTintOpacity(-1)).toBe(0)
  })
})

describe('baseVignetteColor', () => {
  it('returns the cool blue-grey tone before the outbreak', () => {
    expect(baseVignetteColor(-48)).toBe('rgba(10, 18, 35, 0.55)')
    expect(baseVignetteColor(-1)).toBe('rgba(10, 18, 35, 0.55)')
  })

  it('returns the neutral dark tone at and after the outbreak', () => {
    expect(baseVignetteColor(0)).toBe('rgba(0, 0, 0, 0.55)')
    expect(baseVignetteColor(56)).toBe('rgba(0, 0, 0, 0.55)')
  })
})

describe('willTintOpacity', () => {
  it('returns 0 below the awakening threshold', () => {
    expect(willTintOpacity(0)).toBe(0)
    expect(willTintOpacity(7)).toBe(0)
  })

  it('returns 0 at the awakening threshold', () => {
    expect(willTintOpacity(8)).toBe(0)
  })

  it('interpolates linearly from threshold to max', () => {
    expect(willTintOpacity(9)).toBeCloseTo(0.1)
  })

  it('caps at 0.2 at and above will max', () => {
    expect(willTintOpacity(10)).toBe(0.2)
    expect(willTintOpacity(15)).toBe(0.2)
  })
})

describe('endingVignetteColor', () => {
  it('returns distinct colors for each ending type', () => {
    const bad = endingVignetteColor('bad')
    const neutral = endingVignetteColor('neutral')
    const good = endingVignetteColor('good')
    const secret = endingVignetteColor('secret')

    expect(bad).toBe('rgba(35, 0, 0, 0.65)')
    expect(good).toBe('rgba(0, 18, 38, 0.6)')
    expect(secret).toBe('rgba(18, 0, 42, 0.65)')
    expect(new Set([bad, neutral, good, secret]).size).toBe(4)
  })
})
