import { type PropsWithChildren, useEffect, useMemo, useState } from 'react'
import { toggleWatchlist } from '../lib/market'
import {
  WatchlistActionsContext,
  WatchlistStateContext,
  type WatchlistActionsValue,
  type WatchlistStateValue,
} from './WatchlistStore'
import {
  clearStoredWatchlistCache,
  getStoredWatchlist,
  setStoredWatchlist,
  watchlistStorageKey,
} from './watchlist-storage'

export function WatchlistProvider({ children }: PropsWithChildren) {
  const [watchlist, setWatchlist] = useState<string[]>(getStoredWatchlist)

  useEffect(() => {
    setStoredWatchlist(watchlist)
  }, [watchlist])

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== null && event.key !== watchlistStorageKey) {
        return
      }

      clearStoredWatchlistCache()
      setWatchlist(getStoredWatchlist())
    }

    window.addEventListener('storage', handleStorage)

    return () => {
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  const stateValue = useMemo<WatchlistStateValue>(
    () => ({
      watchlist,
      watchlistSet: new Set(watchlist),
    }),
    [watchlist],
  )

  const actionsValue = useMemo<WatchlistActionsValue>(
    () => ({
      toggleSymbol: (symbol) => {
        setWatchlist((current) => toggleWatchlist(current, symbol))
      },
    }),
    [],
  )

  return (
    <WatchlistActionsContext.Provider value={actionsValue}>
      <WatchlistStateContext.Provider value={stateValue}>
        {children}
      </WatchlistStateContext.Provider>
    </WatchlistActionsContext.Provider>
  )
}
