# Yahoo 개인용 시세 fallback 추가

- 작성시각: 2026-03-21 01:50:00 +09:00
- 해결하고자 한 문제: KRX OPEN API 키가 아직 발급 전이라 개인용 배포/로컬 환경에서 시세가 보이지 않았고, 키가 나오기 전까지 개인용 전제의 대체 시세 소스가 필요했음.

## 진행 내용

- `src/server/krx.ts`에 `YFINANCE_ENABLED=true` 또는 `YFINANCE_DEV_FALLBACK_ENABLED=true`일 때 Yahoo Finance 시세를 읽는 fallback을 추가함.
- 개인용 배포 전제를 명시하고, 소스 라벨도 `Yahoo Finance 개인용 시세`로 정리함.
- `src/server/opendart.test.ts`에 `KRX 없음 + 개발용 fallback 켜짐` 시나리오 테스트를 추가함.
- `.env.local`에 개인용 fallback 플래그를 추가해서 로컬과 개인 배포 환경에서 바로 시세가 보이게 맞춤.

## 해결된 것

- KRX 키가 없어도 개인용 배포/로컬 환경에서는 Yahoo 시세가 화면에 노출됨.
- 공시/재무 데이터는 기존 OpenDART 실데이터 흐름을 그대로 유지함.
- `pnpm test`, `pnpm typecheck`, `pnpm lint`를 통과함.

## 아직 안 된 것

- Yahoo Finance 데이터는 공식 문구상 `personal use only`라서 개인용 범위를 넘는 운영에는 쓰면 안 됨.
- KRX 키가 발급되면 정식 시세 소스로 바로 교체하는 게 더 안전함.
- 뉴스나 추가 시장 데이터 같은 다른 레이어의 실데이터 고도화는 아직 별도 작업이 필요함.
