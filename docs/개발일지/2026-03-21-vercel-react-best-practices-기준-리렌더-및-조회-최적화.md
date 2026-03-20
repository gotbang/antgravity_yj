# vercel-react-best-practices 기준 리렌더 및 조회 최적화

- 작성시각: 2026-03-21 03:20:00 +09:00
- 해결하고자 한 문제: React 화면에서 같은 배열을 반복 `find()`로 조회하고 있었고, 관심 종목 `localStorage` 접근도 매번 직접 읽는 구조라 `vercel-react-best-practices` 기준으로 보면 조회 비용과 리렌더 측면에서 개선 여지가 있었음.

## 진행 내용

- `HomePage`에서 관심 종목 매칭용 `Map`을 만들고 반복 `find()`를 제거했음.
- `StockPage` 목록 화면에서 live stock 인덱스 맵을 만들고:
  - 관심 종목 목록 생성
  - 검색 결과의 stock 매칭
  두 경로 모두 O(1) 조회로 바꿨음.
- `watchlist-storage.ts`를 추가해서 `localStorage` read/write를 메모리 캐시와 함께 관리하도록 분리했음.
- `WatchlistProvider`는 새 storage 유틸을 사용하도록 바꾸고, 다른 탭에서 storage가 바뀌었을 때 동기화되도록 `storage` 이벤트를 연결했음.
- `watchlist-storage.test.ts`를 추가해서 저장/복구 및 잘못된 저장값 정리 동작을 검증했음.

## 해결된 것

- 홈/종목 화면에서 반복되는 선형 검색을 줄였음.
- 관심 종목 storage 접근 비용을 줄이고 코드 책임을 분리했음.
- 다른 탭에서 관심 종목이 바뀌어도 provider가 따라오도록 개선했음.
- `pnpm test -- --run`, `pnpm typecheck`, `pnpm lint`를 모두 통과했음.

## 아직 안 된 것

- `useMarketSummary` / `useStockSnapshot` 자체의 네트워크 요청 dedup은 아직 별도 레이어가 없음.
- 아주 큰 리스트에 대한 렌더링 최적화나 가상화는 아직 필요 수준이 아니어서 적용하지 않았음.
