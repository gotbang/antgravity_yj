# Ant Gravity 데이터 리서치 및 현재 반영 상태

- 작성시각: 2026-03-21 03:35:00 +09:00
- 기준:
  - `memory.md`
  - 현재 `src/`, `api/`, `scripts/`, `.github/workflows/refresh-market-cache.yml`
- 목적:
  - 데이터 소스 조사 문서를 현재 구현 상태와 정확히 맞춘다.
  - 이미 반영된 내용과 아직 남은 리스크를 분리해서 기록한다.

## 1. 한 줄 결론

현재 소스코드는 `OpenDART 기반 공시/재무 + KRX 가격 연동 준비 + Yahoo Finance 개발용 fallback + 파일/메모리 캐시 + 배치 갱신` 구조로 정리돼 있어. 그래서 `research.md`는 더 이상 "무엇을 쓸지 검토 중" 문서만이 아니라 "지금 무엇을 실제로 쓰고 있고, 무엇은 아직 운영 기준이 아닌지"까지 명확히 적어야 맞아.

## 2. 현재 실제 구현된 데이터 아키텍처

### 2-1. 프론트엔드 소비 구조

- 홈 `/`
  - `GET /api/opendart/market-summary`
- 종목 목록 `/stock`
  - `GET /api/opendart/market-summary`
- 종목 상세 `/stock/:symbol`
  - `GET /api/opendart/stock?symbol=...`
- 감정 `/emotion`
  - `GET /api/opendart/market-summary`
- 개발용 캐시 패널
  - `GET /api/opendart/debug`

### 2-2. 서버 내부 합성 구조

종목 스냅샷은 아래 순서로 만들어져.

1. 종목 메타데이터 선택
2. OpenDART 기업 개황 조회
3. OpenDART 최근 공시 목록 조회
4. OpenDART 단일회사 주요계정 조회
5. 가격 맵 조회
   - 우선 KRX OPEN API
   - 키가 없고 fallback 플래그가 켜져 있으면 Yahoo Finance
6. 위 데이터를 합쳐 `StockPrediction` 생성
7. 여러 종목 스냅샷을 평균/집계해서 `MarketSummary` 생성

즉, 현재 핵심은 "LLM 예측"이 아니라 규칙 기반 계산이야. 확률, 리스크, 감정 지표는 공시 tone, 재무 값, 가격 유무를 바탕으로 계산된 파생 지표야.

## 3. 실제 사용 중인 데이터 소스

### 3-1. OpenDART

현재 구현에서 OpenDART는 실사용 중이야.

- 사용 API 성격
  - 기업 개황
  - 공시 목록
  - 단일회사 주요계정
- 소스 코드 위치
  - `src/server/opendart.ts`
- 사용 목적
  - 최신 공시일 / 공시명
  - 공시 tone 분석
  - 매출 / 영업이익 / 순이익 / 자본 / 부채 기반 계산

현재 프로젝트에서 가장 운영 기준에 가까운 공식 데이터 소스는 OpenDART야.

### 3-2. KRX OPEN API

현재 구현은 KRX를 "주 가격 공급원"으로 붙일 수 있게 준비돼 있어.

- 코드 위치
  - `src/server/krx.ts`
- 사용 조건
  - `KRX_OPEN_API_KEY` 또는 `KRX_API_KEY`가 있어야 함
- 현재 역할
  - 일별 가격 / 등락 / 등락률 공급
- 반영 방식
  - `getKrxStockPrices()`에서 여러 종목 가격 맵 생성

즉, 문서상 후보가 아니라 이미 코드 경로는 완성된 상태야. 다만 실제 운영 키 주입 여부는 환경에 달려 있어.

### 3-3. Yahoo Finance fallback

현재 구현은 Yahoo Finance fallback도 실제로 가지고 있어.

- 코드 위치
  - `src/server/krx.ts`
- 동작 조건
  - KRX 키가 없음
  - `YFINANCE_ENABLED=true` 또는 `YFINANCE_DEV_FALLBACK_ENABLED=true`
- 사용 방식
  - `query1.finance.yahoo.com` chart endpoint 호출
- source label
  - `Yahoo Finance 개인용 시세`

중요:

- 이 fallback은 현재 개발/보조 성격으로 보는 게 맞아.
- `memory.md`도 장기 목표를 KRX 운영 전환으로 적고 있어.
- 그래서 이 문서에서도 Yahoo를 "현재 존재하는 구현"으로는 기록하되 "최종 운영 기준"으로 적으면 안 돼.

## 4. 캐시와 배치 구조

### 4-1. 캐시 레이어

현재 캐시는 메모리 + 파일 캐시 2단 구조야.

- 코드 위치
  - `src/server/cache-store.ts`
- 특성
  - 메모리 캐시 우선
  - 파일 캐시 fallback
  - stale 파일/메모리 데이터로 graceful fallback 가능

### 4-2. 캐시 파일 위치

- `data/cache/raw/company/*.json`
- `data/cache/raw/disclosures/*.json`
- `data/cache/raw/financials/*.json`
- `data/cache/raw/prices/all.json`
- `data/cache/view/stocks/*.json`
- `data/cache/view/market-summary.json`

### 4-3. TTL

- 회사 정보: 24시간
- 공시 목록: 2시간
- 재무 정보: 24시간
- 가격 정보: 5분
- 종목 스냅샷: 20분
- 시장 요약: 30분

### 4-4. 배치 갱신

- 로컬 명령어
  - `pnpm refresh-cache`
- 스크립트
  - `scripts/refresh-cache.ts`
- GitHub Actions
  - `.github/workflows/refresh-market-cache.yml`

이제 `research.md`는 데이터 소스만이 아니라 이 캐시 구조까지 포함해야 현재 코드와 맞아.

## 5. 현재 UI에 실제 반영되는 데이터 범위

### 홈

- 상승/하락 확률
- 변동 범위
- 리스크 점수
- 관심 종목별 가격/확률/리스크
- 히스토리
- source label

### 종목 목록

- 최신 공시일
- 최신 공시명
- 매출 요약
- 영업이익 요약
- 부채비율 요약
- 가격 연결 여부

### 종목 상세

- 가격 요약
- 방향 예측
- 근거 3개
- 리스크 해석
- 참고 가이드
- 데이터 믹스
- 백테스트형 카드
- 히스토리

### 감정 페이지

- 시장 감정 제목/설명
- fear & greed
- 뉴스 긍부정 비율
- 키워드

주의:

- 감정 페이지의 투자 주체 카드 일부는 아직 정적 표현이야.
- diary/journal은 데이터 기반 기능이 아니라 UI 상태야.

## 6. 소스별 판단 정리

### OpenDART

- 상태: 채택 완료, 실사용 중
- 이유:
  - 공식
  - 무료
  - 현재 제품 목적과 직접 연결
  - 기업/공시/재무를 한 번에 가져올 수 있음

### KRX OPEN API

- 상태: 구현 완료, 운영 키 연동 대기 또는 환경 의존
- 이유:
  - 국내 주식 가격 데이터의 운영 기준 후보
  - 코드 경로가 이미 존재함

### Yahoo Finance

- 상태: fallback으로 구현됨
- 이유:
  - KRX 키 없을 때 개발 흐름 유지 가능
- 주의:
  - 운영 기준 메인 소스로 문서화하면 안 됨
  - `개인용 fallback` 문구를 유지하는 게 맞아

### 뉴스 외부 API

- 상태: 현재 미연동
- 이유:
  - 감정 페이지 요구는 존재하지만 실제 소스 연결은 아직 없음
  - 현재는 `MarketSummary` 내부 파생값/기본값으로 화면 구성

### dartlab / 기타 Python 계열 보조 도구

- 상태: 현재 소스에는 미연동
- 해석:
  - 과거 조사 후보로는 의미 있었지만, 현재 구현 기준 문서에서는 "참고 연구" 정도로만 남기는 게 맞아

## 7. `memory.md`와 현재 코드가 일치하는 부분

다음 내용은 `memory.md`와 실제 코드가 서로 맞아.

- 프로젝트 스택은 React + Vite + TypeScript
- 라우트는 `/`, `/stock`, `/stock/:symbol`, `/emotion`, `/diary`, `/journal`
- 스타일 구조는 `tokens.css`, `app.css`, `index.css`
- 공통 헤더는 `BrandHeader`
- 캐시 계층이 존재함
- `pnpm refresh-cache`가 존재함
- GitHub Actions로 캐시 갱신 워크플로가 존재함
- OpenDART + 가격 fallback 조합 구조가 존재함
- 관리자 캐시 패널이 존재함

## 8. 이전 리서치 문서에서 수정이 필요했던 지점

이번에 가장 크게 바로잡아야 했던 지점은 아래야.

### 8-1. "가격 소스는 아직 조사 단계"라고만 쓰면 불완전함

현재는 이미:

- KRX 연동 코드가 있음
- Yahoo fallback 코드가 있음
- 가격 source label도 UI로 전달됨

그래서 조사 단계만 적으면 현재 구현을 설명하지 못해.

### 8-2. "뉴스/감정은 향후 과제"라고만 쓰면 불완전함

현재 감정 페이지는 외부 뉴스 API가 아니라도 이미 돌아가고 있어. 다만 "실뉴스 연동"이 아닌 "시장 요약 파생 데이터 + 기본값" 기반이라는 점을 분리해서 적어야 맞아.

### 8-3. 캐시/배치 운영 지식이 빠져 있었음

현재 프로젝트는 단순 fetch MVP가 아니라:

- 파일 캐시
- TTL
- batch refresh
- debug panel

까지 포함하고 있어. 이건 연구 문서에 반드시 들어가야 해.

## 9. 아직 해결 안 된 것

### 운영 관점 미확정

- KRX 운영 키가 항상 있는 환경인지
- Yahoo fallback을 어디까지 허용할지
- 관리자 debug endpoint를 프로덕션에서도 제공할지

### 제품 관점 미완료

- 숫자 표기 완전 통일
- 감정 페이지 투자 주체 데이터 실연동
- diary/journal 실제 저장 기능
- 뉴스 원천 API 연동 여부 결정

## 10. 현재 기준 추천 문구

문서에서 앞으로는 아래 톤으로 적는 게 정확해.

- "현재 데이터 파이프라인은 OpenDART 기반 공시/재무를 중심으로 동작한다."
- "가격 데이터는 KRX OPEN API를 우선 사용하며, 개발 환경에서는 Yahoo Finance fallback이 동작할 수 있다."
- "감정 페이지는 현재 시장 요약 파생 데이터와 기본값 조합으로 구성돼 있으며, 외부 뉴스 API는 아직 직접 연동되지 않았다."
- "캐시 및 배치 갱신 구조가 이미 구현돼 있어 API 호출 실패 시 stale 데이터 fallback이 가능하다."

## 11. 이번 문서 업데이트로 해결된 것

- `memory.md`와 `research.md` 사이의 상태 차이를 줄였어.
- 실제 코드에 있는 KRX/Yahoo/cache/batch/debug 구조를 문서에 반영했어.
- 현재 구현된 것과 아직 운영 기준이 아닌 것을 분리해서 적었어.

## 12. 이번 문서 업데이트로 아직 안 끝난 것

- 외부 정책 문서 최신성 재검증은 이번 턴의 범위를 넘어서서 따로 브라우징 검증이 필요해.
- 실제 운영 환경 secret 주입 여부는 코드만으로 확정할 수 없어.
- 감정/다이어리/저널의 다음 제품 방향은 별도 기획 결정이 필요해.
