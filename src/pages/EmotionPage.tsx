import { BrandHeader } from '../components/BrandHeader'
import { DEFAULT_MARKET_SUMMARY } from '../lib/market'
import { useMarketSummary } from '../lib/live-data'

const strategyRows = [
  '급락 시 패닉 매도 자제',
  '분할 매수로 평단가 낮추기',
  '단기 트레이딩보다 중기 관점 유지',
]

const keywordRows = ['금리 인상', '수출 감소', '중국 경기 둔화', '환율 급등']

export function EmotionPage() {
  const { data } = useMarketSummary()
  const summary = data ?? DEFAULT_MARKET_SUMMARY
  const moodTitle = summary.moodTitle
  const moodDescription = summary.moodDescription
  const fearGreedIndex = summary.fearGreedIndex
  const fearGreedLabel = summary.fearGreedLabel
  const marketWarning = summary.marketWarning
  const strategies = summary.strategies ?? strategyRows
  const negativeRatio = summary.negativeNewsRatio
  const positiveRatio = summary.positiveNewsRatio
  const keywords = summary.keywords ?? keywordRows

  return (
    <div className="screen">
      <BrandHeader />

      <section className="content-section">
        <h2 className="section-title">🧠 오늘의 시장 감정</h2>

        <div className="emotion-card-grid">
          <article className="emotion-detail-card">
            <div className="emotion-title-row">
              <div>
                <p>개미들의 마음은...</p>
                <h3>{moodTitle}</h3>
              </div>
              <span className="emoji-display" aria-hidden="true">
                😰
              </span>
            </div>
            <div className="body-note-box">
              {moodDescription}
            </div>
          </article>

          <article className="fear-card-large">
            <p>공포 &amp; 탐욕 지수</p>
            <strong>{fearGreedIndex}</strong>
            <span>😱 {fearGreedLabel}</span>
          </article>
        </div>

        <article className="atmosphere-card">
          <h3>⚠️ 시장 분위기</h3>
          <p>{marketWarning}</p>
        </article>

        <article className="strategy-panel">
          <h3>💪 추천 대응 전략</h3>
          <div className="strategy-stack">
            {strategies.map((item) => (
              <div key={item} className="strategy-row">
                • {item}
              </div>
            ))}
          </div>
        </article>

        <article className="warning-chip">
          🐜 개미 주의: 시장 감정 분석은 참고 자료이며, 투자 판단은 본인의 책임이야.
        </article>
      </section>

      <section className="content-section">
        <h2 className="section-title">📊 투자자 심리 지표</h2>

        <article className="signal-panel signal-panel-red">
          <div className="signal-header">
            <span className="signal-icon signal-icon-red" aria-hidden="true">
              ↘
            </span>
            <strong>개미 순매수</strong>
          </div>
          <div className="signal-stat-row">
            <strong>-1250억원</strong>
            <span className="signal-pill signal-pill-red">매도 우위 📉</span>
          </div>
          <p>개인 투자자들이 순매도 중이야</p>
        </article>

        <article className="signal-panel signal-panel-green">
          <div className="signal-header">
            <span className="signal-icon signal-icon-green" aria-hidden="true">
              ∞
            </span>
            <strong>외국인 &amp; 기관</strong>
          </div>
          <div className="double-mini-grid">
            <div className="mini-signal-box">
              <span>외국인</span>
              <strong>+820억</strong>
            </div>
            <div className="mini-signal-box">
              <span>기관</span>
              <strong>+530억</strong>
            </div>
          </div>
          <p>외국인과 기관은 순매수 중이야 📈</p>
        </article>

        <article className="interpret-card">
          <h3>🧭 수급 해석</h3>
          <p>개인 투자자 이탈, 외국인과 기관 매집 구간이야. 단기 약세 후 반등 가능성에 주목해봐.</p>
        </article>
      </section>

      <section className="content-section">
        <h2 className="section-title">📰 뉴스 감정 분석</h2>
        <p className="section-description">오늘 발행된 주요 경제·증시 뉴스의 감정 톤을 AI가 분석한 결과야.</p>

        <div className="split-stat-grid">
          <article className="news-stat-card">
            <div className="news-stat-head">
              <span>부정 뉴스</span>
              <span aria-hidden="true">😢</span>
            </div>
            <strong className="news-negative">{negativeRatio}%</strong>
          </article>
          <article className="news-stat-card">
            <div className="news-stat-head">
              <span>긍정 뉴스</span>
              <span aria-hidden="true">😊</span>
            </div>
            <strong className="news-positive">{positiveRatio}%</strong>
          </article>
        </div>

        <article className="keyword-panel">
          <h3>🔥 주요 키워드</h3>
          <div className="keyword-row">
            {keywords.map((item, index) => (
              <span key={item} className={`keyword-chip keyword-chip-${index + 1}`}>
                {item}
              </span>
            ))}
          </div>
        </article>

        <article className="warning-chip">
          데이터 출처: {summary.sourceLabel}
        </article>
      </section>
    </div>
  )
}
