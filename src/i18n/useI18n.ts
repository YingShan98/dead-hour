import TypesafeI18n, { useI18nContext } from './i18n-react'
import { locales } from './i18n-util'
import type { Locales } from './i18n-types'

const LOCALE_LABELS: Record<Locales, string> = {
  zh: '中文',
  en: 'EN',
}

export function useI18n() {
  const ctx = useI18nContext()
  return {
    ...ctx,
    supportedLocales: locales,
    localeLabel: (l: Locales) => LOCALE_LABELS[l],
  }
}

export { TypesafeI18n as I18nProvider }
