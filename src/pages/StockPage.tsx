import { useCallback, useDeferredValue, useMemo, useState } from 'react'
import { NavLink, useNavigate, useParams } from 'react-router-dom'
import { StockListItem } from '../components/StockListItem'
import { useWatchlistActions, useWatchlistState } from '../context/useWatchlist'
import { useMarketSummary, useStockSnapshot } from '../lib/live-data'
import {
  STOCK_PREDICTIONS,
  filterStocks,
  getStockPrediction,
  type StockPrediction,
} from '../lib/market'

type StockTab = 'popular' | 'watchlist'

type StockDetailViewProps = {
  stock: StockPrediction
}

function StockDetailView({ stock }: StockDetailViewProps) {
  const { watchlistSet } = useWatchlistState()
  const { toggleSymbol } = useWatchlistActions()
  const isWatched = watchlistSet.has(stock.symbol)
  const { data } = useStockSnapshot(stock.symbol)
  const viewStock = data ?? stock

  return (
    <div className="screen screen-prediction">
      <section className="top-panel prediction-top-panel">
        <header className="top-brand-row center-brand">
          <div>
            <h1>Ant Gravity</h1>
            <p>{viewStock.symbol} 상세 분석</p>
          </div>
        </header>

        <nav className="home-tab-grid" aria-label="상단 탭">
          <NavLink
            to={`/stock/${stock.symbol}`}
            className={({ isActive }) => `home-tab${isActive ? ' home-tab-active' : ''}`}
          >
            <span aria-hidden="true">↑</span>
            <strong>오늘 판단</strong>
          </NavLink>
          <NavLink
            to="/stock"
            end
            className={({ isActive }) => `home-tab${isActive ? ' home-tab-active' : ''}`}
          >
            <span aria-hidden="true">📊</span>
            <strong>종목 분석</strong>
          </NavLink>
          <NavLink to="/emotion" className="home-tab">
            <span aria-hidden="true">🗒️</span>
            <strong>개미의 일기</strong>
          </NavLink>
        </nav>
      </section>

      <section className="content-section">
        <article className="stock-hero-card">
          <div>
            <p className="stock-hero-kicker">📈 {viewStock.symbol}</p>
            <h2 className="section-title">방향 예상 (5일)</h2>
          </div>
          <button
            type="button"
            className={`watch-star stock-hero-star${isWatched ? ' watch-star-active' : ''}`}
            onClick={() => toggleSymbol(viewStock.symbol)}
            aria-label={isWatched ? '관심 종목 해제' : '관심 종목 추가'}
          >
            ★
          </button>
        </article>

        <article className="prediction-panel prediction-panel-soft">
          <div className="prediction-headline">
            <div className="prediction-arrow" aria-hidden="true">
              {viewStock.trend === 'down' ? '↓' : '↑'}
            </div>
            <div>
              <p>{viewStock.statusLabel}</p>
              <h3>{viewStock.forecastLabel}</h3>
            </div>
          </div>

          <div className="progress-list">
            <div className="progress-card progress-card-up">
              <div className="progress-meta">
                <span>상승 예상</span>
                <strong>{viewStock.upProbability}%</strong>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill progress-fill-up"
                  style={{ width: `${viewStock.upProbability}%` }}
                />
              </div>
            </div>
            <div className="progress-card progress-card-down">
              <div className="progress-meta">
                <span>하락 예상</span>
                <strong>{viewStock.downProbability}%</strong>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill progress-fill-down"
                  style={{ width: `${viewStock.downProbability}%` }}
                />
              </div>
            </div>
          </div>

          <div className="prediction-note">{viewStock.rangeNote}</div>
        </article>
      </section>

      <section className="metric-grid">
        <article className="summary-box">
          <span>예상 변동 범위</span>
          <strong>{viewStock.volatilityRange}</strong>
        </article>
        <article className="summary-box">
          <span>시장 리스크 점수</span>
          <strong>{viewStock.riskScore}/100</strong>
        </article>
      </section>

      <section className="content-section">
        <h2 className="section-title">🧠 판단 근거</h2>
        <div className="accuracy-stack">
          {viewStock.reasoning.map((item) => (
            <article key={item.title} className="metric-row-card">
              <div>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-section">
        <h2 className="section-title">⚠️ 리스크 평가</h2>
        <div className="metric-grid">
          <article className="summary-box">
            <span>리스크 점수</span>
            <strong>{viewStock.riskScore} / 100</strong>
          </article>
          <article className="summary-box">
            <span>현재 구간 해석</span>
            <strong>{viewStock.riskStatusLabel}</strong>
          </article>
        </div>
        <article className="interpret-card">
          <h3>전략 코멘트</h3>
          <p>{viewStock.riskComment}</p>
        </article>
      </section>

      <section className="content-section">
        <h2 className="section-title">💡 참고 전략 가이드</h2>
        <article className="strategy-panel">
          <div className="strategy-stack">
            {viewStock.strategyGuide.map((item) => (
              <div key={item} className="strategy-row">
                • {item}
              </div>
            ))}
          </div>
        </article>
        <article className="tip-card">
          개미 팁: 정확한 가격 제시가 아니라 범위 기반 가이드야. 비중 관리를 먼저 생각해.
        </article>
      </section>

      <section className="content-section">
        <h2 className="section-title">📊 데이터 믹스</h2>
        <p className="section-description">
          AI 예측과 함께 참고할 수 있는 기본 재무지표와 시장 데이터를 정리했어.
        </p>

        <div className="data-mix-grid">
          <article className="data-mix-card">
            <h3>재무 통계</h3>
            <div className="data-mix-stack">
              {viewStock.financialMetrics.map((item) => (
                <div key={item.label} className="data-mix-row">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="data-mix-card">
            <h3>애널리스트 컨센서스</h3>
            <div className="data-mix-stack">
              <div className="data-mix-row">
                <span>목표가</span>
                <strong>{viewStock.consensus.targetPrice}</strong>
                <p>참고 지표</p>
              </div>
              <div className="data-mix-row">
                <span>의견</span>
                <strong>{viewStock.consensus.opinion}</strong>
                <p>평균 의견</p>
              </div>
              <div className="data-mix-row">
                <span>커버리지</span>
                <strong>{viewStock.consensus.coverage}</strong>
                <p>집계 기준</p>
              </div>
            </div>
          </article>

          <article className="data-mix-card">
            <h3>변동성 및 보조 지표</h3>
            <div className="data-mix-stack">
              {viewStock.technicalIndicators.map((item) => (
                <div key={item.label} className="data-mix-row">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="content-section">
        <h2 className="section-title">🚀 AI 예측 따랐다면?</h2>
        <article className="backtest-card">
          <p>{viewStock.backtestDescription}</p>
          <strong>{viewStock.backtestReturn}</strong>
        </article>
        <article className="warning-chip">{viewStock.backtestWarning}</article>
      </section>

      <section className="content-section">
        <h2 className="section-title">모델 신뢰도</h2>
        <div className="metric-grid">
          <article className="summary-box">
            <span>{viewStock.confidenceLabel}</span>
            <strong>67.5%</strong>
          </article>
          <article className="summary-box">
            <span>누적 정확도 추이</span>
            <strong>{viewStock.accuracyRate}</strong>
          </article>
        </div>
      </section>

      <section className="content-section">
        <h2 className="section-title">예측 히스토리</h2>
        <div className="history-list">
          {viewStock.history.map((item) => (
            <article
              key={`${viewStock.symbol}-${item.date}-${item.title}`}
              className={`history-card ${item.success ? 'history-hit' : 'history-miss'}`}
            >
              <strong>{item.date}</strong>
              <p>{item.title}</p>
              <span>{item.statusLabel}</span>
            </article>
          ))}
        </div>

        <article className="warning-chip">
          최근 노트: {viewStock.recentNote}
        </article>
      </section>
    </div>
  )
}

function StockListView() {
  const navigate = useNavigate()
  const { watchlist, watchlistSet } = useWatchlistState()
  const { toggleSymbol } = useWatchlistActions()
  const { data } = useMarketSummary()
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<StockTab>('popular')
  const deferredQuery = useDeferredValue(query)

  const suggestions = useMemo(() => {
    const normalizedQuery = deferredQuery.trim()

    if (!normalizedQuery) {
      return []
    }

    return filterStocks(normalizedQuery).slice(0, 6)
  }, [deferredQuery])

  const watchlistStocks = useMemo(
    () =>
      watchlist
        .map((item) => data?.stocks.find((stock) => stock.symbol === item) ?? getStockPrediction(item))
        .filter(Boolean),
    [data?.stocks, watchlist],
  )

  const liveStocks = data?.stocks ?? STOCK_PREDICTIONS
  const listItems = tab === 'popular' ? liveStocks : watchlistStocks
  const listDescription =
    tab === 'popular'
      ? '인기 종목 목록을 보고 있어.'
      : watchlistStocks.length > 0
        ? '관심 종목 목록을 보고 있어.'
        : '관심 종목이 아직 없어서 비어 있어.'

  const handleSelectSymbol = useCallback(
    (nextSymbol: string) => {
      navigate(`/stock/${nextSymbol}`)
      setQuery('')
    },
    [navigate],
  )

  return (
    <div className="screen screen-analysis">
      <section className="analysis-header">
        <div className="top-brand-row">
          <span className="top-brand-ant" aria-hidden="true">
            🐜
          </span>
          <div>
            <h1>Ant Gravity</h1>
            <p>개미들의 똑똑한 투자 친구</p>
          </div>
        </div>
      </section>

      <section className="content-section">
        <h2 className="section-title">🔎 종목 검색</h2>
        <article className="stock-source-card">
          <strong>실제 OpenDART 공시/재무 데이터</strong>
          <p>현재 종목분석은 공시일, 최근 공시명, 매출액, 영업이익, 부채비율 기준으로 보여줘.</p>
          <span>실시간 가격은 별도 시세 API가 필요해서 아직 연결하지 않았어.</span>
        </article>
        <label htmlFor="stock-search" className="visually-hidden">
          종목 검색
        </label>
        <div className="search-box">
          <input
            id="stock-search"
            aria-describedby="stock-list-status"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="다른 종목 검색 (예: 현대차)"
          />
        </div>

        {query.trim() ? (
          <div className="suggestion-stack">
            {suggestions.length > 0 ? (
              suggestions.map((item) => (
                <StockListItem
                  key={item.symbol}
                  stock={getStockPrediction(item.symbol)}
                  isWatched={watchlistSet.has(item.symbol)}
                  onSelectSymbol={handleSelectSymbol}
                  onToggleSymbol={toggleSymbol}
                />
              ))
            ) : (
              <div className="empty-card">검색 결과가 없어</div>
            )}
          </div>
        ) : null}
      </section>

      <section className="content-section">
        <div className="segmented-bar" role="group" aria-label="종목 보기 전환">
          <button
            type="button"
            className={`segment-button${tab === 'popular' ? ' segment-button-active' : ''}`}
            onClick={() => setTab('popular')}
            aria-pressed={tab === 'popular'}
            aria-controls="stock-list-panel"
          >
            🔥 인기 종목
          </button>
          <button
            type="button"
            className={`segment-button${tab === 'watchlist' ? ' segment-button-active' : ''}`}
            onClick={() => setTab('watchlist')}
            aria-pressed={tab === 'watchlist'}
            aria-controls="stock-list-panel"
          >
            ⭐ 관심 종목
          </button>
        </div>

        <p id="stock-list-status" className="visually-hidden" aria-live="polite">
          {listDescription}
        </p>

        <div id="stock-list-panel" className="suggestion-stack">
          {listItems.map((item) => (
            <StockListItem
              key={item.symbol}
              stock={item}
              isWatched={watchlistSet.has(item.symbol)}
              onSelectSymbol={handleSelectSymbol}
              onToggleSymbol={toggleSymbol}
            />
          ))}

          {tab === 'watchlist' && watchlistStocks.length === 0 ? (
            <div className="empty-card">관심 종목을 별표로 저장하면 여기서 바로 볼 수 있어.</div>
          ) : null}
        </div>

        <div className="hint-card">💡 종목을 클릭하면 상세 분석을 확인할 수 있습니다</div>
        <article className="warning-chip">
          데이터 출처: {data?.sourceLabel ?? '샘플 데이터'} · 가격/시세는 아직 별도 연동 전이야.
        </article>
      </section>
    </div>
  )
}

export function StockPage() {
  const { symbol } = useParams()

  if (symbol) {
    return <StockDetailView stock={getStockPrediction(symbol)} />
  }

  return <StockListView />
}
