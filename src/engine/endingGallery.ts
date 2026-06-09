const KEY = 'dead-hour:endings'

export const TOTAL_PLANNED_ENDINGS = 17

export function recordEnding(id: string): void {
  const current = getDiscoveredEndings()
  if (current.includes(id)) return
  localStorage.setItem(KEY, JSON.stringify([...current, id].sort()))
}

export function getDiscoveredEndings(): string[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}
