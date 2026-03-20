# Memory

## 프로젝트 상태

- 프로젝트명: Ant Gravity MVP
- 현재 스택: React + Vite + TypeScript
- 현재 구현 라우트:
  - `/`
  - `/stock`
  - `/stock/:symbol`
  - `/emotion`
  - `/diary`
  - `/journal`

## 현재 디자인 상태

- 디자인 기준은 `design/MASTER.md`, `design/design-tokens.md`, `design/` 폴더의 레퍼런스 이미지, 그리고 실제 구현된 공통 헤더/카드 톤이다.
- 전체 화면 톤은 `dashboard.png` 기준의 `네이비 헤더 + 원형 개미 캐릭터 + 파스텔 카드 + 둥근 굵은 폰트` 방향으로 정리됨.
- 스타일 구조는 이제 아래처럼 분리됨:
  - `src/styles/tokens.css`: 토큰 정의
  - `src/styles/app.css`: 실제 컴포넌트/레이아웃 스타일
  - `src/index.css`: import 진입점만 담당
- 헤더 개미 캐릭터는 이제 `design/ant.png` 실제 이미지 자산을 사용함.
- 공통 헤더는 `src/components/BrandHeader.tsx` 기준으로 모든 주요 페이지에 반복 적용됨.
- 홈의 `오늘 판단`, `종목 분석`, `개미의 일기`는 `src/components/BrandIllustrations.tsx`의 일러스트형 SVG 아이콘을 사용함.
- 폰트는 `GmarketSans`를 우선 적용해둔 상태임.
- 디자인 시스템 프리뷰 페이지가 있음:
  - `public/design-system-preview.html`
- 브라우저에서 프리뷰 확인 시:
  - `http://localhost:5174/design-system-preview.html`

## 현재 데이터 상태

- OpenDART 키는 로컬에만 주입된 상태임.
  - `.env.local`
- 키 값 자체는 문서나 답변에 기록하지 말 것.
- OpenDART 원격 응답은 이미 검증됨.
  - 회사 정보 API 정상 응답 확인
  - 공시 목록 API 정상 응답 확인
- 현재 실데이터는 `OpenDART 공시/재무 + Yahoo Finance 개인용 시세` 조합이다.
- 종목 리스트는 이제 아래 실제 OpenDART 기반 정보가 먼저 보이도록 바뀜:
  - 최근 공시일
  - 최근 공시명
  - 매출액 요약
  - 영업이익 요약
  - 부채비율 요약
- 가격/시세는 현재 `YFINANCE_ENABLED=true`일 때 Yahoo Finance 개인용 시세를 사용함.
- KRX OPEN API 키가 발급되면 `KRX_OPEN_API_KEY` 기준으로 자연스럽게 교체되도록 구현됨.
- 중요한 제약:
  - `OpenDART`는 공시/재무 API라 가격을 주지 않음.
  - 현재 가격은 개인용 배포 전제의 Yahoo fallback이다.
  - `yfinance/Yahoo Finance`는 공식 문구상 `personal use only`라서 더 넓은 공개 서비스에는 그대로 쓰면 안 됨.
  - 장기적으로는 `KRX OPEN API`로 넘어가는 것이 목표다.

## 현재 캐시/적재 상태

- 캐시 계층이 추가됨:
  - `src/server/cache-store.ts`
- 실제 캐시 파일 위치:
  - `data/cache/raw/company/*.json`
  - `data/cache/raw/disclosures/*.json`
  - `data/cache/raw/financials/*.json`
  - `data/cache/raw/prices/all.json`
  - `data/cache/view/stocks/*.json`
  - `data/cache/view/market-summary.json`
- TTL은 현재 아래처럼 설정되어 있음:
  - 회사 정보: 24시간
  - 공시 목록: 2시간
  - 재무 정보: 24시간
  - 가격: 5분
  - 종목 스냅샷: 20분
  - 마켓 서머리: 30분
- 배치 적재 스크립트:
  - `pnpm refresh-cache`
  - 구현 위치: `scripts/refresh-cache.ts`
- 주기 적재 GitHub Actions:
  - `.github/workflows/refresh-market-cache.yml`
  - 30분마다 실행되도록 설정됨
  - repo secret으로 `OPENDART_API_KEY` 또는 `DART_API_KEY` 필요
- 관리자용 캐시 디버그 패널이 추가됨:
  - `src/components/AdminDebugPanel.tsx`
  - dev 환경에서 바로 보임
  - 또는 URL에 `?admin=1` 붙여서 확인 가능
  - hit/miss/writes/fallbacks, 마지막 갱신시각, 캐시 파일 목록을 보여줌

## 현재 숫자 표기 상태

- 큰 금액은 `333조 6059억` 같은 형식으로 포맷하는 공통 유틸이 추가됨:
  - `src/lib/format.ts`
- 서버 실데이터 응답의 매출액/영업이익/가격 표시와 샘플 데이터 일부가 이 포맷을 사용함.
- 아직 모든 숫자가 완전히 이 형식으로 통일된 것은 아니고, 다음 세션에서 남은 정적 값/설명 문구를 더 정리할 여지가 있음.

## 현재 구현 방향

- 홈은 원본 정보 구조 기준으로 복구된 상태:
  - `오늘의 주식 시장 방향`
  - `내 관심종목`
  - `모델 신뢰도`
  - `예측 히스토리`
- 홈의 `오늘의 주식 시장 방향` 문구는 이제 `AI 개미의 예측`이 아니라 `실데이터 기반 방향 추정`으로 정리됨.
- 이 값은 학습형 AI 모델 예측이 아니라, 종목별 실데이터 기반 규칙 계산 결과를 평균낸 방향 추정에 가까움.
- 메인 네비게이션에서 `개미의 일기`는 현재 `/emotion` 흐름으로 연결됨.
- 종목 상세는 아래 섹션까지 확장 완료:
  - 판단 근거
  - 리스크 평가
  - 참고 전략 가이드
  - 데이터 믹스
  - AI 예측 따랐다면?
- `/diary`, `/journal`은 구현되어 있지만 메인 흐름보다 보조 흐름에 가까움.

## 주요 파일

- 앱 엔트리:
  - `src/App.tsx`
  - `src/main.tsx`
  - `src/components/AppShell.tsx`
- 페이지:
  - `src/pages/HomePage.tsx`
  - `src/pages/StockPage.tsx`
  - `src/pages/EmotionPage.tsx`
  - `src/pages/DiaryPage.tsx`
  - `src/pages/JournalPage.tsx`
- 종목 리스트:
  - `src/components/StockListItem.tsx`
- 상태:
  - `src/context/WatchlistProvider.tsx`
  - `src/context/WatchlistStore.ts`
  - `src/context/useWatchlist.ts`
- 실데이터:
  - `src/lib/live-data.ts`
  - `src/lib/format.ts`
  - `src/lib/market.ts`
  - `src/server/cache-store.ts`
  - `src/server/krx.ts`
  - `src/server/opendart.ts`
  - `scripts/refresh-cache.ts`
  - `api/opendart/market-summary.ts`
  - `api/opendart/stock.ts`
- 스타일:
  - `src/styles/tokens.css`
  - `src/styles/app.css`
  - `src/index.css`
- 공통 UI:
  - `src/components/BrandHeader.tsx`
  - `src/components/BrandIllustrations.tsx`
  - `src/components/AdminDebugPanel.tsx`
- 디자인 문서:
  - `design/MASTER.md`
  - `design/design-tokens.md`
- 디자인 자산:
  - `design/ant.png`
- 프리뷰:
  - `public/design-system-preview.html`
- GitHub Actions:
  - `.github/workflows/refresh-market-cache.yml`

## 이번 세션까지 누적해서 한 일

- Figma/figma.site 기반으로 정보 구조를 다시 비교하고 홈/종목/감정 흐름을 정리했음.
- 홈을 원본 정보 구조 기준으로 복구했음.
- 종목 상세 누락 섹션을 확장했음.
- API 키가 없어도 샘플 데이터가 먼저 보이도록 fallback 구조를 만들었음.
- OpenDART 키를 로컬에만 주입하고 실제 원격 응답을 검증했음.
- 첨부 이미지와 `design/` 스크린샷 기준으로 캐릭터 톤, 파스텔 카드, 둥근 타이포 분위기를 강화했음.
- `design-sample-master` 흐름으로 아래 문서를 만들었음:
  - `docs/MASTER.md`
  - `docs/design-tokens.md`
- `src/index.css`를 토큰 구조로 재정리하고, 이후 `tokens.css + app.css` 구조로 분리했음.
- 공통 컴포넌트 스타일에서 리터럴 색상 대부분을 토큰 참조로 치환했음.
- 디자인 시스템 미리보기 페이지를 만들었음.
- `design/ant.png` 실제 이미지를 공통 헤더 개미 캐릭터로 연결했음.
- `GmarketSans`를 적용했음.
- OpenDART + Yahoo Finance 개인용 시세가 실제로 들어오도록 dev 서버 env 로딩과 Yahoo 시세 파서를 고쳤음.
- `data/cache` 기반 raw/view 캐시 계층을 만들고, `getStockSnapshot/getMarketSummary`를 캐시 우선 구조로 리팩토링했음.
- `pnpm refresh-cache` 배치 적재 스크립트를 추가했고, GitHub Actions 주기 적재 워크플로우까지 만들었음.
- 관리자용 캐시 디버그 패널을 추가했음.
- 숫자 공통 포맷 유틸을 추가해 큰 금액을 `조/억` 형식으로 표시하기 시작했음.
- 최근 커밋:
  - `76a6565 feat: refresh dashboard brand and enable personal market data fallback`
  - `6ea72ec feat: add market cache pipeline and admin debug panel`

## 문서 작성 상태

- 핵심 문서:
  - `docs/PRD.md`
  - `spec/ui-routes.md`
  - `research.md`
  - `design/MASTER.md`
  - `design/design-tokens.md`
- 이번 세션까지 작성된 추가 개발일지와 프롬프트 기록도 `docs/개발일지`, `docs/prompt`에 누적되어 있음.
- 특히 이번 세션 핵심 기록:
  - `2026-03-20-홈-원복-네비게이션-정리-상세-콘텐츠-확장`
  - `2026-03-20-opendart-로컬-키-주입-및-실응답-검증`
  - `2026-03-20-design-md-기준-화면-디자인-정렬`
  - `2026-03-20-디자인-미세-보정-홈-stock-diary-journal`
  - `2026-03-21-캐릭터-톤-강화-및-stock-실데이터-정리`
  - `2026-03-21-index-css-토큰화-및-디자인-프리뷰-생성`
  - `2026-03-21-index-css-리터럴-제거-및-전체-톤-통일`
  - `2026-03-21-tokens-css-app-css-분리-및-톤-마감`
  - `2026-03-21-krx-시세-연동-준비-및-공통-브랜드-헤더-적용`
  - `2026-03-21-헤더-캐릭터-및-홈-바로가기-아이콘-실화면-보정`
  - `2026-03-21-dashboard-기준-헤더-캐릭터-및-공통-스타일-업그레이드`
  - `2026-03-21-yahoo-개발용-임시-시세-fallback-추가`

## 검증 상태

- 최근 검증 통과:
  - `pnpm refresh-cache`
  - `pnpm test`
  - `pnpm typecheck`
  - `pnpm lint`
  - `pnpm build`
- 참고:
- Playwright 브라우저 자동 캡처는 이 환경에서 Chrome 실행 이슈로 계속 막혔음.
- 대신 로컬 서버 응답 `200`, OpenDART 실응답, Yahoo 개인용 시세 응답, batch cache 생성까지 확인했음.

## 다음 세션에서 바로 할 일

1. 아직 남아 있는 정적 숫자/설명 값도 `조/억` 공통 포맷으로 더 통일할지 점검
2. 관리자용 캐시 디버그 패널 UI를 더 보기 좋게 다듬을지 결정
3. GitHub repo secrets에 `OPENDART_API_KEY`를 넣고 Actions를 실제로 한 번 돌려볼지 확인
4. KRX OPEN API 키가 나오면 Yahoo 개인용 fallback에서 KRX 정식 시세로 전환
5. 필요하면 `today direction` 계산 로직을 더 명확한 규칙 또는 별도 모델로 고도화
6. `design-system-preview.html`이 실제 `src/styles/tokens.css`를 직접 읽도록 연결할지 검토

## 참고/주의사항

- 민감한 키 값은 문서나 답변에 그대로 적지 말 것.
- `.env.local`은 로컬 전용이다.
- 사용자 말투 규칙:
  - 한글
  - 반말
  - 이모티콘 금지
- 컴포넌트 파일명 PascalCase 유지
- TDD 흐름 유지
- 현재 우선순위는 `캐시/배치 적재 운영 안정화`, `숫자 포맷 완전 통일`, `KRX 정식 전환 준비`다.
## 2026-03-21 Session Update

- React optimization work completed:
  - watchlist storage split into `src/context/watchlist-storage.ts`
  - repeated stock lookup in `HomePage.tsx` and `StockPage.tsx` changed from repeated `find()` calls to `Map` lookup
  - cross-tab watchlist sync fixed in `WatchlistProvider.tsx`
  - tests added:
    - `src/context/watchlist-storage.test.ts`
    - `src/context/WatchlistProvider.test.tsx`

- Security hardening work completed:
  - new shared helper: `src/server/request-security.ts`
  - rate limit added to public market endpoints
    - `src/server/opendart.ts`
    - `api/opendart/market-summary.ts`
    - `api/opendart/stock.ts`
  - `/debug` endpoint restricted to development mode
  - `AdminDebugPanel.tsx` changed to DEV-only and masked error text
  - server error responses now use generalized client-safe messages
  - `src/server/krx.ts` now enforces HTTPS-only KRX endpoint configuration
  - security tests expanded in `src/server/opendart.test.ts`

- Verification completed in this session:
  - `pnpm test -- --run`
  - `pnpm typecheck`
  - `pnpm lint`
  - all passing at end of session

- Important current files to inspect first in next session:
  - `src/server/opendart.ts`
  - `src/server/request-security.ts`
  - `src/server/krx.ts`
  - `src/context/WatchlistProvider.tsx`
  - `src/context/watchlist-storage.ts`
  - `src/server/opendart.test.ts`

- Recommended next steps:
  1. decide whether generated `data/cache/*` files should stay tracked or be excluded from normal feature commits
  2. review whether in-memory rate limiting is enough for deployment, or needs shared/external storage
  3. if `/debug` is needed outside DEV, split it into an authenticated admin-only route
## 2026-03-21 Handoff Update

- latest pushed commits
  - `424f65e feat: sync project docs and harden market endpoints`
  - `4be31f4 chore: stop tracking prompt and dev journals`
  - `ebcc4e1 chore: remove tracked codex assets`

- pushed remote
  - `origin = https://github.com/gotbang/antgravity_yj.git`
  - pushed branch: `main`

- completed in recent sessions
  - project docs synced to current code
    - `docs/PRD.md`
    - `research.md`
    - `spec/ui-routes.md`
  - React optimization applied
    - `src/context/watchlist-storage.ts` added
    - `src/context/WatchlistProvider.tsx` cross-tab sync fixed
    - `src/pages/HomePage.tsx` and `src/pages/StockPage.tsx` switched repeated lookups to `Map`
    - tests added:
      - `src/context/watchlist-storage.test.ts`
      - `src/context/WatchlistProvider.test.tsx`
  - security hardening applied
    - `src/server/request-security.ts` added
    - public market endpoints now have in-memory rate limiting
    - `/debug` endpoint restricted to development mode
    - `src/components/AdminDebugPanel.tsx` changed to DEV-only
    - API/server responses no longer expose raw internal error messages
    - `src/server/krx.ts` now enforces HTTPS KRX endpoint config
    - security tests expanded in `src/server/opendart.test.ts`
  - repository hygiene changes
    - `docs/개발일지/`, `docs/prompt/` removed from git tracking and ignored
    - `.codex/` removed from git tracking and ignored

- validation completed before latest commit
  - `pnpm test -- --run`
  - `pnpm typecheck`
  - `pnpm lint`
  - all passing

- intentionally not pushed / still local only
  - generated cache changes under `data/cache/*`
  - deleted local file: `design/dashboard.png`

- current local working tree still has
  - modified:
    - `data/cache/raw/prices/all.json`
    - `data/cache/view/market-summary.json`
    - `data/cache/view/stocks/000660.json`
    - `data/cache/view/stocks/005380.json`
    - `data/cache/view/stocks/005930.json`
    - `data/cache/view/stocks/035420.json`
    - `data/cache/view/stocks/035720.json`
  - deleted:
    - `design/dashboard.png`

- recommended first checks in next session
  1. decide whether `data/cache/*` should be discarded, refreshed, or committed separately
  2. confirm whether `design/dashboard.png` deletion was intentional
  3. if more deployment hardening is needed, review `src/server/opendart.ts`, `src/server/request-security.ts`, `src/server/krx.ts`
