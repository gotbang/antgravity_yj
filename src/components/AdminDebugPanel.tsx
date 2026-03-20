import { useMemo, useState } from 'react'
import { useCacheDiagnostics } from '../lib/live-data'

function formatTimestamp(value: string | null) {
  if (!value) {
    return '?놁쓬'
  }

  return new Date(value).toLocaleString('ko-KR')
}

export function AdminDebugPanel() {
  const [open, setOpen] = useState(false)
  const enabled = useMemo(() => import.meta.env.DEV, [])
  const { data, isLoading, error } = useCacheDiagnostics(enabled)

  if (!enabled) {
    return null
  }

  return (
    <aside className="admin-debug-panel">
      <button type="button" className="admin-debug-toggle" onClick={() => setOpen((value) => !value)}>
        관리자 캐시 패널 {open ? '닫기' : '열기'}
      </button>

      {open ? (
        <div className="admin-debug-body">
          <strong>마지막 갱신: {formatTimestamp(data?.latestUpdatedAt ?? null)}</strong>
          <span>hits: {data?.stats.hits ?? 0}</span>
          <span>misses: {data?.stats.misses ?? 0}</span>
          <span>writes: {data?.stats.writes ?? 0}</span>
          <span>fallbacks: {data?.stats.fallbacks ?? 0}</span>
          <span>memory keys: {data?.memoryKeys.length ?? 0}</span>
          {isLoading ? <span>불러오는 중..</span> : null}
          {error ? <span>오류: 디버그 정보를 가져오지 못했어.</span> : null}
          <div className="admin-debug-file-list">
            {(data?.files ?? []).slice(0, 8).map((file) => (
              <div key={file.key} className="admin-debug-file-row">
                <span>{file.key}</span>
                <span>{formatTimestamp(file.updatedAt)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </aside>
  )
}
