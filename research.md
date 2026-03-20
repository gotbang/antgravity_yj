# 실데이터 소스 조사

- 작성시각: 2026-03-20
- 기준 조건:
  - 공개 서비스
  - 무료만
  - Vercel Functions
  - 1분 폴링
  - 구현 시작 전 조사 문서 우선

## 1. 요구사항 요약

이 프로젝트는 `홈 / 종목 / 감정 / 일기 / 저널` 화면에 들어갈 실데이터 후보를 고르는 단계다.

필요 데이터는 크게 4개 층이다.

1. 시세/지수
  - 현재가
  - 등락률
  - 기간별 시세
  - 변동성 범위, 리스크 점수 계산용 입력
2. 공시/재무
  - 기업개황
  - 사업보고서 텍스트
  - 재무제표
  - 재무비율
3. 뉴스
  - 종목 관련 기사 제목
  - 링크
  - 발행 시각
  - 가능하면 요약
4. 감정/해석
  - 뉴스/공시 텍스트 기반 감정 점수
  - 공포/탐욕 비슷한 자체 해석 지표

현재 조건상 중요한 건 `무료냐`보다 `공개 서비스로 합법적이고 지속 가능하게 쓸 수 있냐`다.

## 2. 데이터 레이어별 요구사항

### 시세/지수

- 반드시 필요:
  - 국내 주식 현재가
  - KOSPI/KOSDAQ 계열 지수
- 대체 가능:
  - 실시간이 아니라 지연 시세
  - 당일 체결 대신 일별 종가
- 보류 가능:
  - 호가/체결/웹소켓

### 공시/재무

- 반드시 필요:
  - 기업개황
  - 재무제표
- 대체 가능:
  - 사업보고서 전체 본문 대신 주요 섹션
- 보류 가능:
  - 거버넌스/리스크 팩터의 고급 정규화

### 뉴스

- 반드시 필요:
  - 종목 관련 기사 목록
  - 제목, 링크, 시간
- 대체 가능:
  - 기사 원문 본문 없이 링크만 노출
- 보류 가능:
  - 전문 저장
  - 자체 요약 생성

### 감정/해석

- 반드시 필요:
  - 최소 1개 레이어를 이용한 점수화
- 대체 가능:
  - 뉴스 감정이 안 되면 공시 텍스트 기반 점수
- 보류 가능:
  - 멀티소스 결합 점수
  - 고급 LLM 요약

## 3. 후보 비교표

### 시세/지수 후보

| 후보 | 공식 링크 | 무료 여부 | 공개 서비스 적합성 | 한국 시장 지원 | Vercel Functions 적합성 | 데이터 범위 | 운영 리스크 | 최종 판정 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 한국투자증권 Open API | https://apiportal.koreainvestment.com/apiservice-apiservice | 무료 시작 가능 | 보류 | 국내주식 시세/호가/기간시세 제공 | 서버 프록시 전제면 가능 | 현재가, 체결, 호가, 기간시세 | 공개 서비스/제3자 서비스는 제휴/약관 확인이 더 필요 | 보류 |
| KRX OPEN API | https://openapi.krx.co.kr/contents/OPP/MAIN/main/index.cmd | 무료 | 조건부 가능 | KRX 지수/주식/증권상품 API 제공 | HTTP 호출 자체는 가능 | 지수, 주식, 증권상품 계열 | 승인 절차와 이용약관 확인 필요 | 유력 후보 |
| yfinance | https://ranaroussi.github.io/yfinance/index.html | 무료 라이브러리 | 부적합 | 한국 종목 티커 접근은 가능 | 기술적으로는 가능 | 시세, 일부 뉴스, 재무 | Yahoo 데이터는 personal use only | 배제 |
| Twelve Data 무료 플랜 | https://support.twelvedata.com/en/articles/5332349-commercial-and-personal-usage | 무료 플랜 존재 | 부적합 | 한국 거래소 메타데이터/일부 EOD 가능 | 기술적으로는 가능 | EOD/레퍼런스/일부 시세 | 무료 플랜은 개인 비상업용, 재배포 금지 | 배제 |

### 공시/재무 후보

| 후보 | 공식 링크 | 무료 여부 | 공개 서비스 적합성 | 한국 시장 지원 | Vercel Functions 적합성 | 데이터 범위 | 운영 리스크 | 최종 판정 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| OpenDART REST API | https://opendart.fss.or.kr/intro/main.do | 무료 | 적합 | 한국 상장사 공시/재무 지원 | 매우 좋음 | 기업개황, 공시검색, 재무제표 | 회사 코드 매핑과 후처리를 직접 해야 함 | 채택 |
| dartlab | https://github.com/eddmpython/dartlab | 오픈소스 | 조건부 | DART + EDGAR 지원 | 기본안과는 안 맞음 | 사업보고서 텍스트, 재무, 섹션 맵 | Python 런타임, 캐시/다운로드 구조 검증 필요 | 후속 후보 |
| dart-fss | https://pypi.org/project/dart-fss/ | 오픈소스 | 조건부 | OpenDART 기반 한국 공시 지원 | 기본안과는 안 맞음 | 공시/재무 래퍼 | Python 런타임 필요 | 후속 후보 |
| dart-api-client | https://pypi.org/project/dart-api-client/ | 오픈소스 | 조건부 | OpenDART 지원 | 기본안과는 안 맞음 | OpenDART 클라이언트 | Python 런타임 필요 | 후속 후보 |

### 뉴스 후보

| 후보 | 공식 링크 | 무료 여부 | 공개 서비스 적합성 | 한국 시장 지원 | Vercel Functions 적합성 | 데이터 범위 | 운영 리스크 | 최종 판정 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 네이버 검색 API(뉴스) | https://developers.naver.com/docs/serviceapi/search/news/news.md | 무료 | 보수적으로 보류 | 한국 뉴스 검색 강함 | 서버 프록시 전제면 가능 | 제목, 링크, 시간, 요약 일부 | 비상업/검색결과 재배포 제약을 보수적으로 해석해야 함 | 보류 |
| 무료 공개 RSS/언론 피드 | 매체별 상이 | 무료 | 매체별 상이 | 일부 가능 | 가능 | 제목, 링크, 시간 | 라이선스가 제각각, 통합 운영 난이도 큼 | 보조 후보 |

## 4. 제약/약관 리스크

### 무료와 공개 서비스는 다른 문제

- 무료여도 공개 서비스 운영 데이터 소스로 못 쓰는 경우가 많다.
- 무료여도 개인용/연구용/비상업용이면 공개 서비스에는 그대로 쓰면 안 된다.

### yfinance

- 공식 문서와 PyPI 설명 모두 `research and educational purposes`라고 안내한다.
- 공식 문구상 Yahoo Finance API는 `personal use only`다.
- 그래서 라이브러리 비용이 무료여도 공개 서비스 운영 데이터 소스로는 채택하면 안 된다.

근거:
- https://ranaroussi.github.io/yfinance/index.html
- https://pypi.org/project/yfinance/

### 한국투자증권 Open API

- 국내 주식 시세 기능은 강력하다.
- 하지만 공개 서비스용 주력 채택은 제휴/약관 검토가 더 필요하다.
- 개인용/내부용 수준인지, 제3자 서비스 표시가 허용되는지 확인 전에는 바로 채택하면 위험하다.

근거:
- https://apiportal.koreainvestment.com/apiservice-apiservice

### 네이버 검색 API

- 뉴스 검색 결과를 보여주는 기능 자체는 공식 제공된다.
- 다만 API 서비스 이용약관과 과거 공지 기준으로 `비상업적 목적`, `검색결과 노출 방식`, `API만으로 사이트 운영 금지` 같은 제약이 걸려 있었다.
- 최신 약관 개정 공지도 있어 보수적으로 해석해야 한다.
- 그래서 공개 서비스의 핵심 뉴스 레이어로 바로 채택하는 건 위험하다.

근거:
- https://developers.naver.com/docs/serviceapi/search/news/news.md
- https://developers.naver.com/products/terms
- https://developers.naver.com/notice/article/7722
- https://developers.naver.com/notice/article/21979

### Twelve Data 무료 플랜

- 무료 플랜이 있어도 `개인, 비상업, 재배포 금지` 조건이 붙는다.
- 공개 서비스에 그대로 노출하는 건 불가로 보는 게 안전하다.

근거:
- https://support.twelvedata.com/en/articles/5332349-commercial-and-personal-usage
- https://support.twelvedata.com/en/articles/12682324-end-of-day-eod-pricing-market-data

### OpenDART

- 금융감독원 공식 Open API다.
- 개인, 기업, 기관 등 누구나 활용 가능하다고 소개되어 있고, 공시검색/기업개황/재무제표 API가 공식으로 제공된다.
- 현재 제약에서 가장 설명 가능하고 안정적인 무료 공식 소스다.

근거:
- https://opendart.fss.or.kr/intro/main.do
- https://opendart.fss.or.kr/guide/detail.do?apiGrpCd=DS001&apiId=2019001
- https://opendart.fss.or.kr/guide/detail.do?apiGrpCd=DS001&apiId=2019002
- https://opendart.fss.or.kr/guide/detail.do?apiGrpCd=DS003&apiId=2019020

## 5. dartlab 전용 분석

### 기본 정보

- GitHub: https://github.com/eddmpython/dartlab
- 성격: Python 기반 공시/재무/사업보고서 분석 라이브러리
- 범위: DART + EDGAR 문서/섹션/재무 데이터 정규화

### 장점

- 사업보고서, 리스크 팩터, 거버넌스 같은 텍스트 섹션 추출에 강하다.
- 재무 숫자와 텍스트를 같은 회사 단위 맵으로 묶는다.
- 감정 분석, 요약, AI 컨텍스트 생성에 매우 유리하다.
- DART만이 아니라 EDGAR도 함께 다루는 구조라 확장성이 있다.

### 약점

- 실시간 시세/호가/체결 API가 아니다.
- Node 기반 Vercel Functions 기본안과 런타임이 다르다.
- README 기준 첫 사용 시 GitHub Releases에서 자동 다운로드하고 로컬 캐시를 사용하는 구조라 서버리스 환경에서 캐시 전략 검증이 필요하다.
- 즉, 지금 바로 프론트와 같은 런타임에 붙이기엔 무겁다.

### 최종 판정

- `dartlab`은 시세 소스가 아니다.
- `dartlab`은 공시 분석 파이프라인 후보다.
- 이번 2단계 실데이터 연결의 주력 소스로 바로 넣지 않는다.
- 대신 `2.5단계` 또는 후속 `배치/요약/공시 분석 워커` 후보로 둔다.

## 6. 추천 아키텍처

### 추천안 A: 현재 제약 유지

- 시세/지수:
  - 무료 공개 서비스 허용 소스가 확정되기 전까지 주력 연결 보류
  - 가능하면 KRX OPEN API에서 허용 범위가 명확한 지수/지연 데이터만 우선 검토
- 공시/재무:
  - OpenDART REST API 직접 호출 채택
- 뉴스:
  - 네이버 검색 API는 약관 리스크 때문에 바로 주력 채택하지 않음
  - 필요하면 링크형 최소 노출 또는 보류
- 감정:
  - 공시 텍스트 중심 자체 점수 계산
  - 뉴스는 허용 범위가 명확해지면 추가 결합
- dartlab:
  - 후속 고급 분석 레이어 후보로만 기록

### 추천안 B: 제약 완화 시

- 상용 시세/뉴스 벤더 도입
- Vercel Functions는 프록시/캐시 계층으로 사용
- dartlab 또는 별도 Python 워커를 붙여 공시 심층 분석, 리스크 요약, 텍스트 감정 해석 고도화

## 7. 결론

현재 조건에서 바로 구현 가능한 것:

- OpenDART 기반 공시/재무

현재 조건에서 바로 구현 보류할 것:

- 공개 서비스용 무료 시세 주력 소스
- 무료 뉴스 재배포

따라서 실제 구현 순서는 이렇게 가는 게 맞다.

1. `research.md` 승인
2. `design/` 스크린샷 기준 1:1 UI 재보정
3. OpenDART 우선 연결
4. 시세/뉴스는 소스 확정 후 추가

## 최종 판정 문구

### yfinance

- `yfinance`는 무료 라이브러리이지만, Yahoo Finance 데이터 사용은 personal/research 성격으로 안내되어 공개 서비스 운영 데이터 소스로는 채택하지 않는다.
- 따라서 `yfinance`는 비교표에는 포함하되, 최종 판정은 `배제`로 둔다.

### dartlab

- `dartlab`은 한국 상장사 공시와 재무 텍스트를 구조화하는 데 강한 Python 라이브러리다.
- 하지만 실시간 시세 소스가 아니고, Vercel Functions(Node) 기본 구조와 런타임이 다르다.
- 따라서 `dartlab`은 이번 단계의 실데이터 주력 소스가 아니라, 후속 공시 해석/감정/요약 파이프라인 후보로 분류한다.

## 8. memory.md 반영 메모

- 반영 시각: 2026-03-21
- 목적:
  - `memory.md`에 누적된 현재 프로젝트 상태를 실데이터 조사 문맥과 연결해 다음 판단의 기준점을 고정

### 현재 상태 요약

- 프로젝트는 `Ant Gravity MVP`이며 스택은 `React + Vite + TypeScript`다.
- 현재 주요 라우트는 `/`, `/stock`, `/stock/:symbol`, `/emotion`, `/diary`, `/journal`이다.
- 디자인 기준 문서는 `design/MASTER.md`, `design/design-tokens.md`, `design/design.md`이고, 실제 스타일 구조는 `src/styles/tokens.css`, `src/styles/app.css`, `src/index.css`로 분리된 상태다.
- 디자인 톤은 `귀엽고 둥근 개미 투자 도우미`, `모바일 우선`, `네이비 헤더 + 파스텔 카드`로 정리되어 있다.
- OpenDART는 이미 로컬 키 주입과 원격 응답 검증까지 끝났고, 현재 실데이터는 `공시/재무 중심`으로 연결되어 있다.
- 종목 리스트에서는 최근 공시일, 최근 공시명, 매출액 요약, 영업이익 요약, 부채비율 요약이 먼저 보이도록 바뀌었다.
- 반대로 `실시간 가격/시세`는 아직 미연동이며, 이 공백을 메울 가장 현실적인 공식 후보로 `KRX OPEN API`가 정리되어 있다.

### 이 조사 문서와 직접 연결되는 판단

- 이 프로젝트의 실데이터 우선순위는 이미 `공시/재무는 OpenDART`, `가격/시세는 별도 공식 소스 검토`로 정리되어 있다.
- 따라서 현재 `research.md`의 결론은 `memory.md`와 충돌하지 않고, 오히려 다음 단계 판단 기준으로 그대로 유지 가능하다.
- 특히 다음 작업은 아래 두 축으로 수렴한다.
  - `KRX OPEN API`를 실제 가격/등락률 소스로 붙일지 결정
  - `OpenDART 기반 실데이터 + 가격 미연동` 상태를 UI에서 더 명확하게 설명할지 UX 보정

### 해결된 것

- 현재 프로젝트가 어떤 데이터는 이미 실연동됐고 어떤 데이터는 아직 비어 있는지 경계가 명확해졌다.
- `research.md`의 기존 조사 결론이 낡은 정보가 아니라, 최신 작업 상태와 일치함을 확인했다.

### 아직 안 된 것

- `KRX OPEN API`를 실제로 붙일지에 대한 최종 결정은 아직 남아 있다.
- 가격 미연동 상태를 유지할지, 지연 시세라도 우선 붙일지 UX와 기술 양쪽에서 아직 결정되지 않았다.
