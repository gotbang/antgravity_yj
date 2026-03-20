import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getStockSnapshot, resetServerCaches } from './opendart'
import { setYahooChartFetcherForTest } from './krx'

function createJsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response
}

describe('OpenDART + KRX integration', () => {
  beforeEach(() => {
    resetServerCaches()
    vi.stubEnv('OPENDART_API_KEY', 'test-opendart-key')
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
    resetServerCaches()
  })

  it('KRX 키가 있으면 종목 응답에 시세를 함께 담는다', async () => {
    vi.stubEnv('KRX_OPEN_API_KEY', 'test-krx-key')

    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(
          createJsonResponse({
            status: '000',
            message: '정상',
            corp_name: '삼성전자',
          }),
        )
        .mockResolvedValueOnce(
          createJsonResponse({
            status: '000',
            message: '정상',
            list: [
              {
                corp_name: '삼성전자',
                report_nm: '주요사항보고서',
                rcept_no: '202603210001',
                rcept_dt: '20260321',
              },
            ],
          }),
        )
        .mockResolvedValueOnce(
          createJsonResponse({
            status: '000',
            message: '정상',
            list: [
              { account_nm: '매출액', thstrm_amount: '279600000000000', frmtrm_amount: '260000000000000' },
              { account_nm: '영업이익', thstrm_amount: '65000000000000', frmtrm_amount: '43000000000000' },
              { account_nm: '당기순이익', thstrm_amount: '52000000000000', frmtrm_amount: '31000000000000' },
              { account_nm: '자본총계', thstrm_amount: '410000000000000', frmtrm_amount: '390000000000000' },
              { account_nm: '부채총계', thstrm_amount: '106000000000000', frmtrm_amount: '112000000000000' },
            ],
          }),
        )
        .mockResolvedValueOnce(
          createJsonResponse({
            OutBlock_1: [
              {
                basDd: '20260321',
                srtnCd: '005930',
                isuNm: '삼성전자',
                clpr: '71000',
                vs: '1200',
                fltRt: '1.72',
              },
            ],
          }),
        ),
    )

    const stock = await getStockSnapshot('삼성전자')

    expect(stock.hasPriceData).toBe(true)
    expect(stock.currentPriceLabel).toBe('71,000원')
    expect(stock.priceChangeLabel).toBe('+1,200원')
    expect(stock.priceChangeRateLabel).toBe('+1.72%')
    expect(stock.priceSourceLabel).toContain('KRX')
  })

  it('KRX 호출이 실패하면 기존 공시 데이터만 유지한다', async () => {
    vi.stubEnv('KRX_OPEN_API_KEY', 'test-krx-key')

    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(
          createJsonResponse({
            status: '000',
            message: '정상',
            corp_name: '삼성전자',
          }),
        )
        .mockResolvedValueOnce(
          createJsonResponse({
            status: '000',
            message: '정상',
            list: [
              {
                corp_name: '삼성전자',
                report_nm: '주요사항보고서',
                rcept_no: '202603210001',
                rcept_dt: '20260321',
              },
            ],
          }),
        )
        .mockResolvedValueOnce(
          createJsonResponse({
            status: '000',
            message: '정상',
            list: [
              { account_nm: '매출액', thstrm_amount: '279600000000000', frmtrm_amount: '260000000000000' },
              { account_nm: '영업이익', thstrm_amount: '65000000000000', frmtrm_amount: '43000000000000' },
              { account_nm: '당기순이익', thstrm_amount: '52000000000000', frmtrm_amount: '31000000000000' },
              { account_nm: '자본총계', thstrm_amount: '410000000000000', frmtrm_amount: '390000000000000' },
              { account_nm: '부채총계', thstrm_amount: '106000000000000', frmtrm_amount: '112000000000000' },
            ],
          }),
        )
        .mockResolvedValueOnce(createJsonResponse({ error: 'blocked' }, 500)),
    )

    const stock = await getStockSnapshot('삼성전자')

    expect(stock.hasPriceData).toBe(false)
    expect(stock.currentPriceLabel).toContain('대기')
    expect(stock.latestDisclosureTitle).toBe('주요사항보고서')
  })

  it('KRX 키가 없고 개인용 Yahoo fallback이 켜지면 Yahoo 시세를 쓴다', async () => {
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

    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(
          createJsonResponse({
            status: '000',
            message: '정상',
            corp_name: '삼성전자',
          }),
        )
        .mockResolvedValueOnce(
          createJsonResponse({
            status: '000',
            message: '정상',
            list: [
              {
                corp_name: '삼성전자',
                report_nm: '주요사항보고서',
                rcept_no: '202603210001',
                rcept_dt: '20260321',
              },
            ],
          }),
        )
        .mockResolvedValueOnce(
          createJsonResponse({
            status: '000',
            message: '정상',
            list: [
              { account_nm: '매출액', thstrm_amount: '279600000000000', frmtrm_amount: '260000000000000' },
              { account_nm: '영업이익', thstrm_amount: '65000000000000', frmtrm_amount: '43000000000000' },
              { account_nm: '당기순이익', thstrm_amount: '52000000000000', frmtrm_amount: '31000000000000' },
              { account_nm: '자본총계', thstrm_amount: '410000000000000', frmtrm_amount: '390000000000000' },
              { account_nm: '부채총계', thstrm_amount: '106000000000000', frmtrm_amount: '112000000000000' },
            ],
          }),
        )
    )

    const stock = await getStockSnapshot('삼성전자')

    expect(stock.hasPriceData).toBe(true)
    expect(stock.currentPriceLabel).toBe('71,200원')
    expect(stock.priceChangeLabel).toBe('+1,200원')
    expect(stock.priceChangeRateLabel).toBe('+1.71%')
    expect(stock.priceSourceLabel).toContain('Yahoo')
  })
})
