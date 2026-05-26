import TypesafeI18n, { useI18nContext } from './i18n-react'
import { locales } from './i18n-util'
import type { TranslationFunctions } from './i18n-types'
import type { Locales } from './i18n-types'

// Maps the TranslationFunctions type to reflect the Proxy behaviour below:
// - No-param functions  () => R   become R          (Proxy auto-invokes these)
// - Parameterised fns   (a) => R  stay as functions (must be called with args)
// - Object nodes are recursively transformed
type UnwrapLL<T> = T extends () => infer R
  ? R
  : T extends (...args: never[]) => unknown
    ? T
    : T extends object
      ? { [K in keyof T]: UnwrapLL<T[K]> }
      : T

export type LL = UnwrapLL<TranslationFunctions>

// Creates a recursive Proxy so no-arg translation keys can be used as plain
// string values (e.g. LL.title.tagline) while parameterised keys remain
// callable functions (e.g. LL.title.version({ version: '1.0' })).
function autoProxy<T extends object>(obj: T): UnwrapLL<T> {
  return new Proxy(obj, {
    get(target, prop) {
      const val = Reflect.get(target, prop)
      if (typeof prop !== 'string') return val
      if (typeof val === 'function' && (val as (...a: unknown[]) => unknown).length === 0) {
        return (val as () => unknown).call(target)
      }
      if (val !== null && typeof val === 'object') {
        return autoProxy(val as object)
      }
      return val
    },
  }) as UnwrapLL<T>
}

const LOCALE_LABELS: Record<Locales, string> = {
  zh: '中文',
  en: 'EN',
}

export function useI18n() {
  const ctx = useI18nContext()
  return {
    ...ctx,
    LL: autoProxy(ctx.LL),
    supportedLocales: locales,
    localeLabel: (l: Locales) => LOCALE_LABELS[l],
  }
}

export { TypesafeI18n as I18nProvider }
