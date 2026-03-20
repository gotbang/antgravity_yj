import { Link } from 'react-router-dom'

const dates = [
  { day: '일', date: '21', selected: false },
  { day: '월', date: '22', selected: false },
  { day: '화', date: '23', selected: false },
  { day: '수', date: '24', selected: true },
  { day: '목', date: '25', selected: false },
  { day: '금', date: '26', selected: false },
  { day: '토', date: '27', selected: false },
]

const communityEntries = [
  { avatar: '🐻', name: '부지런한 개미', time: '10분 전', body: '오늘은 힘들었지만 잘 참았다! 모두 힘내세요!' },
  { avatar: '🐢', name: '초보 개미', time: '1시간 전', body: '소소하게 매수했습니다. 장기 투자 가즈아!' },
]

export function DiaryPage() {
  return (
    <div className="screen screen-diary">
      <section className="top-panel diary-top-panel">
        <header className="top-brand-row">
          <span className="top-brand-ant">🐜</span>
          <div>
            <span className="mini-brand-label">Ant Gravity</span>
            <h1>Ant&apos;s Diary</h1>
            <p>개미들의 똑똑한 투자 친구</p>
          </div>
        </header>
      </section>

      <section className="date-strip" aria-label="날짜 선택">
        {dates.map((item) => (
          <button key={`${item.day}-${item.date}`} type="button" className={`date-pill${item.selected ? ' date-pill-active' : ''}`}>
            <span>{item.day}</span>
            <strong>{item.date}</strong>
          </button>
        ))}
      </section>

      <section className="content-section">
        <h2 className="section-title">오늘의 일기</h2>
        <article className="diary-entry-card">
          <div className="avatar-badge diary-avatar-main">🐱</div>
          <div className="diary-entry-copy">
            <strong>오늘 하루, 열심히 버텼다!</strong>
            <p>#투자 #개미</p>
          </div>
        </article>
      </section>

      <section className="content-section">
        <h2 className="section-title">커뮤니티 다이어리</h2>
        <div className="community-stack">
          {communityEntries.map((item) => (
            <article key={item.name} className="community-card">
              <div className="community-head">
                <div className="community-profile">
                  <span className="avatar-badge avatar-small">{item.avatar}</span>
                  <strong>{item.name}</strong>
                </div>
                <span>{item.time}</span>
              </div>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <Link to="/journal" className="compose-floating">
        <span>Write My Diary</span>
        <strong>✎</strong>
      </Link>

      <div className="phone-home-indicator" aria-hidden="true" />
    </div>
  )
}
