# Watchlist 분리 및 StockPage 리팩토링

- 작성시각: 2026-03-20
- 해결하고자 한 문제: Vercel React best practices 리뷰 기준으로, 상태 구독 범위와 파생 계산 범위를 줄이는 리팩토링이 필요했음.

## 사용한 프롬프트 요약

- `StockPage의 derived 계산 범위 축소나 context 분리`

## 해결된 것

- `Watchlist` 상태/액션 컨텍스트 분리
- `watchlistSet` 제공
- `StockPage` 목록/상세 분리
- 검증 통과

## 아직 안 된 것

- 추가적인 컴포넌트 단위 메모화나 렌더 비용 측정은 후속으로 진행 가능함.
