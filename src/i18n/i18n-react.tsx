import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { Locales } from './i18n-types'
import zh from './zh'
import en from './en'

// ─── Locale data map ─────────────────────────────────────────────────────────

type LocaleData = typeof zh

const LOCALES: Record<Locales, LocaleData> = { zh, en }

const LOCALE_LABELS: Record<Locales, string> = {
  zh: '中文',
  en: 'English',
}

const SUPPORTED_LOCALES: Locales[] = ['zh', 'en']

// ─── Deep merge (fallback logic) ─────────────────────────────────────────────
//
// Merges the base locale (zh) with the active locale so that any missing
// key in the active locale automatically falls back to zh.

function deepMerge<T extends object>(base: T, override: Partial<T>): T {
  const result = { ...base }
  for (const key of Object.keys(override) as Array<keyof T>) {
    const baseVal = base[key]
    const overrideVal = override[key]
    if (
      overrideVal !== undefined &&
      overrideVal !== null &&
      typeof baseVal === 'object' &&
      typeof overrideVal === 'object' &&
      !Array.isArray(baseVal)
    ) {
      result[key] = deepMerge(baseVal as object, overrideVal as object) as T[keyof T]
    } else if (overrideVal !== undefined && overrideVal !== '') {
      result[key] = overrideVal as T[keyof T]
    }
  }
  return result
}

// ─── Simple interpolation helper ─────────────────────────────────────────────
//
// Replaces {key} placeholders in a string with values from params.
// Example: interpolate('第{day:number}天', { day: 3 }) → '第3天'
// The ':type' annotation is stripped automatically.

export function interpolate(
  template: string,
  params?: Record<string, string | number>
): string {
  if (!params) return template
  return template.replace(/\{(\w+)(?::\w+)?\}/g, (_, key) => {
    const val = params[key]
    return val !== undefined ? String(val) : `{${key}}`
  })
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface I18nContextValue {
  locale: Locales
  setLocale: (locale: Locales) => void
  LL: LocaleData
  supportedLocales: Locales[]
  localeLabel: (locale: Locales) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

// ─── Provider ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'dead-hour:locale'

function getInitialLocale(): Locales {
  const stored = localStorage.getItem(STORAGE_KEY) as Locales | null
  if (stored && SUPPORTED_LOCALES.includes(stored)) return stored

  // Detect from browser
  const browserLang = navigator.language.split('-')[0] as Locales
  if (SUPPORTED_LOCALES.includes(browserLang)) return browserLang

  return 'zh'  // default
}

function buildLL(locale: Locales): LocaleData {
  if (locale === 'zh') return zh
  return deepMerge(zh, LOCALES[locale])
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locales>(getInitialLocale)
  const [LL, setLL] = useState<LocaleData>(() => buildLL(getInitialLocale()))

  const setLocale = useCallback((newLocale: Locales) => {
    localStorage.setItem(STORAGE_KEY, newLocale)
    setLocaleState(newLocale)
    setLL(buildLL(newLocale))
  }, [])

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        LL,
        supportedLocales: SUPPORTED_LOCALES,
        localeLabel: (l) => LOCALE_LABELS[l],
      }}
    >
      {children}
    </I18nContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Primary hook for all localisation needs.
 *
 * Usage:
 *   const { LL, locale, setLocale } = useI18n()
 *   <p>{LL.game.yourMove}</p>
 *   <p>{interpolate(LL.title.version, { version: '0.1.0' })}</p>
 */
export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>')
  return ctx
}
