import { describe, it, expect } from 'vitest'
import { resolveLocaleString, resolveLocaleStrings } from '@/i18n/localeString'
import type { LocaleString } from '@/engine/types'

describe('resolveLocaleString()', () => {
  it('returns the zh string for zh locale', () => {
    const ls: LocaleString = { zh: '早班地铁' }
    expect(resolveLocaleString(ls, 'zh')).toBe('早班地铁')
  })

  it('returns the en string when en locale is active and en key exists', () => {
    const ls: LocaleString = { zh: '早班地铁', en: 'Morning Commute' }
    expect(resolveLocaleString(ls, 'en')).toBe('Morning Commute')
  })

  it('falls back to zh when en key is absent', () => {
    const ls: LocaleString = { zh: '早班地铁' }
    expect(resolveLocaleString(ls, 'en')).toBe('早班地铁')
  })
})

describe('resolveLocaleStrings()', () => {
  it('resolves an array correctly', () => {
    const values: LocaleString[] = [
      { zh: '第一段', en: 'Paragraph one' },
      { zh: '第二段' },
    ]
    const result = resolveLocaleStrings(values, 'en')
    expect(result).toEqual(['Paragraph one', '第二段'])
  })

  it('returns all zh strings when locale is zh', () => {
    const values: LocaleString[] = [
      { zh: '第一段', en: 'Paragraph one' },
      { zh: '第二段', en: 'Paragraph two' },
    ]
    expect(resolveLocaleStrings(values, 'zh')).toEqual(['第一段', '第二段'])
  })
})
