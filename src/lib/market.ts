import { formatKoreanWon } from './format.js'

export type Trend = 'up' | 'down' | 'neutral'

export type DisclosureTone = 'positive' | 'neutral' | 'negative'

export type DisclosureHistoryItem = {
  date: string
  title: string
  link: string
  tone: DisclosureTone
  statusLabel: string
  success: boolean
}

export type TradeMemo = {
  symbol: string
  action: '매수' | '매도'
  note: string
  profit: string
}

export type ReasoningItem = {
  title: string
  description: string
}

export type DataMixMetric = {
  label: string
  value: string
  description: string
}

export type AnalystConsensus = {
  targetPrice: string
  opinion: string
  coverage: string
}

export type StockPriceInfo = {
  hasPriceData: boolean
  currentPriceLabel: string
  priceChangeLabel: string
  priceChangeRateLabel: string
  priceAsOfLabel: string
  priceSourceLabel: string
}

export type StockPrediction = {
  symbol: string
  stockCode: string
  corpCode: string
  companyName: string
  sector: string
  latestDisclosureDate: string
  latestDisclosureTitle: string
  disclosureCount: number
  revenueSummary: string
  operatingIncomeSummary: string
  debtRatioSummary: string
  hasPriceData: boolean
  currentPriceLabel: string
  priceChangeLabel: string
  priceChangeRateLabel: string
  priceAsOfLabel: string
  priceSourceLabel: string
  trend: Trend
  statusLabel: string
  forecastLabel: string
  upProbability: number
  downProbability: number
  volatilityRange: string
  rangeNote: string
  riskScore: number
  riskStatusLabel: string
  riskComment: string
  strategy: string
  confidenceLabel: string
  accuracyRate: string
  recentNote: string
  history: DisclosureHistoryItem[]
  tradeMemos: TradeMemo[]
  reasoning: ReasoningItem[]
  strategyGuide: string[]
  financialMetrics: DataMixMetric[]
  consensus: AnalystConsensus
  technicalIndicators: DataMixMetric[]
  backtestReturn: string
  backtestDescription: string
  backtestWarning: string
}

export type MarketSummary = {
  moodTitle: string
  moodDescription: string
  fearGreedIndex: number
  fearGreedLabel: string
  marketWarning: string
  marketDirectionLabel: string
  marketDirectionSummary: string
  marketUpProbability: number
  marketDownProbability: number
  marketVolatilityRange: string
  marketRiskScore: number
  confidenceRecentAccuracy: string
  confidenceOverallAccuracy: string
  marketHistory: DisclosureHistoryItem[]
  strategies: string[]
  positiveNewsRatio: number
  negativeNewsRatio: number
  keywords: string[]
  investorFlowSummary: string
  institutionsSummary: string
  stocks: StockPrediction[]
  generatedAt: string
  sourceLabel: string
}

export type StockMetadata = {
  symbol: string
  stockCode: string
  corpCode: string
  companyName: string
  sector: string
}

export const SAMPLE_SOURCE_LABEL = '샘플 데이터 기준 정보 구조'

export function createPendingPriceInfo(): StockPriceInfo {
  return {
    hasPriceData: false,
    currentPriceLabel: 'KRX 승인 대기',
    priceChangeLabel: '시세 연동 대기',
    priceChangeRateLabel: '-',
    priceAsOfLabel: '키 발급 후 표시',
    priceSourceLabel: 'KRX OPEN API 승인 대기',
  }
}

export const STOCK_UNIVERSE: StockMetadata[] = [
  {
    symbol: '삼성전자',
    stockCode: '005930',
    corpCode: '00126380',
    companyName: '삼성전자',
    sector: '반도체',
  },
  {
    symbol: 'SK하이닉스',
    stockCode: '000660',
    corpCode: '00164779',
    companyName: 'SK하이닉스',
    sector: '반도체',
  },
  {
    symbol: '현대차',
    stockCode: '005380',
    corpCode: '00164742',
    companyName: '현대자동차',
    sector: '자동차',
  },
  {
    symbol: 'NAVER',
    stockCode: '035420',
    corpCode: '00266961',
    companyName: 'NAVER',
    sector: '플랫폼',
  },
  {
    symbol: '카카오',
    stockCode: '035720',
    corpCode: '00258801',
    companyName: '카카오',
    sector: '플랫폼',
  },
]

function createHistoryItem(
  date: string,
  title: string,
  statusLabel: string,
  success: boolean,
  tone: DisclosureTone = success ? 'positive' : 'negative',
): DisclosureHistoryItem {
  return {
    date,
    title,
    link: '',
    tone,
    statusLabel,
    success,
  }
}

function createTradeMemo(
  symbol: string,
  action: '매수' | '매도',
  note: string,
  profit: string,
): TradeMemo {
  return { symbol, action, note, profit }
}

const SAMPLE_MARKET_HISTORY = [
  createHistoryItem('2026.03.02', '예측: 상승 → 실제: 상승', '✅ 적중', true),
  createHistoryItem('2026.03.01', '예측: 상승 → 실제: 상승', '✅ 적중', true),
  createHistoryItem('2026.02.28', '예측: 상승 → 실제: 하락', '❌ 미적중', false),
  createHistoryItem('2026.02.27', '예측: 하락 → 실제: 하락', '✅ 적중', true),
  createHistoryItem('2026.02.26', '예측: 상승 → 실제: 상승', '✅ 적중', true),
]

const SAMPLE_STOCK_DETAILS: Record<string, Partial<StockPrediction>> = {
  삼성전자: {
    latestDisclosureDate: '2026.03.20',
    latestDisclosureTitle: '기업가치제고계획(자율공시)',
    disclosureCount: 8,
    revenueSummary: `매출액 ${formatKoreanWon(279600000000000)}`,
    operatingIncomeSummary: `영업이익 ${formatKoreanWon(6500000000000)}`,
    debtRatioSummary: '부채비율 26%',
    trend: 'up',
    statusLabel: '상승 우위',
    forecastLabel: '상승 예상',
    upProbability: 63,
    downProbability: 37,
    volatilityRange: '±4.8%',
    rangeNote: '가격 목표는 제공하지 않습니다',
    riskScore: 68,
    riskStatusLabel: '변동성 확대 구간',
    riskComment: '분할 접근 권장',
    strategy: '분할 접근 권장',
    confidenceLabel: '최근 20회 방향 적중률',
    accuracyRate: '71.3%',
    recentNote: '최근 공시와 반도체 수요 개선 기대를 함께 반영하고 있어.',
    history: SAMPLE_MARKET_HISTORY,
    tradeMemos: [
      createTradeMemo('삼성전자', '매수', 'HBM 수요 기대감이 유효할 때 분할 접근', '+4.2%'),
      createTradeMemo('삼성전자', '매도', '단기 급등 후 일부 차익 실현', '+1.8%'),
    ],
    reasoning: [
      { title: '변동성 상태', description: '최근 5일간 평균 변동성 4.2%, 확대 추세 감지' },
      { title: '추세 강도', description: '중기 상승 추세 유지 중, 단기 조정 가능성 있음' },
      { title: '과거 유사 패턴 성공률', description: '유사 패턴 23회 중 15회 상승 (65.2%)' },
    ],
    strategyGuide: [
      '단기 접근 시 손절 범위는 변동 하단 -4.8% 내 관리 권장',
      '고점 추격 매수 주의, 변동성이 확대된 구간이야.',
      '분할 매수와 분할 매도를 통해 평균 단가 관리 전략을 고려해봐.',
    ],
    financialMetrics: [
      { label: 'PER', value: '15.2', description: '주가/순이익' },
      { label: 'PBR', value: '1.8', description: '주가/순자산' },
      { label: 'ROE', value: '12.4%', description: '자기자본이익률' },
    ],
    consensus: { targetPrice: formatKoreanWon(82000), opinion: '매수', coverage: '28개사' },
    technicalIndicators: [
      { label: '볼린저 밴드', value: '중간 위치', description: '변동성 범위' },
      { label: 'RSI', value: '58.3', description: '과매수/과매도' },
    ],
    backtestReturn: '+12.3%',
    backtestDescription: '최근 90일 동안 이 종목에 대한 AI 예측을 따라 매매했을 때의 수익률이야.',
    backtestWarning:
      '백테스트는 과거 데이터 기반 시뮬레이션이며 미래 수익을 보장하지 않아. 실제 매매 시 거래 비용과 슬리피지도 함께 고려해야 해.',
  },
  SK하이닉스: {
    latestDisclosureDate: '2026.03.19',
    latestDisclosureTitle: '주요사항보고서',
    disclosureCount: 7,
    revenueSummary: `매출액 ${formatKoreanWon(51000000000000)}`,
    operatingIncomeSummary: `영업이익 ${formatKoreanWon(9200000000000)}`,
    debtRatioSummary: '부채비율 58%',
    trend: 'up',
    statusLabel: '상승 우위',
    forecastLabel: '상승 예상',
    upProbability: 58,
    downProbability: 42,
    volatilityRange: '±5.2%',
    rangeNote: '가격 목표는 제공하지 않습니다',
    riskScore: 72,
    riskStatusLabel: '리스크 높은 구간',
    riskComment: '변동성 감안한 분할 매수 권장',
    strategy: '변동성 감안한 분할 매수 권장',
    confidenceLabel: '최근 20회 방향 적중률',
    accuracyRate: '68.9%',
    recentNote: '메모리 업황 기대감은 유효하지만 변동성이 큰 편이야.',
    history: SAMPLE_MARKET_HISTORY,
    tradeMemos: [
      createTradeMemo('SK하이닉스', '매수', '실적 모멘텀 확인 뒤 분할 매수', '+3.8%'),
    ],
    reasoning: [
      { title: '변동성 상태', description: '반도체 업종 민감도가 높아서 일중 변동폭이 큰 편이야.' },
      { title: '추세 강도', description: '중기 상승 추세지만 뉴스 이벤트에 따라 흔들릴 수 있어.' },
      { title: '과거 유사 패턴 성공률', description: '유사 패턴 19회 중 11회 상승 (57.9%)' },
    ],
    strategyGuide: [
      '실적 발표 전후에는 비중 확대를 늦추는 편이 좋아.',
      '강한 상승 구간에서도 분할 기준은 유지해.',
      '리스크 점수가 높아서 손절 기준을 먼저 정해두는 게 좋아.',
    ],
    financialMetrics: [
      { label: 'PER', value: '18.7', description: '주가/순이익' },
      { label: 'PBR', value: '2.1', description: '주가/순자산' },
      { label: 'ROE', value: '11.1%', description: '자기자본이익률' },
    ],
    consensus: { targetPrice: formatKoreanWon(255000), opinion: '매수', coverage: '24개사' },
    technicalIndicators: [
      { label: '볼린저 밴드', value: '상단 근접', description: '변동성 범위' },
      { label: 'RSI', value: '61.5', description: '과매수/과매도' },
    ],
    backtestReturn: '+9.4%',
    backtestDescription: '최근 90일 기준 백테스트 수익률이야.',
    backtestWarning: '업황 민감 업종이라 과거 적중률보다 리스크 관리가 더 중요해.',
  },
  현대차: {
    latestDisclosureDate: '2026.03.18',
    latestDisclosureTitle: '사업보고서',
    disclosureCount: 6,
    revenueSummary: `매출액 ${formatKoreanWon(162500000000000)}`,
    operatingIncomeSummary: `영업이익 ${formatKoreanWon(15100000000000)}`,
    debtRatioSummary: '부채비율 168%',
    trend: 'neutral',
    statusLabel: '중립',
    forecastLabel: '중립 예상',
    upProbability: 52,
    downProbability: 48,
    volatilityRange: '±3.6%',
    rangeNote: '가격 목표는 제공하지 않습니다',
    riskScore: 55,
    riskStatusLabel: '중립 구간',
    riskComment: '기존 보유자는 관망 우선',
    strategy: '기존 보유자는 관망 우선',
    confidenceLabel: '최근 20회 방향 적중률',
    accuracyRate: '64.7%',
    recentNote: '실적 안정감은 있지만 단기 모멘텀은 제한적이야.',
    history: SAMPLE_MARKET_HISTORY,
    tradeMemos: [
      createTradeMemo('현대차', '매수', '실적 안정성을 보고 천천히 접근', '+1.1%'),
    ],
  },
  NAVER: {
    latestDisclosureDate: '2026.03.17',
    latestDisclosureTitle: '정기주주총회 결과',
    disclosureCount: 5,
    revenueSummary: `매출액 ${formatKoreanWon(9600000000000)}`,
    operatingIncomeSummary: `영업이익 ${formatKoreanWon(1500000000000)}`,
    debtRatioSummary: '부채비율 48%',
    trend: 'down',
    statusLabel: '하락 우위',
    forecastLabel: '하락 예상',
    upProbability: 45,
    downProbability: 55,
    volatilityRange: '±4.1%',
    rangeNote: '가격 목표는 제공하지 않습니다',
    riskScore: 61,
    riskStatusLabel: '경계 구간',
    riskComment: '관망 우선',
    strategy: '관망 우선',
    confidenceLabel: '최근 20회 방향 적중률',
    accuracyRate: '62.8%',
    recentNote: '광고 경기와 플랫폼 규제 이슈를 함께 봐야 해.',
    history: SAMPLE_MARKET_HISTORY,
    tradeMemos: [
      createTradeMemo('NAVER', '매도', '반등 실패 구간에서 일부 비중 축소', '-2.4%'),
    ],
  },
  카카오: {
    latestDisclosureDate: '2026.03.16',
    latestDisclosureTitle: '타법인주식취득결정',
    disclosureCount: 5,
    revenueSummary: `매출액 ${formatKoreanWon(8200000000000)}`,
    operatingIncomeSummary: `영업이익 ${formatKoreanWon(600000000000)}`,
    debtRatioSummary: '부채비율 91%',
    trend: 'up',
    statusLabel: '약상승 우위',
    forecastLabel: '약상승 예상',
    upProbability: 56,
    downProbability: 44,
    volatilityRange: '±4.4%',
    rangeNote: '가격 목표는 제공하지 않습니다',
    riskScore: 64,
    riskStatusLabel: '변동성 주의 구간',
    riskComment: '짧은 반등은 가능하지만 비중 관리는 필요해.',
    strategy: '짧은 반등 가능, 비중 관리는 필요',
    confidenceLabel: '최근 20회 방향 적중률',
    accuracyRate: '65.4%',
    recentNote: '실적보다 수급에 더 민감한 흐름이야.',
    history: SAMPLE_MARKET_HISTORY,
    tradeMemos: [
      createTradeMemo('카카오', '매수', '낙폭 과대 구간에서 분할 대응', '+0.9%'),
    ],
  },
}

function buildPlaceholderPrediction(metadata: StockMetadata): StockPrediction {
  const sample = SAMPLE_STOCK_DETAILS[metadata.symbol]

  return {
    symbol: metadata.symbol,
    stockCode: metadata.stockCode,
    corpCode: metadata.corpCode,
    companyName: metadata.companyName,
    sector: metadata.sector,
    latestDisclosureDate: sample?.latestDisclosureDate ?? '2026.03.20',
    latestDisclosureTitle: sample?.latestDisclosureTitle ?? '최근 공시 확인 전이야.',
    disclosureCount: sample?.disclosureCount ?? 5,
    revenueSummary: sample?.revenueSummary ?? '매출액 확인 중',
    operatingIncomeSummary: sample?.operatingIncomeSummary ?? '영업이익 확인 중',
    debtRatioSummary: sample?.debtRatioSummary ?? '부채비율 확인 중',
    ...createPendingPriceInfo(),
    trend: sample?.trend ?? 'neutral',
    statusLabel: sample?.statusLabel ?? '중립',
    forecastLabel: sample?.forecastLabel ?? '중립 예상',
    upProbability: sample?.upProbability ?? 50,
    downProbability: sample?.downProbability ?? 50,
    volatilityRange: sample?.volatilityRange ?? '±4.0%',
    rangeNote: sample?.rangeNote ?? '가격 목표는 제공하지 않습니다',
    riskScore: sample?.riskScore ?? 60,
    riskStatusLabel: sample?.riskStatusLabel ?? '중립 구간',
    riskComment: sample?.riskComment ?? '실데이터 확인 전 보수적 접근',
    strategy: sample?.strategy ?? '실데이터 확인 전 보수적 접근',
    confidenceLabel: sample?.confidenceLabel ?? '최근 20회 방향 적중률',
    accuracyRate: sample?.accuracyRate ?? '60.0%',
    recentNote: sample?.recentNote ?? `${metadata.companyName} 샘플 데이터를 보여주고 있어.`,
    history: sample?.history ?? SAMPLE_MARKET_HISTORY,
    tradeMemos:
      sample?.tradeMemos ??
      [createTradeMemo(metadata.symbol, '매수', '샘플 투자 메모가 표시돼.', '데이터 대기')],
    reasoning:
      sample?.reasoning ??
      [
        { title: '변동성 상태', description: '샘플 기준으로 최근 변동성을 요약하고 있어.' },
        { title: '추세 강도', description: '방향성과 추세 강도를 간단히 보여주는 영역이야.' },
        { title: '과거 유사 패턴 성공률', description: '비슷한 상황에서의 흐름을 참고용으로 보여줘.' },
      ],
    strategyGuide:
      sample?.strategyGuide ??
      ['추격 매수보다 분할 접근', '손절 기준 먼저 세우기', '과도한 비중 확대는 피하기'],
    financialMetrics:
      sample?.financialMetrics ??
      [
        { label: 'PER', value: '14.0', description: '주가/순이익' },
        { label: 'PBR', value: '1.5', description: '주가/순자산' },
        { label: 'ROE', value: '10.0%', description: '자기자본이익률' },
      ],
    consensus:
      sample?.consensus ?? { targetPrice: '샘플 기준', opinion: '중립', coverage: '5개사' },
    technicalIndicators:
      sample?.technicalIndicators ??
      [
        { label: '볼린저 밴드', value: '중간 위치', description: '변동성 범위' },
        { label: 'RSI', value: '50.0', description: '과매수/과매도' },
      ],
    backtestReturn: sample?.backtestReturn ?? '+0.0%',
    backtestDescription:
      sample?.backtestDescription ?? '최근 90일 기준 샘플 백테스트 수익률이야.',
    backtestWarning:
      sample?.backtestWarning ?? '샘플 데이터이기 때문에 실제 투자 판단에는 참고용으로만 봐야 해.',
  }
}

export const STOCK_PREDICTIONS: StockPrediction[] = STOCK_UNIVERSE.map(buildPlaceholderPrediction)

export const DEFAULT_STOCK_PREDICTION: StockPrediction = {
  ...buildPlaceholderPrediction({
    symbol: '대표 종목',
    stockCode: '000000',
    corpCode: '00000000',
    companyName: '대표 종목',
    sector: '시장 평균',
  }),
}

export function createDefaultMarketSummary(): MarketSummary {
  return {
    moodTitle: '불안 증가',
    moodDescription:
      '외부 이슈로 투자자 불안감이 확대되고 있어. 패닉 매도보다는 관망이 유리한 시기야.',
    fearGreedIndex: 34,
    fearGreedLabel: '공포 구간',
    marketWarning:
      '단기 불안감이 확대되면서 투매성 물량이 나오는 구간이야. 장기 관점에서는 매집 기회가 될 수 있어.',
    marketDirectionLabel: '약상승 예상',
    marketDirectionSummary:
      '공시와 재무 흐름을 종합하면 시장은 완만한 반등 쪽으로 기울어 있어. 다만 변동성은 아직 남아 있어.',
    marketUpProbability: 58,
    marketDownProbability: 42,
    marketVolatilityRange: '±3.8%',
    marketRiskScore: 52,
    confidenceRecentAccuracy: '67.5%',
    confidenceOverallAccuracy: '71.3%',
    marketHistory: SAMPLE_MARKET_HISTORY,
    strategies: [
      '급락 시 패닉 매도 자제',
      '분할 매수로 평단가 낮추기',
      '단기 트레이딩보다 중기 관점 유지',
    ],
    positiveNewsRatio: 32,
    negativeNewsRatio: 68,
    keywords: ['금리 인상', '수출 감소', '중국 경기 둔화', '환율 급등'],
    investorFlowSummary: '개인 투자자는 순매도, 외국인과 기관은 순매수 흐름이야.',
    institutionsSummary: '외국인과 기관이 버티는 종목이 상대적으로 안정감이 있어.',
    stocks: STOCK_PREDICTIONS,
    generatedAt: '2026-03-20T09:00:00.000Z',
    sourceLabel: SAMPLE_SOURCE_LABEL,
  }
}

export const DEFAULT_MARKET_SUMMARY = createDefaultMarketSummary()

export function findStockMetadataBySymbol(symbol: string) {
  const normalized = symbol.trim().toLowerCase()

  return STOCK_UNIVERSE.find((item) => item.symbol.toLowerCase() === normalized)
}

export function getStockPrediction(symbol: string) {
  const metadata = findStockMetadataBySymbol(symbol)

  if (!metadata) {
    return {
      ...DEFAULT_STOCK_PREDICTION,
      symbol,
      companyName: symbol,
    }
  }

  return buildPlaceholderPrediction(metadata)
}

export function filterStocks(query: string): StockMetadata[] {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) {
    return STOCK_UNIVERSE
  }

  return STOCK_UNIVERSE.filter(({ symbol, companyName, sector, stockCode }) =>
    [symbol, companyName, sector, stockCode].some((value) =>
      value.toLowerCase().includes(normalizedQuery),
    ),
  )
}

export function toggleWatchlist(current: string[], symbol: string): string[] {
  if (current.includes(symbol)) {
    return current.filter((item) => item !== symbol)
  }

  return [...current, symbol]
}
