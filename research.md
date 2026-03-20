# Ant Gravity 데이터 리서치 및 문서 동기화 정리

- 작성시각: 2026-03-21 04:32:36 +09:00
- 이번 확인 범위:
  - `memory.md`
  - `docs/PRD.md`
  - `spec/ui-routes.md`
  - `design/MASTER.md`
  - `design/design-tokens.md`
  - `src/server/opendart.ts`
  - `src/server/krx.ts`
  - `src/server/request-security.ts`
  - `src/lib/live-data.ts`
  - `.github/workflows/refresh-market-cache.yml`
  - `.gitignore`
- 목적:
  - `memory.md`와 관련 문서가 지금 기준으로 무엇을 확정하고 무엇이 아직 불확실한지 다시 정리한다.
  - `research.md`를 단순 조사 후보 문서가 아니라 현재 구현/운영 제약/문서 불일치까지 담는 기준 문서로 업데이트한다.

## 1. 한 줄 결론

지금 Ant Gravity는 `OpenDART 기반 공시/재무 해석`을 중심축으로 이미 돌아가고 있고, 가격 레이어는 `KRX OPEN API 연동 준비 + Yahoo Finance 개발용 fallback` 구조로 붙어 있어. 여기에 `메모리 + 파일 캐시`, `30분 주기 배치 갱신`, `클라이언트 fallback`, `공개 API rate limit`, `DEV 전용 debug 노출 제한`까지 들어가 있어서, 현재 단계는 "어떤 데이터를 쓸지 조사 중"이 아니라 "이미 구현된 데이터/운영 구조를 문서에 정확히 맞춰야 하는 단계"로 보는 게 맞아.

## 2. 이번에 확정한 기준 문서 이해

### 2-1. `memory.md`

`memory.md`는 가장 상세한 세션 누적 기록이야. 현재 스택, 라우트, 디자인 방향, 데이터 소스, 캐시 구조, 최근 검증, 다음 우선순위, 최근 핸드오프까지 한 번에 담고 있어. 다만 세션 기록 성격이라서 최신 상태와 섞인 과거 표현도 있고, 일부 경로 표기는 지금 워크스페이스와 어긋난 부분이 있어.

### 2-2. `docs/PRD.md`

`docs/PRD.md`는 제품 범위와 제외 범위를 분리해서 읽기에 좋았어. 특히 아래가 명확했어.

- 홈, 종목, 감정, 다이어리, 저널의 현재 MVP 범위
- 서버 DB 없음
- GPS/민감 개인정보 저장 금지
- Yahoo 가격은 장기 운영 메인안이 아니라 fallback
- 숫자 표기 통일, KRX 안정화, debug 운영 범위 결정이 다음 우선순위

### 2-3. `spec/ui-routes.md`

`spec/ui-routes.md`는 라우트별 목적, 섹션, 사용 데이터, fallback, poll interval, 상태 계약을 가장 또렷하게 정리하고 있어. 실제 화면 흐름을 이해할 때 이 문서가 제일 구조적이었어.

### 2-4. 디자인 문서

`design/MASTER.md`와 `design/design-tokens.md`는 현재 제품의 브랜드 톤을 확정해 주는 문서야.

- 네이비 헤더 + 원형 개미 캐릭터 + 파스텔 카드 + 둥근 굵은 타이포
- 모바일 우선 390px 전후
- `오늘 판단`, `종목 분석`, `개미의 일기` 3개 진입 카드 고정
- 금융 정보를 덜 차갑게 전달하는 `cute fintech` 방향

즉, 이 프로젝트는 데이터 앱이지만 표현 방식은 차가운 대시보드보다 `부드러운 카드형 투자 도우미`에 가깝다고 이해하는 게 맞아.

## 3. 현재 제품과 화면 흐름 이해

현재 구현된 주요 라우트는 아래 여섯 개야.

1. `/`
   시장 방향, 관심 종목, 모델 신뢰도, 히스토리를 빠르게 보는 홈
2. `/stock`
   종목 검색과 목록 탐색
3. `/stock/:symbol`
   개별 종목 상세 분석
4. `/emotion`
   시장 감정, fear & greed, 뉴스 감정 비율, 키워드
5. `/diary`
   감정형 다이어리/커뮤니티 UI
6. `/journal`
   월간 감정 그래프와 매매 기록 UI

여기서 핵심 메인 흐름은 `/`, `/stock`, `/stock/:symbol`, `/emotion`이고, `/diary`, `/journal`은 아직 정적 UI 성격이 강한 보조 흐름이야. `memory.md`와 `spec/ui-routes.md`가 이 점에서 일치해.

## 4. 데이터 아키텍처 이해

### 4-1. 핵심 데이터 축

현재 핵심 공식 데이터 축은 `OpenDART`야.

- 기업 개황
- 최근 공시 목록
- 단일회사 주요계정

이걸 바탕으로 종목별 해석값을 만들고, 여러 종목 결과를 집계해서 `MarketSummary`를 만든다. 문서와 코드 모두 현재 값을 "학습형 AI 예측"이 아니라 `규칙 기반 파생 지표`로 보는 쪽이 맞아.

### 4-2. 가격 데이터 축

가격 데이터는 별도 축으로 붙어 있어.

- 1순위: `KRX OPEN API`
- fallback: `Yahoo Finance 개인용 시세`

동작 조건은 아래처럼 읽혔어.

- `KRX_OPEN_API_KEY` 또는 `KRX_API_KEY`가 있으면 KRX 경로 사용
- KRX 키가 없고 `YFINANCE_ENABLED=true` 또는 `YFINANCE_DEV_FALLBACK_ENABLED=true`면 Yahoo fallback 허용

중요한 해석:

- Yahoo는 현재 구현돼 있고 실제로 동작 가능한 경로야.
- 하지만 문서상 운영 기본안으로 적으면 안 돼.
- `personal use only` 제약 때문에 장기 운영 기준은 여전히 KRX 전환이 맞아.

### 4-3. 클라이언트 소비 방식

프론트는 아래 API를 소비해.

- 홈, 종목 목록, 감정: `GET /api/opendart/market-summary`
- 종목 상세: `GET /api/opendart/stock?symbol=...`
- 관리자 패널: `GET /api/opendart/debug`

그리고 `src/lib/live-data.ts` 기준으로 다음 fallback 동작이 있어.

- `useMarketSummary()`는 실패 시 `DEFAULT_MARKET_SUMMARY` 유지
- `useStockSnapshot()`은 실패 시 `getStockPrediction(symbol)` placeholder 유지
- 테스트 모드에서는 네트워크 요청을 건너뜀

## 5. 캐시, 배치, 운영 가드레일 이해

### 5-1. 캐시 구조

캐시는 `메모리 + 파일` 2단 구조야.

- 메모리 캐시 우선
- 파일 캐시 fallback
- stale 데이터로 graceful fallback 가능

실제 캐시 위치는 아래와 같아.

- `data/cache/raw/company/*.json`
- `data/cache/raw/disclosures/*.json`
- `data/cache/raw/financials/*.json`
- `data/cache/raw/prices/all.json`
- `data/cache/view/stocks/*.json`
- `data/cache/view/market-summary.json`

TTL도 문서와 코드가 일치해.

- 회사 정보: 24시간
- 공시 목록: 2시간
- 재무 정보: 24시간
- 가격 정보: 5분
- 종목 스냅샷: 20분
- 시장 요약: 30분

### 5-2. 배치 갱신

배치 적재는 이미 운영 준비가 들어가 있어.

- 로컬 명령: `pnpm refresh-cache`
- 구현: `scripts/refresh-cache.ts`
- GitHub Actions: `.github/workflows/refresh-market-cache.yml`
- 스케줄: 30분마다
- 동작: 캐시 새로고침 후 `data/cache`를 커밋/푸시

즉, 이 프로젝트는 단순 실시간 fetch 실험이 아니라 `미리 적재된 캐시 파일`을 함께 운영하는 구조로 이해해야 해.

### 5-3. 공개 API 보호 장치

이번에 `memory.md` 최신 세션 업데이트와 실제 서버 코드를 같이 보고 확정한 내용이 있어.

- 공개 API에는 in-memory rate limit이 들어가 있음
- 기준은 `경로 + 클라이언트 식별자` 단위
- 현재 제한값은 `60회 / 60초`
- 초과 시 `429`와 `Retry-After`를 반환함

이건 데이터 구조 자체는 아니지만, 실제 운영 리서치에는 중요해. 지금 API는 아무 제한 없이 열려 있는 상태가 아니야.

### 5-4. debug 노출 범위

현재 `debug` 엔드포인트는 `DEV 전용`으로 보는 게 맞아.

- `process.env.NODE_ENV === 'development'`일 때만 허용
- 아닐 때는 `404`
- `AdminDebugPanel`도 메모리 기준 DEV 전용으로 정리돼 있음

그래서 예전처럼 "프로덕션에서도 `?admin=1`이면 볼 수 있다"라고 이해하면 지금 기준으로는 틀릴 가능성이 커.

### 5-5. KRX 연결 보안 제약

`src/server/krx.ts` 기준으로 KRX API URL은 `HTTPS만 허용`해. 이건 작은 구현 디테일 같지만, 환경변수 오설정이 있어도 비보안 endpoint로 내려가지 않게 막는 장치라서 리서치 문서에도 남길 가치가 있어.

## 6. 개인정보와 상태 저장 이해

현재 개인 상태 저장은 매우 제한적이야.

- 관심 종목만 `localStorage`에 저장
- key: `ant-gravity.watchlist`
- 타입: `string[]`
- 서버 DB 없음
- GPS/위치 정보 저장 없음
- 민감 개인정보 저장 없음

즉, 제품은 개인화된 느낌을 주지만 실제 저장은 브라우저 로컬 watchlist 정도로만 최소화돼 있어. 이건 AGENTS 규칙과 PRD가 일치하는 부분이야.

## 7. 문서 간 일치와 불일치

### 7-1. 현재 잘 맞는 부분

아래는 `memory.md`, `docs/PRD.md`, `spec/ui-routes.md`, 실제 코드가 대체로 잘 맞아.

- 스택: React + Vite + TypeScript
- 라우트: `/`, `/stock`, `/stock/:symbol`, `/emotion`, `/diary`, `/journal`
- 핵심 데이터 축: OpenDART
- 가격 축: KRX 준비 + Yahoo fallback
- 캐시: 메모리 + 파일
- 배치: `pnpm refresh-cache` + GitHub Actions
- 상태 저장: watchlist만 localStorage
- 민감 정보 비저장
- diary/journal은 아직 정적 UI 단계

### 7-2. 이번에 발견한 불일치

이번에 관련 문서를 읽으면서 아래 불일치를 확인했어.

1. `memory.md`에는 `docs/MASTER.md`, `docs/design-tokens.md`를 만든 것으로 적혀 있는데, 현재 워크스페이스에 실제로 존재하는 기준 디자인 문서는 `design/MASTER.md`, `design/design-tokens.md`야.
2. `memory.md`의 디자인 설명에는 `dashboard.png` 기준 표현이 남아 있지만, 현재 워크스페이스 상태에서는 `design/dashboard.png`가 삭제된 로컬 변경으로 잡혀 있어. 즉 지금 기준으로는 "반드시 repo 안에 존재하는 기준 이미지"라고 단정하면 안 돼.
3. `docs/개발일지/`, `docs/prompt/`는 현재 `.gitignore`에 들어가 있어서 기록은 남길 수 있지만 기본적으로 git 추적 대상은 아니야.

이 셋은 다음 세션에서도 혼동 포인트가 될 수 있어서 연구 메모로 남겨둘 필요가 있어.

## 8. 이번 이해를 바탕으로 `research.md`에 반영한 핵심

이번 업데이트에서는 아래를 명시적으로 반영했어.

- 현재 프로젝트를 "조사 단계"가 아니라 "구현된 데이터/운영 구조를 문서에 동기화해야 하는 단계"로 재정의
- OpenDART, KRX, Yahoo fallback의 역할 구분
- 캐시 위치, TTL, 배치 갱신 구조 재정리
- 클라이언트 fallback 동작 정리
- 공개 API rate limit, DEV 전용 debug, HTTPS-only KRX 제약 반영
- 디자인 기준 문서와 제품 톤을 데이터 리서치 문맥 안에서도 함께 연결
- 문서 경로/레퍼런스 이미지 관련 불일치 기록

## 9. 아직 확정되지 않은 것

이번 턴에서 문서와 코드만으로는 아래를 확정할 수 없었어.

- 운영 환경에서 KRX 키가 항상 주입되는지
- Yahoo fallback을 배포 환경에서 어디까지 허용할지
- in-memory rate limit만으로 실제 배포에 충분한지
- `data/cache/*`를 계속 추적할지, 생성 산출물로만 둘지
- `design/dashboard.png` 삭제가 의도된 것인지

## 10. 현재 기준 추천 문구

앞으로 다른 문서에서 지금 상태를 짧게 설명할 때는 아래 표현이 가장 안전해.

- "현재 데이터 파이프라인은 OpenDART 기반 공시/재무 해석을 중심으로 동작한다."
- "가격 데이터는 KRX OPEN API 연동을 우선으로 준비해두었고, 개발 환경에서는 Yahoo Finance 개인용 fallback이 사용될 수 있다."
- "시장 요약과 종목 스냅샷은 파일/메모리 캐시 및 배치 갱신 구조를 함께 사용한다."
- "공개 API에는 기본 rate limit이 적용돼 있고, debug 진단 경로는 현재 DEV 환경에서만 허용된다."
- "관심 종목 외 개인 데이터는 서버에 저장하지 않으며, GPS 같은 민감 정보는 저장 대상이 아니다."

## 11. 이번 업데이트로 해결된 것

- `memory.md`와 관련 문서를 읽고 현재 상태를 한 문서로 다시 묶었어.
- 제품/디자인/데이터/운영 제약을 따로따로 보지 않고 한 흐름으로 이해할 수 있게 정리했어.
- 문서에 남아 있던 경로 불일치와 운영 해석 차이를 드러냈어.

## 12. 이번 업데이트로 아직 안 끝난 것

- 외부 공급 정책의 최신성 검증은 별도 웹 확인이 필요해.
- 실제 운영 시크릿 주입 상태는 저장소 문서만으로 확정할 수 없어.
- 숫자 표기 완전 통일, 감정 페이지 실데이터 확장, diary/journal 저장 기능 여부는 여전히 다음 제품 결정 사항이야.
