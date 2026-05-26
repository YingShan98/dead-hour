import type { LocaleString } from '@/engine/types'
import type { Locales } from './i18n-types'

/**
 * Resolves a LocaleString to a plain string for the active locale.
 * Falls back to 'zh' if the active locale key is absent.
 *
 * Usage (in a component):
 *   const { locale } = useI18n()
 *   const text = resolveLocaleString(scene.title, locale)
 */
export function resolveLocaleString(value: LocaleString, locale: Locales): string {
  return value[locale] ?? value.zh
}

/**
 * Resolves an array of LocaleStrings to plain strings.
 * Useful for scene narrative paragraphs.
 */
export function resolveLocaleStrings(values: LocaleString[], locale: Locales): string[] {
  return values.map((v) => resolveLocaleString(v, locale))
}
