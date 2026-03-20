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

- 디자인 기준은 `design/MASTER.md`, `design/design-tokens.md`, `design/design.md`, 그리고 `design/` 폴더 스크린샷이다.
- 전체 화면 톤은 `귀엽고 둥근 개미 투자 도우미`, `모바일 우선`, `네이비 헤더 + 파스텔 카드` 방향으로 정리됨.
- 스타일 구조는 이제 아래처럼 분리됨:
  - `src/styles/tokens.css`: 토큰 정의
  - `src/styles/app.css`: 실제 컴포넌트/레이아웃 스타일
  - `src/index.css`: import 진입점만 담당
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
- 현재 실데이터는 `공시/재무 중심`이다.
- 종목 리스트는 이제 아래 실제 OpenDART 기반 정보가 먼저 보이도록 바뀜:
  - 최근 공시일
  - 최근 공시명
  - 매출액 요약
  - 영업이익 요약
  - 부채비율 요약
- 여전히 `실시간 가격/시세`는 미연동 상태다.
- 중요한 제약:
  - `OpenDART`는 공시/재무 API라 실시간 가격을 주지 않음.
  - 가격/시세를 붙이려면 별도 공식 시세 소스가 필요함.
  - 현재 가장 현실적인 공식 후보는 `KRX OPEN API`

## 현재 구현 방향

- 홈은 원본 정보 구조 기준으로 복구된 상태:
  - `오늘의 주식 시장 방향`
  - `내 관심종목`
  - `모델 신뢰도`
  - `예측 히스토리`
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
  - `src/lib/market.ts`
  - `src/server/opendart.ts`
  - `api/opendart/market-summary.ts`
  - `api/opendart/stock.ts`
- 스타일:
  - `src/styles/tokens.css`
  - `src/styles/app.css`
  - `src/index.css`
- 디자인 문서:
  - `design/MASTER.md`
  - `design/design-tokens.md`
  - `design/design.md`
- 프리뷰:
  - `public/design-system-preview.html`

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

## 문서 작성 상태

- 핵심 문서:
  - `docs/PRD.md`
  - `spec/ui-routes.md`
  - `research.md`
  - `design/MASTER.md`
  - `design/design-tokens.md`
  - `design/design.md`
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

## 검증 상태

- 최근 검증 통과:
  - `pnpm test -- --run`
  - `pnpm typecheck`
  - `pnpm lint`
- 참고:
  - `pnpm build`는 최근 세션들에서는 재실행 기록이 없음.
- Playwright 브라우저 자동 캡처는 이 환경에서 Chrome 실행 이슈로 계속 막혔음.
- 대신 로컬 서버 응답 `200`과 원격 OpenDART 응답은 확인했음.

## 다음 세션에서 바로 할 일

1. `KRX OPEN API` 같은 공식 시세 소스를 붙여서 종목분석에 실제 가격/등락률/시세를 연결할지 결정
2. 현재 `OpenDART 기반 실제 데이터 + 가격 미연동` 문구를 유지할지, 더 명확히 분리할지 UX 보정
3. `design-system-preview.html`이 실제 `src/styles/tokens.css`를 직접 읽도록 연결할지 검토
4. 필요하면 스타일을 페이지 단위로 더 세분화 (`home.css`, `stock.css` 등)
5. `/emotion`을 최종적으로 현재 유지할지, diary/journal 흐름 쪽으로 더 강하게 재편할지 결정
6. 가능하면 `pnpm build`까지 다시 검증

## 참고/주의사항

- 민감한 키 값은 문서나 답변에 그대로 적지 말 것.
- `.env.local`은 로컬 전용이다.
- 사용자 말투 규칙:
  - 한글
  - 반말
  - 이모티콘 금지
- 컴포넌트 파일명 PascalCase 유지
- TDD 흐름 유지
- 현재 우선순위는 `실제 가격/시세 소스 확정`과 `디자인 시스템 유지보수성 강화`다.
