import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { AdminDebugPanel } from './AdminDebugPanel'

function RouteFallback() {
  return (
    <div className="screen" aria-busy="true" aria-live="polite">
      <section className="top-panel shell-skeleton-panel">
        <div className="skeleton-line skeleton-line-title" />
        <div className="shell-skeleton-tabs">
          <div className="skeleton-chip" />
          <div className="skeleton-chip" />
          <div className="skeleton-chip" />
        </div>
      </section>

      <section className="content-section">
        <div className="skeleton-card skeleton-card-large" />
        <div className="skeleton-grid">
          <div className="skeleton-card" />
          <div className="skeleton-card" />
        </div>
      </section>
    </div>
  )
}

export function AppShell() {
  return (
    <div className="app-shell-bg">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />
      <main className="phone-stage">
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <AdminDebugPanel />
    </div>
  )
}
