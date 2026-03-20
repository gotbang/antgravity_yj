# Ant Gravity MVP PRD

- 작성시각: 2026-03-21 03:35:00 +09:00
- 기준 문서: `memory.md`, 현재 `src/`, `api/`, `scripts/` 구현

## 1. 제품 개요

Ant Gravity MVP는 초보 투자자가 시장 방향, 종목별 공시 기반 판단, 시장 감정 흐름을 한 화면 흐름 안에서 이해하도록 돕는 모바일 우선 웹 앱이야. 현재 구현은 React + Vite + TypeScript 프론트엔드와 Vite dev middleware / Vercel Functions 기반 API 조합으로 구성돼 있어.

핵심 경험은 다음 여섯 화면으로 나뉘어 있어.

1. `/`
   시장 방향 요약, 관심 종목 요약, 모델 신뢰도, 히스토리
2. `/stock`
   종목 검색, 인기 종목, 관심 종목 목록
3. `/stock/:symbol`
   개별 종목의 공시/재무/가격 기반 스냅샷
4. `/emotion`
   시장 감정, 공포-탐욕 지표, 뉴스 감정 비율
5. `/diary`
   감정형 다이어리/커뮤니티 UI
6. `/journal`
   월간 감정 그래프와 매매 기록 UI

## 2. 해결하려는 문제

- 초보 투자자는 시장 전체 분위기와 종목별 판단 근거를 한 번에 연결해서 보기 어려워.
- 숫자만 많은 화면은 이해 진입장벽이 높고, 감정과 맥락을 붙여주지 않으면 행동으로 이어지기 어려워.
- 국내 무료 공개 데이터만으로도 어디까지 구현 가능한지 빠르게 검증할 필요가 있어.

## 3. MVP 목표

- OpenDART 기반 공시/재무 정보를 실제 UI에 연결한다.
- 가격 데이터가 없더라도 화면이 끊기지 않게 fallback 구조를 유지한다.
- 관심 종목을 브라우저 로컬 상태로 저장해 개인화된 홈/종목 흐름을 제공한다.
- 디자인 기준 문서와 실제 구현 스타일을 모바일 우선의 동일한 브랜드 톤으로 유지한다.

## 4. 현재 범위

### 포함

- 홈 대시보드
  - 시장 상승/하락 확률
  - 변동 범위 / 리스크 점수
  - 관심 종목 요약
  - 모델 신뢰도 / 히스토리
- 종목 목록/상세
  - 종목 검색
  - 관심 종목 토글
  - 최신 공시일 / 공시명 / 공시 건수
  - 매출 / 영업이익 / 부채비율 요약
  - 가격 정보 존재 시 가격/등락률 노출
  - 근거, 리스크, 참고 가이드, 데이터 믹스, 백테스트형 카드
- 시장 감정
  - mood title / description
  - fear & greed index
  - 뉴스 긍부정 비율
  - 키워드
- 감정 다이어리 / 저널
  - 현재는 정적 UI 중심
  - 실제 저장/수정/동기화 기능은 없음
- 캐시/배치
  - 파일 캐시 + 메모리 캐시
  - `pnpm refresh-cache`
  - GitHub Actions 주기 갱신 워크플로
- 개발용 관리자 패널
  - 캐시 hit/miss/write/fallback 및 파일 목록 확인

### 제외

- 실제 매수/매도 주문
- 로그인 / 사용자 계정
- 서버 DB 기반 개인 데이터 저장
- GPS, 좌표, 민감 개인정보 저장
- 실시간 스트리밍 시세
- 뉴스 원문 수집/요약 파이프라인
- 다이어리/저널 저장 기능

## 5. 사용자 가치 제안

- 공시와 재무를 먼저 보여줘서 근거 없는 감 대신 데이터 기반 진입점을 준다.
- 가격 데이터가 붙지 않아도 종목 화면이 비지 않아서 MVP 검증이 끊기지 않는다.
- 귀여운 브랜드 톤과 카드형 정보 구조로 어려운 금융 정보를 덜 딱딱하게 전달한다.

## 6. 데이터 전략

### 현재 사용 중

- OpenDART
  - 기업 개황
  - 공시 목록
  - 단일회사 주요계정
- KRX OPEN API
  - 키가 있으면 일별 시세 사용
- Yahoo Finance fallback
  - `YFINANCE_ENABLED=true` 또는 `YFINANCE_DEV_FALLBACK_ENABLED=true`일 때만 사용
  - 개인용 fallback 성격이며 장기 운영 기본안은 아님

### 현재 데이터 합성 방식

- 종목 스냅샷
  - 공시 tone 분석
  - 재무 값 추출
  - 가격 정보 결합
  - 규칙 기반 확률/리스크 계산
- 시장 요약
  - 종목 스냅샷 평균값 집계
  - 긍부정 공시 비중 집계
  - 키워드 추출

## 7. 캐시 전략

- 회사 정보: 24시간
- 공시 목록: 2시간
- 재무 정보: 24시간
- 가격 정보: 5분
- 종목 스냅샷: 20분
- 시장 요약: 30분

캐시 위치:

- `data/cache/raw/company/*.json`
- `data/cache/raw/disclosures/*.json`
- `data/cache/raw/financials/*.json`
- `data/cache/raw/prices/all.json`
- `data/cache/view/stocks/*.json`
- `data/cache/view/market-summary.json`

## 8. 상태 관리

- 관심 종목은 브라우저 `localStorage`에 저장
- 저장 키: `ant-gravity.watchlist`
- 저장 형식: `string[]`
- 서버 영속 저장은 없음

## 9. API 범위

### 개발 서버

- `GET /api/opendart/market-summary`
- `GET /api/opendart/stock?symbol=...`
- `GET /api/opendart/debug`

### Vercel Functions

- `GET /api/opendart/market-summary`
- `GET /api/opendart/stock?symbol=...`

주의:

- `debug` 엔드포인트는 현재 dev middleware 기준으로만 보장돼. 프로덕션에서 `?admin=1`로 여는 흐름은 문서상 지원 상태가 아니야.

## 10. 품질 기준

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`

## 11. 알려진 한계

- 감정 페이지 일부 투자 주체 수치는 아직 정적 카피야.
- 다이어리 / 저널은 실제 데이터 입력 기능이 없는 UI 단계야.
- 가격 데이터는 KRX 키가 없을 때 Yahoo fallback에 의존할 수 있는데, 이건 장기 운영 기준으로는 보조 수단이야.
- 숫자 표기 형식이 일부 화면에서 완전히 통일되진 않았어.

## 12. 다음 우선순위

1. KRX OPEN API를 운영 기준 가격 소스로 안정화
2. 숫자 표기 규칙 완전 통일
3. 관리자 디버그 패널의 운영 노출 범위 결정
4. 다이어리/저널을 실제 저장 기능으로 확장할지 여부 결정
