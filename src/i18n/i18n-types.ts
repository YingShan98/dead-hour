// This file is the typesafe-i18n types bootstrap.
// After running `pnpm i18n:generate`, this file will be fully regenerated.
// Do not edit the generated sections manually.

import type { BaseTranslation as BaseTranslationType, LocalizedString } from 'typesafe-i18n'

export type BaseTranslation = BaseTranslationType
export type BaseLocale = 'zh'
export type Locales = 'zh' | 'en'

export type { LocalizedString }

// Translation is a deep-partial of the base — all keys optional,
// engine falls back to zh for any missing key.
export type Translation = typeof import('./zh/index').default
