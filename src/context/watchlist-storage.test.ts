import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  clearStoredWatchlistCache,
  getStoredWatchlist,
  setStoredWatchlist,
  watchlistStorageKey,
} from './watchlist-storage'

describe('watchlist storage', () => {
  beforeEach(() => {
    window.localStorage.clear()
    clearStoredWatchlistCache()
  })

  afterEach(() => {
    window.localStorage.clear()
    clearStoredWatchlistCache()
  })

  it('저장한 관심 종목을 다시 읽는다', () => {
    setStoredWatchlist(['삼성전자', 'NAVER'])

    expect(getStoredWatchlist()).toEqual(['삼성전자', 'NAVER'])
  })

  it('잘못된 저장값이 있으면 비우고 빈 배열을 반환한다', () => {
    window.localStorage.setItem(watchlistStorageKey, '{broken')
    clearStoredWatchlistCache()

    expect(getStoredWatchlist()).toEqual([])
    expect(window.localStorage.getItem(watchlistStorageKey)).toBeNull()
  })
})
