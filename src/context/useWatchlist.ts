import { useContext, useMemo } from 'react'
import { WatchlistActionsContext, WatchlistStateContext } from './WatchlistStore'

export function useWatchlistState() {
  const context = useContext(WatchlistStateContext)

  if (!context) {
    throw new Error('useWatchlistState must be used within WatchlistProvider')
  }

  return context
}

export function useWatchlistActions() {
  const context = useContext(WatchlistActionsContext)

  if (!context) {
    throw new Error('useWatchlistActions must be used within WatchlistProvider')
  }

  return context
}

export function useWatchlist() {
  const { watchlist, watchlistSet } = useWatchlistState()
  const { toggleSymbol } = useWatchlistActions()

  return useMemo(
    () => ({
      watchlist,
      watchlistSet,
      toggleSymbol,
      isWatched: (symbol: string) => watchlistSet.has(symbol),
    }),
    [toggleSymbol, watchlist, watchlistSet],
  )
}
