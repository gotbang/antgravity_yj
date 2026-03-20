# UI / Route 계약

- 작성시각: 2026-03-21 03:35:00 +09:00
- 기준: 현재 `src/App.tsx`, 각 페이지 컴포넌트, `src/lib/live-data.ts`

## 라우트 목록

### `/`

- 목적: 시장 전체 방향과 개인 관심 종목을 빠르게 훑는 홈 대시보드
- 주요 섹션:
  - 브랜드 헤더
  - 빠른 진입 카드 3개
  - 오늘의 주식 시장 방향
  - 관심 종목
  - 모델 신뢰도
  - 히스토리
- 사용 데이터:
  - `useMarketSummary()`
  - `useWatchlistState()`
- fallback:
  - 네트워크 실패 시 `DEFAULT_MARKET_SUMMARY`
  - 관심 종목 데이터가 없으면 `getStockPrediction()`

### `/stock`

- 목적: 종목 검색과 목록 탐색
- 주요 섹션:
  - 브랜드 헤더
  - 검색 입력
  - 검색 결과 목록
  - `인기 종목` / `관심 종목` 탭
  - 데이터 출처 안내
- 사용 데이터:
  - `useMarketSummary()`
  - `useWatchlistState()`
  - `useWatchlistActions()`
- 동작:
  - 검색어는 `useDeferredValue`로 필터링
  - 관심 종목 토글 가능
  - 항목 선택 시 `/stock/:symbol`로 이동

### `/stock/:symbol`

- 목적: 개별 종목 상세 분석
- 주요 섹션:
  - 브랜드 헤더
  - 종목 hero 카드
  - 방향 예측
  - 요약 지표
  - 판단 근거
  - 리스크 해석
  - 참고 가이드
  - 데이터 믹스
  - AI 예측 가정 카드
  - 모델 신뢰도
  - 히스토리
- 사용 데이터:
  - 초기값 `getStockPrediction(symbol)`
  - 실데이터 `useStockSnapshot(symbol)`
- fallback:
  - API 실패 시 placeholder 예측값 유지

### `/emotion`

- 목적: 시장 감정과 뉴스 톤을 카드형으로 전달
- 주요 섹션:
  - 오늘의 시장 감정
  - fear & greed 카드
  - 시장 분위기
  - 추천 대응 가이드
  - 투자 주체 흐름 카드
  - 뉴스 감정 비율
  - 키워드
- 사용 데이터:
  - `useMarketSummary()`
- 주의:
  - 일부 투자 주체 수치는 현재 정적 표시

### `/diary`

- 목적: 감정형 다이어리/커뮤니티 화면 제공
- 주요 섹션:
  - 날짜 스트립
  - 오늘의 일기 카드
  - 커뮤니티 다이어리
  - `/journal`로 이동하는 floating CTA
- 사용 데이터:
  - 현재 정적 데이터만 사용

### `/journal`

- 목적: 월간 감정 그래프와 매매 기록을 보여주는 정적 저널 화면
- 주요 섹션:
  - 월 전환 UI
  - 감정 그래프
  - 매매 일지
  - 인용 카드
  - 하단 탭 바
- 사용 데이터:
  - 현재 정적 데이터만 사용

## 레이아웃 계약

- 모든 주요 화면은 `AppShell` 안에서 렌더링
- `AppShell` 역할:
  - ambient 배경
  - `phone-stage` 컨테이너
  - 라우트 `Suspense` fallback
  - `AdminDebugPanel`
- 모든 주요 페이지 상단에는 `BrandHeader` 사용

## 상태 계약

### 관심 종목

- 저장 위치: 브라우저 `localStorage`
- key: `ant-gravity.watchlist`
- 타입: `string[]`
- provider: `WatchlistProvider`
- 접근 훅:
  - `useWatchlistState()`
  - `useWatchlistActions()`

### 원격 데이터 로딩

- 홈 / 종목 / 감정 페이지는 `fetch` 기반 로딩
- poll interval:
  - 시장 요약: 60초
  - 종목 스냅샷: 60초
  - 캐시 진단: 30초
- 테스트 모드(`import.meta.env.MODE === 'test'`)에서는 네트워크 요청 생략

## API 계약

### `GET /api/opendart/market-summary`

- 반환: `MarketSummary`
- 사용 화면:
  - `/`
  - `/stock`
  - `/emotion`

### `GET /api/opendart/stock?symbol={symbol}`

- 반환: `StockPrediction`
- 사용 화면:
  - `/stock/:symbol`

### `GET /api/opendart/debug`

- 반환:
  - cache root
  - hit/miss/write/fallback 통계
  - memory key 목록
  - 최신 갱신 시각
  - 캐시 파일 목록
- 사용 화면:
  - `AdminDebugPanel`
- 비고:
  - 현재 dev middleware 기준으로만 보장

## 제약

- 서버 DB 없음
- GPS/위치 정보 저장 없음
- 민감 개인정보 저장 없음
- 관심 종목 외 개인화 데이터 영속 저장 없음
- diary/journal은 현재 CRUD 기능 없음
