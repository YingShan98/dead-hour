import type { GameState } from './types'

export const DEFAULT_GAME_STATE: GameState = {
  currentSceneId: 'scene_101',
  gameTime: { hoursFromStart: -48 },
  stats: {
    health:     10,
    morale:     10,
    leadership:  0,
    stealth:     0,
    trust:       5,
    infection:   0,
    will:        5,
  },
  inventory: [],
  flags: {},
  visitedScenes: [],
  choiceHistory: [],
  saveSlot: 0,
  playthroughId: '',
}
