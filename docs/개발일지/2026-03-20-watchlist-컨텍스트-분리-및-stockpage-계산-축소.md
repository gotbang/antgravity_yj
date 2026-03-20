# Watchlist 컨텍스트 분리 및 StockPage 계산 축소

- 작성시각: 2026-03-20
- 해결하고자 한 문제: `Watchlist` 컨텍스트가 상태와 액션을 한 번에 내려서 불필요한 재렌더가 발생했고, `StockPage`도 현재 화면과 무관한 파생 계산을 매 렌더마다 수행하고 있었음.

## 진행 내용

- `WatchlistContext`를 `WatchlistStateContext`와 `WatchlistActionsContext`로 분리함.
- 상태 컨텍스트에는 `watchlist`와 `watchlistSet`을 함께 제공해서 조회 비용을 줄임.
- 액션 컨텍스트에는 `toggleSymbol`만 제공해서 액션 구독 범위를 분리함.
- `useWatchlistState`, `useWatchlistActions`, `useWatchlist` 훅 구조로 재정리함.
- `StockPage`를 `StockDetailView`와 `StockListView`로 분리함.
- 목록 화면에서만 검색 결과와 관심종목 리스트 계산이 일어나도록 이동함.
- 상세 화면에서는 현재 종목 렌더에 필요한 watch 상태만 읽도록 축소함.
- 변경 후 `pnpm test`, `pnpm typecheck`, `pnpm lint`를 실행함.

## 해결된 것

- 관심종목 상태 변경 시 액션만 쓰는 소비자는 상태 배열 재생성에 직접 묶이지 않게 됨.
- `watchlist.includes()` 반복 대신 `watchlistSet.has()` 기반으로 조회 비용을 줄임.
- `StockPage`에서 현재 분기와 무관한 파생 계산이 줄어듦.

## 아직 안 된 것

- 다른 페이지도 필요하면 같은 방식으로 파생 계산과 구독 범위를 더 줄일 수 있음.
