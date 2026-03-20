import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import path from 'node:path'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import type { IncomingMessage } from 'node:http'
import { getStockSnapshot, handleOpenDartRequest, resetServerCaches } from './opendart.ts'
import { setYahooChartFetcherForTest } from './krx.ts'

type MockResponse = {
  statusCode: number
  headers: Record<string, string>
  body: string
  setHeader: (name: string, value: string) => void
  end: (payload: string) => void
}

function createJsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response
}

function createHttpObjects(url: string) {
  const req = {
    url,
    headers: {},
    socket: { remoteAddress: '127.0.0.1' },
  } as unknown as IncomingMessage
  const res = {
    statusCode: 200,
    headers: {} as Record<string, string>,
    body: '',
    setHeader(name: string, value: string) {
      this.headers[name] = value
    },
    end(payload: string) {
      this.body = payload
    },
  } satisfies MockResponse

  return { req, res }
}

function createFetchMock(options?: {
  krxPayload?: unknown
  krxStatus?: number
}) {
  const krxPayload = options?.krxPayload ?? {
    OutBlock_1: [
      {
        basDd: '20260321',
        srtnCd: '035420',
        isuNm: 'NAVER',
        clpr: '71000',
        vs: '1200',
        fltRt: '1.72',
      },
    ],
  }
  const krxStatus = options?.krxStatus ?? 200

  return vi.fn(async (input: string | URL | Request) => {
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url

    if (url.includes('company.json')) {
      return createJsonResponse({
        status: '000',
        message: 'OK',
        corp_name: 'NAVER',
      })
    }

    if (url.includes('list.json')) {
      return createJsonResponse({
        status: '000',
        message: 'OK',
        list: [
          {
            corp_name: 'NAVER',
            report_nm: 'REPORT',
            rcept_no: '202603210001',
            rcept_dt: '20260321',
          },
        ],
      })
    }

    if (url.includes('fnlttSinglAcntAll.json')) {
      return createJsonResponse({
        status: '000',
        message: 'OK',
        list: [
          { account_nm: '매출액', thstrm_amount: '279600000000000', frmtrm_amount: '260000000000000' },
          { account_nm: '영업이익', thstrm_amount: '65000000000000', frmtrm_amount: '43000000000000' },
          { account_nm: '당기순이익', thstrm_amount: '52000000000000', frmtrm_amount: '31000000000000' },
          { account_nm: '자본총계', thstrm_amount: '410000000000000', frmtrm_amount: '390000000000000' },
          { account_nm: '부채총계', thstrm_amount: '106000000000000', frmtrm_amount: '112000000000000' },
        ],
      })
    }

    if (url.includes('data-dbg.krx.co.kr')) {
      return createJsonResponse(krxPayload, krxStatus)
    }

    throw new Error(`unexpected fetch url: ${url}`)
  })
}

describe('server security and data integration', () => {
  beforeEach(() => {
    vi.stubEnv('MARKET_CACHE_DIR', path.join(process.cwd(), '.tmp-test-cache'))
    resetServerCaches()
    vi.stubEnv('OPENDART_API_KEY', 'test-opendart-key')
  })

  afterEach(() => {
    vi.restoreAllMocks()
    resetServerCaches()
    vi.unstubAllEnvs()
  })

  it('uses KRX price data when KRX key exists', async () => {
    vi.stubEnv('KRX_OPEN_API_KEY', 'test-krx-key')
    vi.stubGlobal('fetch', createFetchMock())

    const stock = await getStockSnapshot('NAVER')

    expect(stock.hasPriceData).toBe(true)
    expect(stock.priceSourceLabel).toContain('KRX')
    expect(stock.priceChangeRateLabel).toBe('+1.72%')
  })

  it('falls back to disclosure-only data when KRX request fails', async () => {
    vi.stubEnv('KRX_OPEN_API_KEY', 'test-krx-key')
    vi.stubGlobal('fetch', createFetchMock({ krxPayload: { error: 'blocked' }, krxStatus: 500 }))

    const stock = await getStockSnapshot('NAVER')

    expect(stock.hasPriceData).toBe(false)
    expect(stock.currentPriceLabel).toContain('대기')
    expect(stock.latestDisclosureTitle).toBe('REPORT')
  })

  it('uses Yahoo fallback when enabled and KRX key is absent', async () => {
    vi.stubEnv('YFINANCE_ENABLED', 'true')
    setYahooChartFetcherForTest(async () =>
      JSON.stringify({
        chart: {
          result: [
            {
              meta: {
                regularMarketPrice: 71200,
                chartPreviousClose: 70000,
              },
              timestamp: [1710979200],
            },
          ],
        },
      }),
    )
    vi.stubGlobal('fetch', createFetchMock())

    const stock = await getStockSnapshot('NAVER')

    expect(stock.hasPriceData).toBe(true)
    expect(stock.priceSourceLabel).toContain('Yahoo')
    expect(stock.priceChangeRateLabel).toBe('+1.71%')
  })

  it('keeps fresh price data even when file cache writes fail in serverless-like runtime', async () => {
    const blockerRoot = path.join(process.cwd(), '.tmp-test-cache-blocker')

    await rm(blockerRoot, { recursive: true, force: true })
    await mkdir(path.dirname(blockerRoot), { recursive: true })
    await writeFile(blockerRoot, 'block-file', 'utf8')

    vi.stubEnv('MARKET_CACHE_DIR', blockerRoot)
    vi.stubEnv('YFINANCE_ENABLED', 'true')
    setYahooChartFetcherForTest(async () =>
      JSON.stringify({
        chart: {
          result: [
            {
              meta: {
                regularMarketPrice: 71200,
                chartPreviousClose: 70000,
              },
              timestamp: [1710979200],
            },
          ],
        },
      }),
    )
    vi.stubGlobal('fetch', createFetchMock())

    const stock = await getStockSnapshot('NAVER', { forceRefresh: true })

    expect(stock.hasPriceData).toBe(true)
    expect(stock.priceSourceLabel).toContain('Yahoo')
    expect(stock.currentPriceLabel).toContain('71,200')

    await rm(blockerRoot, { recursive: true, force: true })
  })

  it('blocks debug endpoint outside development', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    const { req, res } = createHttpObjects('/api/opendart/debug')

    await handleOpenDartRequest(req, res as never)

    expect(res.statusCode).toBe(404)
  })

  it('returns 429 after rate limit is exceeded', async () => {
    vi.stubGlobal('fetch', createFetchMock())

    for (let count = 0; count < 60; count += 1) {
      const { req, res } = createHttpObjects('/api/opendart/market-summary')

      await handleOpenDartRequest(req, res as never)
      expect(res.statusCode).toBe(200)
    }

    const { req, res } = createHttpObjects('/api/opendart/market-summary')

    await handleOpenDartRequest(req, res as never)

    expect(res.statusCode).toBe(429)
    expect(res.headers['Retry-After']).toBeDefined()
  })
})
