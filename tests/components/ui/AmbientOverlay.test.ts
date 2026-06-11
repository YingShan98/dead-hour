import { describe, expect, it } from 'vitest'
import { infectionTintOpacity, baseVignetteColor } from '@/components/ui/AmbientOverlay'

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
