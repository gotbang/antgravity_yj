import { NavLink } from 'react-router-dom'
import antMascotUrl from '../../design/ant.png'

export function BrandHeader() {
  return (
    <section className="top-panel brand-panel">
      <NavLink
        to="/"
        end
        className="brand-header-link"
        aria-label="Ant Gravity 첫 화면으로 이동"
      >
        <span className="brand-header-badge" aria-hidden="true">
          <img className="brand-header-mascot-image" src={antMascotUrl} alt="" />
        </span>
        <div className="brand-header-copy">
          <h1>Ant Gravity</h1>
          <p>개미들의 똑똑한 투자 친구</p>
        </div>
      </NavLink>
    </section>
  )
}
