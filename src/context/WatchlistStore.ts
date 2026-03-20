import { createContext } from 'react'

export type WatchlistStateValue = {
  watchlist: string[]
  watchlistSet: ReadonlySet<string>
}

export type WatchlistActionsValue = {
  toggleSymbol: (symbol: string) => void
}

export const WatchlistStateContext = createContext<WatchlistStateValue | null>(null)
export const WatchlistActionsContext = createContext<WatchlistActionsValue | null>(null)
