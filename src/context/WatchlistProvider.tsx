import { type PropsWithChildren, useEffect, useMemo, useState } from 'react'
import { toggleWatchlist } from '../lib/market'
import {
  WatchlistActionsContext,
  WatchlistStateContext,
  type WatchlistActionsValue,
  type WatchlistStateValue,
} from './WatchlistStore'

const storageKey = 'ant-gravity.watchlist'

function getInitialWatchlist(): string[] {
  if (typeof window === 'undefined') {
    return []
  }

  const storedValue = window.localStorage.getItem(storageKey)

  if (!storedValue) {
    return []
  }

  try {
    return JSON.parse(storedValue) as string[]
  } catch {
    window.localStorage.removeItem(storageKey)
    return []
  }
}

export function WatchlistProvider({ children }: PropsWithChildren) {
  const [watchlist, setWatchlist] = useState<string[]>(getInitialWatchlist)

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(watchlist))
  }, [watchlist])

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
