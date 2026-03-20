# StockListItem 컴포넌트 분리 및 memo 적용

- 작성시각: 2026-03-20
- 해결하고자 한 문제: `StockListView` 내부에서 리스트 아이템 마크업이 직접 반복되고 있어 구조가 무거웠고, 항목 단위 렌더 최적화 여지가 있었음.

## 진행 내용

- `src/components/StockListItem.tsx`를 추가해서 리스트 행을 프리미티브 컴포넌트로 분리함.
- `StockListItem`에 `memo`를 적용함.
- `StockPage`에서는 항목별 JSX를 직접 렌더하는 대신 `StockListItem`을 사용하도록 변경함.
- `onSelectSymbol`은 `useCallback`으로 안정화해서 `memo` 이점을 살릴 수 있게 함.
- 관심 여부는 부모에서 `watchlistSet.has()`로 계산해 primitive props로 전달함.
- 변경 후 `pnpm test`, `pnpm typecheck`, `pnpm lint`를 실행함.

## 해결된 것

- `StockListView` 구조가 더 단순해짐.
- 항목 렌더가 독립된 컴포넌트로 분리되어 재사용성과 가독성이 좋아짐.
- `memo` 적용으로 리스트 항목 재렌더 비용을 줄일 기반이 마련됨.

## 아직 안 된 것

- 필요하면 검색 결과 아이템과 일반 리스트 아이템을 더 세분화해서 분리할 수 있음.
