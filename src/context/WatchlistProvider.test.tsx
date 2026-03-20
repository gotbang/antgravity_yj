import { act, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { WatchlistProvider } from './WatchlistProvider'
import { useWatchlistState } from './useWatchlist'
import { clearStoredWatchlistCache, setStoredWatchlist } from './watchlist-storage'

function WatchlistProbe() {
  const { watchlist } = useWatchlistState()

  return <div>{watchlist.join(',') || 'empty'}</div>
}

describe('WatchlistProvider', () => {
  beforeEach(() => {
    window.localStorage.clear()
    clearStoredWatchlistCache()
  })

  it('storage clear 이벤트가 오면 관심 종목 상태를 다시 동기화한다', async () => {
    setStoredWatchlist(['삼성전자'])

    render(
      <WatchlistProvider>
        <WatchlistProbe />
      </WatchlistProvider>,
    )

    expect(screen.getByText('삼성전자')).toBeInTheDocument()

    act(() => {
      window.localStorage.clear()
      clearStoredWatchlistCache()
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: null,
        }),
      )
    })

    await waitFor(() => {
      expect(screen.getByText('empty')).toBeInTheDocument()
    })
  })
})
