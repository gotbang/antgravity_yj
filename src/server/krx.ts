import { get } from 'node:https'
import type { StockMetadata } from '../lib/market.ts'

export type KrxStockPrice = {
  stockCode: string
  currentPrice: number
  change: number
  changeRate: number
  asOfDate: string
  sourceLabel: string
}

type KrxRow = Record<string, unknown>

const DEFAULT_KRX_KOSPI_DAILY_API_URL = 'http://data-dbg.krx.co.kr/svc/apis/sto/stk_bydd_trd'
const KRX_SOURCE_LABEL = 'KRX OPEN API 일별매매정보'
const YAHOO_SOURCE_LABEL = 'Yahoo Finance 개인용 시세'
const CACHE_TTL_MS = 60_000

const cache = new Map<string, { expiresAt: number; value: unknown }>()
let yahooChartFetcher: ((url: URL) => Promise<string>) | null = null

function getCached<T>(key: string) {
  const entry = cache.get(key)

  if (!entry) {
    return null
  }

  if (entry.expiresAt < Date.now()) {
    cache.delete(key)
    return null
  }

  return entry.value as T
}

function setCached(key: string, value: unknown) {
  cache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, value })
}

function getKrxApiKey() {
  return process.env.KRX_OPEN_API_KEY ?? process.env.KRX_API_KEY ?? ''
}

function isYahooFallbackEnabled() {
  return (
    process.env.YFINANCE_ENABLED === 'true' ||
    process.env.YFINANCE_DEV_FALLBACK_ENABLED === 'true'
  )
}

function getKrxKospiDailyApiUrl() {
  return process.env.KRX_KOSPI_DAILY_API_URL ?? DEFAULT_KRX_KOSPI_DAILY_API_URL
}

function toKstDate(offsetDays: number) {
  const now = new Date()
  const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  kstNow.setUTCDate(kstNow.getUTCDate() - offsetDays)

  const year = kstNow.getUTCFullYear()
  const month = String(kstNow.getUTCMonth() + 1).padStart(2, '0')
  const day = String(kstNow.getUTCDate()).padStart(2, '0')

  return `${year}${month}${day}`
}

function parseNumber(value: unknown) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }

  if (typeof value !== 'string') {
    return null
  }

  const normalized = value.replace(/,/g, '').trim()

  if (!normalized) {
    return null
  }

  if (normalized.startsWith('(') && normalized.endsWith(')')) {
    const innerValue = Number(normalized.slice(1, -1))
    return Number.isFinite(innerValue) ? -innerValue : null
  }

  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

function normalizeStockCode(value: unknown) {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return null
  }

  const digits = String(value).replace(/\D/g, '')

  if (!digits) {
    return null
  }

  return digits.slice(-6).padStart(6, '0')
}

function readRows(payload: unknown): KrxRow[] {
  if (Array.isArray(payload)) {
    return payload.filter((row): row is KrxRow => Boolean(row) && typeof row === 'object')
  }

  if (!payload || typeof payload !== 'object') {
    return []
  }

  const candidateEntries = Object.values(payload as Record<string, unknown>)

  for (const entry of candidateEntries) {
    if (Array.isArray(entry)) {
      return entry.filter((row): row is KrxRow => Boolean(row) && typeof row === 'object')
    }
  }

  const nested = payload as {
    response?: {
      body?: {
        items?: {
          item?: unknown
        }
      }
    }
  }

  const item = nested.response?.body?.items?.item

  if (Array.isArray(item)) {
    return item.filter((row): row is KrxRow => Boolean(row) && typeof row === 'object')
  }

  if (item && typeof item === 'object') {
    return [item as KrxRow]
  }

  return []
}

function readStringField(row: KrxRow, keys: string[]) {
  for (const key of keys) {
    const value = row[key]

    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value)
    }
  }

  return null
}

function parseRow(row: KrxRow): KrxStockPrice | null {
  const stockCode = normalizeStockCode(
    readStringField(row, ['srtnCd', 'shortCode', 'stockCode', 'isuSrdCd']),
  )

  const currentPrice = parseNumber(
    readStringField(row, ['clpr', 'closePrice', 'curPrc', 'currentPrice']),
  )
  const rawChange = parseNumber(readStringField(row, ['vs', 'change', 'cmpprvddPrc']))
  const rawChangeRate = parseNumber(readStringField(row, ['fltRt', 'changeRate']))
  const asOfDate = readStringField(row, ['basDd', 'trdDd', 'date'])

  if (!stockCode || currentPrice === null || !asOfDate) {
    return null
  }

  const change =
    rawChange !== null
      ? rawChange
      : rawChangeRate !== null
        ? Math.round((currentPrice * rawChangeRate) / 100)
        : 0
  const changeRate =
    rawChangeRate !== null
      ? rawChangeRate
      : currentPrice !== 0
        ? Number(((change / currentPrice) * 100).toFixed(2))
        : 0

  return {
    stockCode,
    currentPrice,
    change,
    changeRate,
    asOfDate,
    sourceLabel: KRX_SOURCE_LABEL,
  }
}

function toYahooTicker(stock: StockMetadata) {
  return `${stock.stockCode}.KS`
}

async function fetchYahooPrice(stock: StockMetadata) {
  const ticker = toYahooTicker(stock)
  const endpoint = new URL(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}`)
  endpoint.searchParams.set('interval', '1d')
  endpoint.searchParams.set('range', '5d')

  const payload = yahooChartFetcher
    ? await yahooChartFetcher(endpoint)
    : await new Promise<string>((resolve, reject) => {
        const request = get(
          endpoint,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 Codex Ant Gravity',
            },
          },
          (response) => {
            if (!response.statusCode || response.statusCode < 200 || response.statusCode >= 300) {
              reject(new Error(`Yahoo 시세 요청 실패: ${response.statusCode ?? 'unknown'}`))
              response.resume()
              return
            }

            let body = ''

            response.setEncoding('utf8')
            response.on('data', (chunk) => {
              body += chunk
            })
            response.on('end', () => {
              resolve(body)
            })
          },
        )

        request.on('error', reject)
        request.end()
      })
  const data = JSON.parse(payload) as {
    chart?: {
      result?: Array<{
        meta?: {
          regularMarketPrice?: number
          previousClose?: number
          chartPreviousClose?: number
        }
        timestamp?: number[]
        indicators?: {
          quote?: Array<{
            close?: Array<number | null>
          }>
        }
      }>
    }
  }

  const result = data.chart?.result?.[0]
  const currentPrice = result?.meta?.regularMarketPrice ?? null
  const closes = result?.indicators?.quote?.[0]?.close?.filter(
    (value): value is number => typeof value === 'number' && Number.isFinite(value),
  ) ?? []
  const previousClose =
    result?.meta?.previousClose ??
    result?.meta?.chartPreviousClose ??
    (closes.length >= 2 ? closes.at(-2) ?? null : closes.at(0) ?? null)
  const latestTimestamp = result?.timestamp?.at(-1) ?? null

  if (currentPrice === null || previousClose === null || latestTimestamp === null) {
    return null
  }

  const change = Number((currentPrice - previousClose).toFixed(2))
  const changeRate = previousClose !== 0 ? Number((((currentPrice - previousClose) / previousClose) * 100).toFixed(2)) : 0
  const asOf = new Date(latestTimestamp * 1000)
  const year = asOf.getUTCFullYear()
  const month = String(asOf.getUTCMonth() + 1).padStart(2, '0')
  const day = String(asOf.getUTCDate()).padStart(2, '0')

  return {
    stockCode: stock.stockCode,
    currentPrice,
    change,
    changeRate,
    asOfDate: `${year}${month}${day}`,
    sourceLabel: YAHOO_SOURCE_LABEL,
  } satisfies KrxStockPrice
}

async function fetchKrxRows(date: string) {
  const apiKey = getKrxApiKey()

  if (!apiKey) {
    return []
  }

  const endpoint = new URL(getKrxKospiDailyApiUrl())
  endpoint.searchParams.set('basDd', date)

  const response = await fetch(endpoint.toString(), {
    headers: {
      AUTH_KEY: apiKey,
    },
  })

  if (!response.ok) {
    throw new Error(`KRX 요청 실패: ${response.status}`)
  }

  const payload = (await response.json()) as unknown
  return readRows(payload)
}

export async function getKrxStockPrices(stocks: StockMetadata[]) {
  const apiKey = getKrxApiKey()

  if (stocks.length === 0) {
    return new Map<string, KrxStockPrice>()
  }

  if (!apiKey) {
    if (!isYahooFallbackEnabled()) {
      return new Map<string, KrxStockPrice>()
    }

    const yahooPrices = await Promise.all(
      stocks.map(async (stock) => {
        try {
          const price = await fetchYahooPrice(stock)
          return price ? ([stock.stockCode, price] as const) : null
        } catch {
          return null
        }
      }),
    )

    return new Map(
      yahooPrices.filter((entry): entry is readonly [string, KrxStockPrice] => entry !== null),
    )
  }

  const cacheKey = 'krx:stock-prices'
  const cached = getCached<Map<string, KrxStockPrice>>(cacheKey)

  if (cached) {
    return new Map(stocks.flatMap((stock) => {
      const price = cached.get(stock.stockCode)
      return price ? [[stock.stockCode, price] as const] : []
    }))
  }

  for (let offset = 0; offset < 7; offset += 1) {
    const date = toKstDate(offset)
    const rows = await fetchKrxRows(date)
    const byStockCode = new Map<string, KrxStockPrice>()

    rows.forEach((row) => {
      const parsed = parseRow(row)

      if (parsed) {
        byStockCode.set(parsed.stockCode, parsed)
      }
    })

    if (byStockCode.size > 0) {
      setCached(cacheKey, byStockCode)

      return new Map(stocks.flatMap((stock) => {
        const price = byStockCode.get(stock.stockCode)
        return price ? [[stock.stockCode, price] as const] : []
      }))
    }
  }

  return new Map<string, KrxStockPrice>()
}

export function resetKrxCache() {
  cache.clear()
}

export function setYahooChartFetcherForTest(fetcher: ((url: URL) => Promise<string>) | null) {
  yahooChartFetcher = fetcher
}
