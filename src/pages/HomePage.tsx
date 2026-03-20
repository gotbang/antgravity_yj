import { Link } from 'react-router-dom'
import { BrandHeader } from '../components/BrandHeader'
import { AnalysisIcon, DiaryIcon, TodayIcon } from '../components/BrandIllustrations'
import { useWatchlistState } from '../context/useWatchlist'
import { DEFAULT_MARKET_SUMMARY, getStockPrediction } from '../lib/market'
import { useMarketSummary } from '../lib/live-data'

const quickLinks = [
  { to: '/', icon: <TodayIcon />, label: '오늘 판단', className: 'quick-card quick-card-blue' },
  { to: '/stock', icon: <AnalysisIcon />, label: '종목 분석', className: 'quick-card quick-card-yellow' },
  { to: '/emotion', icon: <DiaryIcon />, label: '개미의 일기', className: 'quick-card quick-card-pink' },
]

export function HomePage() {
  const { watchlist } = useWatchlistState()
  const { data } = useMarketSummary()
  const summary = data ?? DEFAULT_MARKET_SUMMARY
  const watchlistStocks = watchlist.map(
    (symbol) => summary.stocks.find((stock) => stock.symbol === symbol) ?? getStockPrediction(symbol),
  )
  const predictionIcon = summary.marketUpProbability >= summary.marketDownProbability ? '📈' : '📉'

  return (
    <div className="screen screen-dashboard">
      <BrandHeader />

      <section className="quick-card-grid" aria-label="주요 바로가기">
        {quickLinks.map((item) => (
          <Link key={item.label} to={item.to} className={item.className}>
            <span className="quick-card-icon" aria-hidden="true">
              {item.icon}
            </span>
            <strong>{item.label}</strong>
          </Link>
        ))}
      </section>

      <section className="content-section">
        <h2 className="section-title">🎯 오늘의 주식 시장 방향</h2>

        <article className="prediction-panel">
          <div className="prediction-headline">
            <div className="prediction-badge" aria-hidden="true">
              {predictionIcon}
            </div>
            <div>
              <p>AI 개미의 예측</p>
              <h3>{summary.marketDirectionLabel}</h3>
            </div>
          </div>
          <p className="home-supporting-copy">{summary.marketDirectionSummary}</p>

          <div className="summary-grid">
            <article className="stat-box stat-box-up">
              <span>상승 확률</span>
              <strong>{summary.marketUpProbability}%</strong>
            </article>
            <article className="stat-box stat-box-down">
              <span>하락 확률</span>
              <strong>{summary.marketDownProbability}%</strong>
            </article>
          </div>

          <div className="metric-grid">
            <article className="summary-box">
              <span>예상 변동 범위</span>
              <strong>{summary.marketVolatilityRange}</strong>
            </article>
            <article className="summary-box">
              <span>시장 리스크 점수</span>
              <strong>{summary.marketRiskScore} / 100</strong>
            </article>
          </div>
        </article>
      </section>

      <section className="content-section">
        <h2 className="section-title">⭐ 내 관심종목</h2>

        {watchlistStocks.length > 0 ? (
          <div className="accuracy-stack">
            {watchlistStocks.map((stock) => (
              <article key={stock.symbol} className="metric-row-card">
                <div>
                  <strong>{stock.symbol}</strong>
                  <p>{stock.statusLabel}</p>
                </div>
                <div className="home-watch-metrics">
                  <span>{stock.currentPriceLabel}</span>
                  <span>{stock.priceChangeRateLabel}</span>
                  <span>상승 {stock.upProbability}%</span>
                  <span>리스크 {stock.riskScore}</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <article className="empty-state-card">
            <p className="empty-title">아직 관심종목이 없어요!</p>
            <p className="empty-copy">개미의 첫 종목을 추가하고 다시 돌아와봐.</p>
            <Link to="/stock" className="primary-link-button">
              종목 검색하기
            </Link>
          </article>
        )}
      </section>

      <section className="content-section">
        <h2 className="section-title">🎓 모델 신뢰도</h2>

        <div className="accuracy-stack">
          <article className="metric-row-card">
            <div>
              <strong>최근 20회 방향 적중률 (DA)</strong>
              <p>{summary.confidenceRecentAccuracy}</p>
            </div>
            <span>{summary.confidenceRecentAccuracy}</span>
          </article>
          <article className="metric-row-card">
            <div>
              <strong>누적 정확도 추이</strong>
              <p>최근 1년 기준</p>
            </div>
            <span>{summary.confidenceOverallAccuracy}</span>
          </article>
        </div>

        <article className="tip-card">
          개미 팁: 예측 정확도는 과거 성과이며, 미래 수익을 보장하지 않아. 참고용으로만 활용해.
        </article>
      </section>

      <section className="content-section">
        <h2 className="section-title">📊 예측 히스토리</h2>

        <div className="history-list">
          {summary.marketHistory.map((item) => (
            <article
              key={`${item.date}-${item.title}`}
              className={`history-card ${item.success ? 'history-hit' : 'history-miss'}`}
            >
              <strong>{item.date}</strong>
              <p>{item.title}</p>
              <span>{item.statusLabel}</span>
            </article>
          ))}
        </div>

        <article className="warning-chip">
          데이터 출처: {summary.sourceLabel} · 갱신시각:{' '}
          {new Date(summary.generatedAt).toLocaleString('ko-KR')}
        </article>
      </section>
    </div>
  )
}
