const STORAGE_KEY = 'eventplus.eventOwners'
type EventOwnership = Record<string, string[]>

function readOwnership(): EventOwnership {
    try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (!saved) return {}
        const parsed: unknown = JSON.parse(saved)
        return typeof parsed === 'object' && parsed !== null
            ? (parsed as EventOwnership)
            : {}
    } catch {
        return {}
    }
}

export function registerOwnedEvent(userId: string, eventId: string): void {
    const ownership = readOwnership()
    const ids = ownership[userId] ?? []
    if (!ids.includes(eventId)) ownership[userId] = [...ids, eventId]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ownership))
}

export function isOwnedEvent(userId: string, eventId: string): boolean {
    return readOwnership()[userId]?.includes(eventId) ?? false
}
