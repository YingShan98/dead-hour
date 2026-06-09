import { describe, expect, it } from 'vitest'
import { getGameDayLabel } from '@/engine/timeManager'

describe('getGameDayLabel', () => {
  it('returns beforeOutbreak for negative hoursFromStart', () => {
    expect(getGameDayLabel(-48)).toEqual({ kind: 'beforeOutbreak', hours: 48 })
    expect(getGameDayLabel(-1)).toEqual({ kind: 'beforeOutbreak', hours: 1 })
  })

  it('returns dayOne at exactly hour 0', () => {
    expect(getGameDayLabel(0)).toEqual({ kind: 'dayOne' })
  })

  it('returns day 1 for hours 1–23', () => {
    expect(getGameDayLabel(1)).toEqual({ kind: 'day', day: 1 })
    expect(getGameDayLabel(23)).toEqual({ kind: 'day', day: 1 })
  })

  // hoursFromStart=24 labels as Day 1 (not Day 2) — known off-by-one with Math.ceil.
  // Intentional: the slot picker must show the same day number as SceneDisplay in-game.
  it('labels hour 24 as day 1 (off-by-one from Math.ceil)', () => {
    expect(getGameDayLabel(24)).toEqual({ kind: 'day', day: 1 })
  })

  it('returns day 2 for hours 25–47', () => {
    expect(getGameDayLabel(25)).toEqual({ kind: 'day', day: 2 })
    expect(getGameDayLabel(47)).toEqual({ kind: 'day', day: 2 })
  })

  // hoursFromStart=48 labels as Day 2 (not Day 3) — same Math.ceil off-by-one.
  it('labels hour 48 as day 2 (off-by-one from Math.ceil)', () => {
    expect(getGameDayLabel(48)).toEqual({ kind: 'day', day: 2 })
  })

  it('returns day 3 for hours 49–71', () => {
    expect(getGameDayLabel(49)).toEqual({ kind: 'day', day: 3 })
    expect(getGameDayLabel(71)).toEqual({ kind: 'day', day: 3 })
  })
})
