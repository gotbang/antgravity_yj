import { BarChart3, BookText, ChevronLeft, ChevronRight, House, Settings } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { BrandHeader } from '../components/BrandHeader'
const moodPoints = [
  { left: '8%', top: '76%', emoji: '🙂', day: '1' },
  { left: '22%', top: '75%', emoji: '🙂', day: '7' },
  { left: '36%', top: '48%', emoji: '😊', day: '10' },
  { left: '50%', top: '72%', emoji: '🙂', day: '15' },
  { left: '64%', top: '44%', emoji: '😐', day: '20' },
  { left: '74%', top: '26%', emoji: '😭', day: '24' },
  { left: '86%', top: '62%', emoji: '😢', day: '27' },
  { left: '96%', top: '70%', emoji: '😢', day: '31' },
]

const journalTrades = [
  { symbol: '삼성전자', action: '매수', note: '저점에서 반등 기대', profit: '-150만원' },
  { symbol: '현대차', action: '매도', note: '수익 실현, 비중 축소', profit: '+70만원' },
]

const journalTabs = [
  { to: '/', label: 'Home', icon: House },
  { to: '/diary', label: 'Diary', icon: BookText },
  { to: '/journal', label: 'Analytics', icon: BarChart3 },
  { to: '/journal', label: 'Settings', icon: Settings },
]

export function JournalPage() {
  return (
    <div className="screen screen-journal journal-screen">
      <BrandHeader />

      <section className="month-switcher">
        <button type="button" className="month-arrow" aria-label="이전 달">
          <ChevronLeft size={18} />
        </button>
        <button type="button" className="month-pill">
          October 2023
        </button>
        <button type="button" className="month-arrow" aria-label="다음 달">
          <ChevronRight size={18} />
        </button>
      </section>

      <section className="content-section">
        <h2 className="section-title">월간 감정 그래프</h2>
        <article className="chart-card">
          <div className="chart-axis">
            <span>불안</span>
            <span>누르</span>
            <span>안정</span>
            <span>안정</span>
            <span>안정</span>
            <span>불안</span>
          </div>
          <div className="chart-area">
            <div className="chart-fill" />
            {moodPoints.map((point) => (
              <div key={point.day} className="chart-point" style={{ left: point.left, top: point.top }}>
                <span aria-hidden="true">{point.emoji}</span>
                <strong>{point.day}</strong>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="content-section">
        <h2 className="section-title">매매 일지</h2>
        <div className="journal-trade-stack">
          {journalTrades.map((item) => (
            <article key={`${item.symbol}-${item.action}-${item.note}`} className="trade-card">
              <div>
                <strong>{item.symbol}</strong>
                <div className="trade-meta">
                  <span className={`trade-tag${item.action === '매수' ? ' trade-buy' : ' trade-sell'}`}>
                    {item.action}
                  </span>
                  <p>{item.note}</p>
                </div>
              </div>
              <span className="trade-profit">{item.profit}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="content-section">
        <article className="wisdom-card">
          <h2>개미의 지혜 🐜</h2>
          <p>“시장은 인내심 없는 자의 돈을 인내심 있는 자에게 옮기는 장치다.” - 워런 버핏</p>
        </article>
      </section>

      <nav className="bottom-tab-bar" aria-label="하단 탭">
        {journalTabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={`${label}-${to}`}
            to={to}
            className={({ isActive }) => `bottom-tab${isActive && label !== 'Settings' ? ' bottom-tab-active' : ''}`}
          >
            <Icon size={18} strokeWidth={2} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
