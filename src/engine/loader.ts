import type { Locales } from '@/i18n/i18n-types'
import type { Scene, Ending, ItemDefinition } from './types'

let currentLocale: Locales = 'zh'
const sceneCache = new Map<string, Scene>()

export function setLoaderLocale(locale: Locales): void {
  currentLocale = locale
  sceneCache.clear()
}

const ACT_FOLDERS = ['act1_hour-48', 'act2_outbreak', 'act3_survival', 'act4_year-mark'] as const

export async function loadScene(sceneId: string): Promise<Scene> {
  if (sceneCache.has(sceneId)) {
    return sceneCache.get(sceneId)!
  }

  const locale = currentLocale

  // Try flat layout first (scenes directly in the locale scenes folder)
  try {
    const module = await import(`../data/${locale}/scenes/${sceneId}.json`)
    const scene = module.default as Scene
    sceneCache.set(sceneId, scene)
    return scene
  } catch {
    // Not in flat layout — try act subfolders
  }

  for (const act of ACT_FOLDERS) {
    try {
      const module = await import(`../data/${locale}/scenes/${act}/${sceneId}.json`)
      const scene = module.default as Scene
      sceneCache.set(sceneId, scene)
      return scene
    } catch {
      continue
    }
  }

  throw new Error(
    `[loader] Scene not found: "${sceneId}" (locale: ${locale}). Check that the JSON file exists and the id matches.`,
  )
}

export function clearSceneCache(): void {
  sceneCache.clear()
}

export async function loadEndings(): Promise<Ending[]> {
  const module = await import(`../data/${currentLocale}/endings.json`)
  return (module.default as { endings: Ending[] }).endings
}

export async function loadItems(): Promise<ItemDefinition[]> {
  const module = await import(`../data/${currentLocale}/items.json`)
  return (module.default as { items: ItemDefinition[] }).items
}
