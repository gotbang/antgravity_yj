import { useEffect, useState } from 'react'
import {
  DEFAULT_MARKET_SUMMARY,
  getStockPrediction,
  type MarketSummary,
  type StockPrediction,
} from './market'

type LoadableState<T> = {
  data: T | null
  isLoading: boolean
  error: string | null
}

export type CacheDiagnostics = {
  cacheRoot: string
  stats: {
    hits: number
    misses: number
    writes: number
    fallbacks: number
  }
  memoryKeys: string[]
  latestUpdatedAt: string | null
  files: Array<{
    key: string
    updatedAt: string
  }>
}

const shouldSkipNetwork = import.meta.env.MODE === 'test'

async function requestJson<T>(url: string): Promise<T> {
  const response = await fetch(url)

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null
    throw new Error(payload?.error ?? '실데이터를 가져오지 못했어.')
  }

  return response.json() as Promise<T>
}

export function useMarketSummary() {
  const [state, setState] = useState<LoadableState<MarketSummary>>({
    data: DEFAULT_MARKET_SUMMARY,
    isLoading: !shouldSkipNetwork,
    error: null,
  })

  useEffect(() => {
    if (shouldSkipNetwork) {
      return
    }

    let cancelled = false

    const load = async () => {
      try {
        const data = await requestJson<MarketSummary>('/api/opendart/market-summary')

        if (!cancelled) {
          setState({ data, isLoading: false, error: null })
        }
      } catch (error) {
        if (!cancelled) {
          setState((previousState) => ({
            data: previousState.data ?? DEFAULT_MARKET_SUMMARY,
            isLoading: false,
            error: error instanceof Error ? error.message : '실데이터를 불러오지 못했어.',
          }))
        }
      }
    }

    load()
    const timer = window.setInterval(load, 60_000)

    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [])

  return state
}

export function useStockSnapshot(symbol: string | null) {
  const [state, setState] = useState<LoadableState<StockPrediction>>({
    data: symbol ? getStockPrediction(symbol) : null,
    isLoading: !shouldSkipNetwork && Boolean(symbol),
    error: null,
  })

  useEffect(() => {
    if (shouldSkipNetwork || !symbol) {
      return
    }

    let cancelled = false
    setState({
      data: getStockPrediction(symbol),
      isLoading: true,
      error: null,
    })

    const load = async () => {
      try {
        const params = new URLSearchParams({ symbol })
        const data = await requestJson<StockPrediction>(`/api/opendart/stock?${params.toString()}`)

        if (!cancelled) {
          setState({ data, isLoading: false, error: null })
        }
      } catch (error) {
        if (!cancelled) {
          setState((previousState) => ({
            data: previousState.data ?? getStockPrediction(symbol),
            isLoading: false,
            error: error instanceof Error ? error.message : '종목 데이터를 불러오지 못했어.',
          }))
        }
      }
    }

    load()
    const timer = window.setInterval(load, 60_000)

    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [symbol])

  return state
}

export function useCacheDiagnostics(enabled: boolean) {
  const [state, setState] = useState<LoadableState<CacheDiagnostics>>({
    data: null,
    isLoading: enabled && !shouldSkipNetwork,
    error: null,
  })

  useEffect(() => {
    if (shouldSkipNetwork || !enabled) {
      return
    }

    let cancelled = false

    const load = async () => {
      try {
        const data = await requestJson<CacheDiagnostics>('/api/opendart/debug')

        if (!cancelled) {
          setState({ data, isLoading: false, error: null })
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            data: null,
            isLoading: false,
            error: error instanceof Error ? error.message : '디버그 정보를 불러오지 못했어.',
          })
        }
      }
    }

    load()
    const timer = window.setInterval(load, 30_000)

    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [enabled])

  return state
}
