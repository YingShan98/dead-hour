import type { Scene, Ending } from './types'

const sceneCache = new Map<string, Scene>()

const ACT_FOLDERS = [
  'act1_hour-48',
  'act2_outbreak',
  'act3_survival',
  'act4_year-mark',
] as const

/**
 * Loads a scene by ID. Results are cached after first load.
 * Vite will code-split each act folder into a separate chunk.
 */
export async function loadScene(sceneId: string): Promise<Scene> {
  if (sceneCache.has(sceneId)) {
    return sceneCache.get(sceneId)!
  }

  for (const act of ACT_FOLDERS) {
    try {
      // Dynamic import — Vite handles the bundling
      const module = await import(`../data/scenes/${act}/${sceneId}.json`)
      const scene = module.default as Scene
      sceneCache.set(sceneId, scene)
      return scene
    } catch {
      // Not in this act folder — try the next
      continue
    }
  }

  throw new Error(`[loader] Scene not found: "${sceneId}". Check that the JSON file exists and the id matches.`)
}

/**
 * Clears the scene cache. Useful in development or testing.
 */
export function clearSceneCache(): void {
  sceneCache.clear()
}

/**
 * Loads all endings from the endings data file.
 */
export async function loadEndings(): Promise<Ending[]> {
  const module = await import('../data/endings.json')
  return (module.default as { endings: Ending[] }).endings
}
