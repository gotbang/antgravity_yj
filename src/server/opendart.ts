import type { IncomingMessage, ServerResponse } from 'node:http'
import {
  STOCK_UNIVERSE,
  createPendingPriceInfo,
  findStockMetadataBySymbol,
  type DisclosureHistoryItem,
  type DisclosureTone,
  type MarketSummary,
  type StockMetadata,
  type StockPriceInfo,
  type StockPrediction,
  type TradeMemo,
  type Trend,
} from '../lib/market.ts'
import { formatKoreanWon, formatSignedKoreanWon } from '../lib/format.ts'
import { clearCacheStore, getCacheDiagnostics, getCachedResource, writeCachedResource } from './cache-store.ts'
import { getKrxStockPrices, resetKrxCache, setYahooChartFetcherForTest, type KrxStockPrice } from './krx.ts'
import { applyRateLimit, getClientIdentifier, resetRequestSecurityForTest } from './request-security.ts'

type DartCompanyResponse = {
  status: string
  message: string
  corp_name?: string
  stock_name?: string
  stock_code?: string
  ceo_nm?: string
}

type DartListItem = {
  corp_name: string
  report_nm: string
  rcept_no: string
  rcept_dt: string
}

type DartListResponse = {
  status: string
  message: string
  list?: DartListItem[]
}

type DartFinancialItem = {
  account_nm: string
  thstrm_amount: string
  frmtrm_amount: string
}

type DartFinancialResponse = {
  status: string
  message: string
  list?: DartFinancialItem[]
}

const OPEN_DART_BASE_URL = 'https://opendart.fss.or.kr/api'
const COMPANY_TTL_MS = 24 * 60 * 60 * 1000
const DISCLOSURES_TTL_MS = 2 * 60 * 60 * 1000
const FINANCIALS_TTL_MS = 24 * 60 * 60 * 1000
const PRICES_TTL_MS = 5 * 60 * 1000
const STOCK_SNAPSHOT_TTL_MS = 20 * 60 * 1000
const MARKET_SUMMARY_TTL_MS = 30 * 60 * 1000
const PUBLIC_API_RATE_LIMIT = {
  limit: 60,
  windowMs: 60 * 1000,
}

const POSITIVE_KEYWORDS = ['계약', '체결', '증가', '취득', '투자', '실적', '배당', '신규']
const NEGATIVE_KEYWORDS = ['정정', '감소', '중단', '소송', '손실', '유상증자', '불성실', '지연']

function getOpenDartApiKey() {
  return process.env.OPENDART_API_KEY ?? process.env.DART_API_KEY ?? ''
}

function formatPriceDate(raw: string) {
  if (!/^\d{8}$/.test(raw)) {
    return raw
  }

  return `${raw.slice(0, 4)}.${raw.slice(4, 6)}.${raw.slice(6, 8)} 기준`
}

function buildPriceInfo(price: KrxStockPrice | null): StockPriceInfo {
  if (!price) {
    return createPendingPriceInfo()
  }

  return {
    hasPriceData: true,
    currentPriceLabel: formatKoreanWon(price.currentPrice),
    priceChangeLabel: formatSignedKoreanWon(price.change),
    priceChangeRateLabel: `${price.changeRate > 0 ? '+' : price.changeRate < 0 ? '-' : ''}${Math.abs(price.changeRate).toFixed(2)}%`,
    priceAsOfLabel: formatPriceDate(price.asOfDate),
    priceSourceLabel: price.sourceLabel,
  }
}

async function fetchOpenDartJson<T>(
  endpoint: string,
  params: Record<string, string>,
): Promise<T> {
  const apiKey = getOpenDartApiKey()

  if (!apiKey) {
    throw new Error('OPENDART_API_KEY가 설정되지 않았어.')
  }

  const searchParams = new URLSearchParams({
    crtfc_key: apiKey,
    ...params,
  })

  const response = await fetch(`${OPEN_DART_BASE_URL}/${endpoint}?${searchParams.toString()}`)

  if (!response.ok) {
    throw new Error(`OpenDART 요청 실패: ${response.status}`)
  }

  return response.json() as Promise<T>
}

function formatDisclosureDate(raw: string) {
  return `${raw.slice(0, 4)}.${raw.slice(4, 6)}.${raw.slice(6, 8)}`
}

function buildDisclosureLink(receiptNo: string) {
  return `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${receiptNo}`
}

function parseAmount(raw: string) {
  if (!raw) {
    return 0
  }

  const normalized = raw.replace(/,/g, '').replace(/\s/g, '')

  if (normalized === '-' || normalized === '') {
    return 0
  }

  if (normalized.startsWith('(') && normalized.endsWith(')')) {
    return -Number(normalized.slice(1, -1))
  }

  return Number(normalized)
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function detectTone(title: string): DisclosureTone {
  const positive = POSITIVE_KEYWORDS.some((keyword) => title.includes(keyword))
  const negative = NEGATIVE_KEYWORDS.some((keyword) => title.includes(keyword))

  if (positive && !negative) {
    return 'positive'
  }

  if (negative && !positive) {
    return 'negative'
  }

  return 'neutral'
}

function toTrend(probability: number): Trend {
  if (probability >= 56) {
    return 'up'
  }

  if (probability <= 44) {
    return 'down'
  }

  return 'neutral'
}

function toStatusLabel(probability: number) {
  if (probability >= 60) {
    return '상승 우위'
  }

  if (probability >= 54) {
    return '약상승 우위'
  }

  if (probability <= 40) {
    return '하락 우위'
  }

  return '중립'
}

function buildHistory(items: DartListItem[]): DisclosureHistoryItem[] {
  return items.slice(0, 5).map((item) => {
    const tone = detectTone(item.report_nm)

    return {
      date: formatDisclosureDate(item.rcept_dt),
      title: item.report_nm,
      link: buildDisclosureLink(item.rcept_no),
      tone,
      success: tone !== 'negative',
      statusLabel:
        tone === 'positive' ? '긍정' : tone === 'negative' ? '주의' : '중립',
    }
  })
}

function buildTradeMemos(symbol: string, items: DisclosureHistoryItem[]): TradeMemo[] {
  return items.slice(0, 2).map((item) => ({
    symbol,
    action: item.tone === 'negative' ? '매도' : '매수',
    note: item.title,
    profit: item.tone === 'negative' ? '- 공시 주의' : '+ 공시 우호',
  }))
}

function pickFinancialValue(items: DartFinancialItem[], names: string[]) {
  const target = items.find((item) =>
    names.some((name) => item.account_nm.includes(name)),
  )

  return target ? parseAmount(target.thstrm_amount) : 0
}

function buildStockSnapshot(
  metadata: StockMetadata,
  company: DartCompanyResponse,
  disclosures: DartListItem[],
  financialItems: DartFinancialItem[],
  priceInfo: StockPriceInfo,
): StockPrediction {
  const positiveCount = disclosures.filter((item) => detectTone(item.report_nm) === 'positive').length
  const negativeCount = disclosures.filter((item) => detectTone(item.report_nm) === 'negative').length

  const revenue = pickFinancialValue(financialItems, ['매출액', '영업수익'])
  const operatingIncome = pickFinancialValue(financialItems, ['영업이익'])
  const netIncome = pickFinancialValue(financialItems, ['당기순이익', '분기순이익'])
  const equity = pickFinancialValue(financialItems, ['자본총계'])
  const liabilities = pickFinancialValue(financialItems, ['부채총계'])

  const debtRatio = equity > 0 ? (liabilities / equity) * 100 : 100
  const baseScore =
    50 +
    positiveCount * 4 -
    negativeCount * 5 +
    (revenue > 0 ? 2 : 0) +
    (operatingIncome > 0 ? 6 : -6) +
    (netIncome > 0 ? 4 : -4) -
    Math.round(Math.max(debtRatio - 100, 0) / 10)

  const upProbability = clamp(Math.round(baseScore), 35, 75)
  const downProbability = 100 - upProbability
  const riskScore = clamp(
    Math.round(42 + negativeCount * 8 + Math.max(debtRatio - 100, 0) / 8 - positiveCount * 3),
    28,
    88,
  )
  const volatilityRange = `±${(2.4 + riskScore / 25).toFixed(1)}%`
  const trend = toTrend(upProbability)
  const statusLabel = toStatusLabel(upProbability)
  const history = buildHistory(disclosures)
  const tradeMemos = buildTradeMemos(metadata.symbol, history)
  const latestDisclosure = history[0]
  const forecastLabel = upProbability >= 54 ? '상승 예상' : upProbability <= 46 ? '하락 예상' : '중립 예상'
  const rangeNote = priceInfo.hasPriceData
    ? `${priceInfo.currentPriceLabel} · 전일 대비 ${priceInfo.priceChangeLabel} (${priceInfo.priceChangeRateLabel})`
    : 'KRX OPEN API 키가 연결되면 가격 시세가 함께 보여.'
  const riskStatusLabel =
    riskScore >= 70 ? '변동성 확대 구간' : riskScore >= 55 ? '경계 구간' : '안정 구간'
  const riskComment =
    riskScore >= 70 ? '분할 접근 권장' : riskScore >= 55 ? '관망 우선' : '완만한 비중 확대 가능'
  const revenueDisplay = revenue > 0 ? formatKoreanWon(revenue) : '확인 중'
  const operatingIncomeDisplay = operatingIncome !== 0 ? formatKoreanWon(operatingIncome) : '확인 중'
  const debtRatioDisplay = `${Math.round(debtRatio)}%`

  return {
    symbol: metadata.symbol,
    stockCode: metadata.stockCode,
    corpCode: metadata.corpCode,
    companyName: company.corp_name ?? metadata.companyName,
    sector: metadata.sector,
    latestDisclosureDate: latestDisclosure?.date ?? '최근 공시 없음',
    latestDisclosureTitle: latestDisclosure?.title ?? '최근 공시가 아직 없어.',
    disclosureCount: disclosures.length,
    revenueSummary: `매출액 ${revenueDisplay}`,
    operatingIncomeSummary: `영업이익 ${operatingIncomeDisplay}`,
    debtRatioSummary: `부채비율 ${debtRatioDisplay}`,
    ...priceInfo,
    trend,
    statusLabel,
    forecastLabel,
    upProbability,
    downProbability,
    volatilityRange,
    rangeNote,
    riskScore,
    riskStatusLabel,
    riskComment,
    strategy:
      upProbability >= 55 ? '분할 매수 관점 유지' : negativeCount > positiveCount ? '관망 우선' : '보유 관점 유지',
    confidenceLabel: `최근 공시 ${disclosures.length}건 분석`,
    accuracyRate: `${clamp(58 + positiveCount * 3 - negativeCount * 2, 51, 79)}.0%`,
    recentNote:
      latestDisclosure
        ? `최근 공시: ${latestDisclosure.title}`
        : `${metadata.companyName}의 최근 공시와 재무 데이터를 기반으로 판단했어.`,
    history,
    tradeMemos,
    reasoning: [
      {
        title: '변동성 상태',
        description: `최근 공시 ${disclosures.length}건을 기준으로 변동 범위를 ${volatilityRange}로 해석하고 있어.`,
      },
      {
        title: '추세 강도',
        description: `${positiveCount}건의 우호 신호와 ${negativeCount}건의 경계 신호를 함께 보고 있어.`,
      },
      {
        title: '과거 유사 패턴 성공률',
        description: `현재 점수 기준 예상 적중률은 ${clamp(upProbability + 8, 52, 79)}% 수준으로 보고 있어.`,
      },
    ],
    strategyGuide: [
      '공시 일정이 몰린 주간에는 비중 확대를 서두르지 않기',
      '단기 급등 구간에서는 분할 진입과 분할 청산 유지',
      '리스크 점수가 높을수록 손절 기준을 먼저 정하기',
    ],
    financialMetrics: [
      { label: '매출액', value: revenueDisplay, description: '최근 재무 기준' },
      { label: '영업이익', value: operatingIncomeDisplay, description: '최근 재무 기준' },
      { label: '부채비율', value: debtRatioDisplay, description: '자본 대비 부채' },
    ],
    consensus: {
      targetPrice: 'OpenDART 미제공',
      opinion: upProbability >= 55 ? '우호적 해석' : '보수적 해석',
      coverage: '공시 기반',
    },
    technicalIndicators: [
      { label: '최근 공시 톤', value: statusLabel, description: '공시 감정 해석' },
      { label: '리스크 점수', value: `${riskScore}`, description: '100점 기준' },
    ],
    backtestReturn: `${upProbability - Math.round(riskScore / 10)}.0%`,
    backtestDescription: '최근 공시 신호를 단순 추적했을 때의 참고 수익률이야.',
    backtestWarning: '공시 기반 참고치일 뿐 실제 수익률을 보장하지 않아.',
  }
}

async function fetchCompany(metadata: StockMetadata) {
  return fetchOpenDartJson<DartCompanyResponse>('company.json', {
    corp_code: metadata.corpCode,
  })
}

async function getCachedCompany(metadata: StockMetadata, forceRefresh = false) {
  return getCachedResource<DartCompanyResponse>({
    cacheKey: `raw:company:${metadata.stockCode}`,
    filePath: `raw/company/${metadata.stockCode}.json`,
    ttlMs: COMPANY_TTL_MS,
    forceRefresh,
    loader: () => fetchCompany(metadata),
  })
}

async function fetchDisclosures(metadata: StockMetadata) {
  const now = new Date()
  const endDate = now.toISOString().slice(0, 10).replace(/-/g, '')
  const start = new Date(now)
  start.setDate(now.getDate() - 90)
  const startDate = start.toISOString().slice(0, 10).replace(/-/g, '')

  const response = await fetchOpenDartJson<DartListResponse>('list.json', {
    corp_code: metadata.corpCode,
    bgn_de: startDate,
    end_de: endDate,
    page_count: '8',
  })

  return response.list ?? []
}

async function getCachedDisclosures(metadata: StockMetadata, forceRefresh = false) {
  return getCachedResource<DartListItem[]>({
    cacheKey: `raw:disclosures:${metadata.stockCode}`,
    filePath: `raw/disclosures/${metadata.stockCode}.json`,
    ttlMs: DISCLOSURES_TTL_MS,
    forceRefresh,
    loader: () => fetchDisclosures(metadata),
  })
}

async function fetchFinancials(metadata: StockMetadata) {
  const currentYear = new Date().getFullYear()
  const candidates = [
    { year: currentYear - 1, reportCode: '11011' },
    { year: currentYear - 1, reportCode: '11013' },
    { year: currentYear - 1, reportCode: '11012' },
    { year: currentYear - 1, reportCode: '11014' },
    { year: currentYear - 2, reportCode: '11011' },
  ]

  for (const candidate of candidates) {
    const consolidated = await fetchOpenDartJson<DartFinancialResponse>('fnlttSinglAcntAll.json', {
      corp_code: metadata.corpCode,
      bsns_year: String(candidate.year),
      reprt_code: candidate.reportCode,
      fs_div: 'CFS',
    })

    if (consolidated.list && consolidated.list.length > 0) {
      return consolidated.list
    }

    const standalone = await fetchOpenDartJson<DartFinancialResponse>('fnlttSinglAcntAll.json', {
      corp_code: metadata.corpCode,
      bsns_year: String(candidate.year),
      reprt_code: candidate.reportCode,
      fs_div: 'OFS',
    })

    if (standalone.list && standalone.list.length > 0) {
      return standalone.list
    }
  }

  return []
}

async function getCachedFinancials(metadata: StockMetadata, forceRefresh = false) {
  return getCachedResource<DartFinancialItem[]>({
    cacheKey: `raw:financials:${metadata.stockCode}`,
    filePath: `raw/financials/${metadata.stockCode}.json`,
    ttlMs: FINANCIALS_TTL_MS,
    forceRefresh,
    loader: () => fetchFinancials(metadata),
  })
}

async function getCachedPriceMap(forceRefresh = false) {
  const prices = await getCachedResource<Record<string, KrxStockPrice>>({
    cacheKey: 'raw:prices:all',
    filePath: 'raw/prices/all.json',
    ttlMs: PRICES_TTL_MS,
    forceRefresh,
    loader: async () => {
      const nextMap = await getKrxStockPrices(STOCK_UNIVERSE)
      return Object.fromEntries(nextMap.entries())
    },
  })

  return new Map(Object.entries(prices))
}

export async function getStockSnapshot(symbol: string, options?: { forceRefresh?: boolean }) {
  const metadata = findStockMetadataBySymbol(symbol)

  if (!metadata) {
    throw new Error('지원하지 않는 종목이야.')
  }

  return getCachedResource<StockPrediction>({
    cacheKey: `view:stock:${metadata.stockCode}`,
    filePath: `view/stocks/${metadata.stockCode}.json`,
    ttlMs: STOCK_SNAPSHOT_TTL_MS,
    forceRefresh: options?.forceRefresh ?? false,
    loader: async () => {
      const [company, disclosures, financials, prices] = await Promise.all([
        getCachedCompany(metadata, options?.forceRefresh),
        getCachedDisclosures(metadata, options?.forceRefresh),
        getCachedFinancials(metadata, options?.forceRefresh),
        getCachedPriceMap(options?.forceRefresh).catch(() => new Map<string, KrxStockPrice>()),
      ])

      return buildStockSnapshot(
        metadata,
        company,
        disclosures,
        financials,
        buildPriceInfo(prices.get(metadata.stockCode) ?? null),
      )
    },
  })
}

function buildMarketSummary(stocks: StockPrediction[]): MarketSummary {
  const averageUpProbability = Math.round(
    stocks.reduce((sum, stock) => sum + stock.upProbability, 0) / stocks.length,
  )
  const averageRisk = Math.round(
    stocks.reduce((sum, stock) => sum + stock.riskScore, 0) / stocks.length,
  )
  const positiveCount = stocks.reduce(
    (sum, stock) => sum + stock.history.filter((item) => item.tone === 'positive').length,
    0,
  )
  const negativeCount = stocks.reduce(
    (sum, stock) => sum + stock.history.filter((item) => item.tone === 'negative').length,
    0,
  )
  const totalSignals = Math.max(positiveCount + negativeCount, 1)
  const positiveNewsRatio = Math.round((positiveCount / totalSignals) * 100)
  const negativeNewsRatio = 100 - positiveNewsRatio
  const keywords = Array.from(
    new Set(
      stocks
        .flatMap((stock) => stock.history.map((item) => item.title))
        .join(' ')
        .split(/\s+/)
        .filter((word) => word.length >= 2)
        .slice(0, 12),
    ),
  ).slice(0, 4)

  return {
    moodTitle: averageRisk >= 65 ? '경계 증가' : averageUpProbability >= 55 ? '회복 기대' : '관망 유지',
    moodDescription:
      averageRisk >= 65
        ? '최근 공시 흐름에서 경계 신호가 더 많이 보여. 무리한 추격보다 보수적으로 보는 게 좋아.'
        : '공시와 재무 흐름을 보면 전체적으로는 버틸 힘이 있는 구간이야.',
    fearGreedIndex: clamp(100 - averageRisk, 18, 78),
    fearGreedLabel:
      averageRisk >= 65 ? '공포 구간' : averageUpProbability >= 55 ? '완만한 탐욕' : '중립 구간',
    marketWarning:
      averageRisk >= 65
        ? '부정 공시 비중이 높아서 단기 변동성이 커질 수 있어. 공시 일정과 재무 체력을 같이 봐야 해.'
        : '공시 흐름은 비교적 안정적이지만 종목별 편차가 커서 개별 종목 확인이 중요해.',
    strategies:
      averageRisk >= 65
        ? ['급한 진입보다 공시 일정 확인', '레버리지 비중 축소', '현금 비중 일부 유지']
        : ['재무 안정 종목 위주 선별', '공시 업데이트 1분 단위 확인', '변동성 큰 종목은 분할 접근'],
    marketDirectionLabel:
      averageUpProbability >= 56 ? '약상승 예상' : averageUpProbability <= 44 ? '하락 우세' : '중립 예상',
    marketDirectionSummary:
      averageRisk >= 65
        ? '공시 흐름상 경계 신호가 많아서 단기 변동성에 주의해야 해.'
        : '공시와 재무 흐름을 함께 보면 완만한 회복 가능성이 있어 보여.',
    marketUpProbability: averageUpProbability,
    marketDownProbability: 100 - averageUpProbability,
    marketVolatilityRange: `±${(2.8 + averageRisk / 28).toFixed(1)}%`,
    marketRiskScore: averageRisk,
    confidenceRecentAccuracy: `${clamp(60 + positiveCount - negativeCount, 55, 78)}.0%`,
    confidenceOverallAccuracy: `${clamp(65 + positiveCount - negativeCount, 60, 82)}.0%`,
    marketHistory: stocks[0]?.history.slice(0, 5) ?? [],
    positiveNewsRatio,
    negativeNewsRatio,
    keywords: keywords.length > 0 ? keywords : ['공시 확인', '재무 안정', '실적 점검', '리스크 점검'],
    investorFlowSummary:
      averageRisk >= 65 ? '공시 기준으로는 보수적 대응이 우세해.' : '재무 안정 종목 중심으로 선별 매수 관점이 가능해.',
    institutionsSummary:
      averageUpProbability >= 55 ? '양호한 공시 흐름이 이어지는 종목이 더 많아.' : '종목별 차이가 커서 개별 분석이 중요해.',
    stocks,
    generatedAt: new Date().toISOString(),
    sourceLabel: stocks.some((stock) => stock.priceSourceLabel.includes('Yahoo'))
      ? 'OpenDART 기반 재무/공시 해석 + Yahoo Finance 개인용 시세'
      : stocks.some((stock) => stock.hasPriceData)
        ? 'OpenDART 기반 재무/공시 해석 + KRX OPEN API 일별 시세'
        : 'OpenDART 기반 재무/공시 해석',
  }
}

export async function getMarketSummary(options?: { forceRefresh?: boolean }) {
  return getCachedResource<MarketSummary>({
    cacheKey: 'view:market-summary',
    filePath: 'view/market-summary.json',
    ttlMs: MARKET_SUMMARY_TTL_MS,
    forceRefresh: options?.forceRefresh ?? false,
    loader: async () => {
      const stocks = await Promise.all(
        STOCK_UNIVERSE.map((stock) =>
          getStockSnapshot(stock.symbol, { forceRefresh: options?.forceRefresh }),
        ),
      )

      return buildMarketSummary(stocks)
    },
  })
}

export function resetServerCaches() {
  resetKrxCache()
  setYahooChartFetcherForTest(null)
  clearCacheStore()
  resetRequestSecurityForTest()
}

function getPublicErrorMessage(pathname: string) {
  if (pathname.endsWith('/market-summary')) {
    return '시장 요약을 지금 불러오지 못했어.'
  }

  if (pathname.endsWith('/stock')) {
    return '종목 데이터를 지금 불러오지 못했어.'
  }

  if (pathname.endsWith('/debug')) {
    return '디버그 정보를 지금 불러오지 못했어.'
  }

  return '요청을 처리하지 못했어.'
}

function isDebugEndpointAllowed() {
  return process.env.NODE_ENV === 'development'
}

function applyPublicApiRateLimit(req: IncomingMessage, pathname: string) {
  const clientId = getClientIdentifier(req)

  return applyRateLimit({
    key: `${pathname}:${clientId}`,
    ...PUBLIC_API_RATE_LIMIT,
  })
}

export async function refreshAllCaches(options?: { forceRefresh?: boolean }) {
  const forceRefresh = options?.forceRefresh ?? true
  const stocks = await Promise.all(
    STOCK_UNIVERSE.map((stock) => getStockSnapshot(stock.symbol, { forceRefresh })),
  )
  const marketSummary = buildMarketSummary(stocks)

  await writeCachedResource({
    cacheKey: 'view:market-summary',
    filePath: 'view/market-summary.json',
    ttlMs: MARKET_SUMMARY_TTL_MS,
    data: marketSummary,
  })

  return { stocks, marketSummary }
}

export async function sendJson(
  res: ServerResponse,
  statusCode: number,
  body: unknown,
) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(body))
}

export async function handleOpenDartRequest(req: IncomingMessage, res: ServerResponse) {
  const requestUrl = new URL(req.url ?? '/', 'http://localhost')

  try {
    const rateLimitResult = applyPublicApiRateLimit(req, requestUrl.pathname)

    if (!rateLimitResult.ok) {
      res.setHeader('Retry-After', String(rateLimitResult.retryAfterSeconds))
      return sendJson(res, 429, { error: '요청이 너무 많아. 잠깐 뒤에 다시 시도해줘.' })
    }

    if (requestUrl.pathname.endsWith('/market-summary')) {
      const summary = await getMarketSummary()
      return sendJson(res, 200, summary)
    }

    if (requestUrl.pathname.endsWith('/debug')) {
      if (!isDebugEndpointAllowed()) {
        return sendJson(res, 404, { error: '지원하지 않는 API 경로야.' })
      }

      const diagnostics = await getCacheDiagnostics()
      return sendJson(res, 200, diagnostics)
    }

    if (requestUrl.pathname.endsWith('/stock')) {
      const symbol = requestUrl.searchParams.get('symbol')

      if (!symbol) {
        return sendJson(res, 400, { error: 'symbol 파라미터가 필요해.' })
      }

      const snapshot = await getStockSnapshot(symbol)
      return sendJson(res, 200, snapshot)
    }

    return sendJson(res, 404, { error: '지원하지 않는 API 경로야.' })
  } catch {
    return sendJson(res, 500, {
      error: getPublicErrorMessage(requestUrl.pathname),
    })
  }
}
