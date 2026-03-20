const storageKey = 'ant-gravity.watchlist'
const storageCache = new Map<string, string | null>()

function readStorageValue(key: string) {
  if (typeof window === 'undefined') {
    return null
  }

  if (!storageCache.has(key)) {
    storageCache.set(key, window.localStorage.getItem(key))
  }

  return storageCache.get(key) ?? null
}

export function getStoredWatchlist(): string[] {
  const storedValue = readStorageValue(storageKey)

  if (!storedValue) {
    return []
  }

  try {
    return JSON.parse(storedValue) as string[]
  } catch {
    window.localStorage.removeItem(storageKey)
    storageCache.set(storageKey, null)
    return []
  }
}

export function setStoredWatchlist(watchlist: string[]) {
  if (typeof window === 'undefined') {
    return
  }

  const nextValue = JSON.stringify(watchlist)
  window.localStorage.setItem(storageKey, nextValue)
  storageCache.set(storageKey, nextValue)
}

export function clearStoredWatchlistCache() {
  storageCache.delete(storageKey)
}

export { storageKey as watchlistStorageKey }
