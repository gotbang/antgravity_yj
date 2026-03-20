# memory 기준 문서 동기화 및 research 업데이트

- 작성시각: 2026-03-21 03:35:00 +09:00
- 해결하고자 한 문제: `memory.md`에는 현재 구현 상태가 비교적 자세히 정리돼 있었는데, `docs/PRD.md`, `spec/ui-routes.md`, `research.md`는 일부가 예전 조사/초기 기획 상태에 머물러 있어서 실제 소스와 문서가 어긋나고 있었음.

## 진행 내용

- `memory.md`를 기준으로 현재 프로젝트의 라우트, 데이터 소스, 캐시, 배치 구조를 다시 읽었음.
- 실제 구현 파일(`src/App.tsx`, 각 page 컴포넌트, `src/lib/live-data.ts`, `src/server/opendart.ts`, `src/server/krx.ts`, `src/server/cache-store.ts`, `scripts/refresh-cache.ts`)을 기준으로 문서 사실관계를 재확인했음.
- `docs/PRD.md`를 현재 MVP 범위 기준으로 다시 정리했음.
- `spec/ui-routes.md`를 현재 라우트/상태/API 계약 기준으로 다시 정리했음.
- `research.md`를 "조사 후보 문서"에서 "현재 구현 반영 + 남은 리스크 문서" 성격으로 업데이트했음.
- 이번 작업 자체도 규칙에 맞춰 개발일지와 프롬프트 기록 대상으로 남김.

## 해결된 것

- `memory.md`와 주요 문서 간 드리프트를 줄였음.
- 현재 코드에 이미 존재하는 OpenDART, KRX 준비, Yahoo fallback, 캐시, 배치, 디버그 패널 구조를 문서에 반영했음.
- `/diary`, `/journal`이 현재는 정적 UI 단계라는 점을 문서에 분리해서 적었음.
- 프로덕션에서 `debug` 엔드포인트가 보장되지 않는 현재 상태를 문서에 명시했음.

## 아직 안 된 것

- 실제 운영 환경에 KRX/OpenDART secret이 어떻게 주입되는지는 코드만으로 확정할 수 없음.
- 외부 데이터 공급 정책의 최신성은 별도 웹 검증이 필요함.
- 숫자 표기 통일, 감정 데이터 실연동, diary/journal 저장 기능은 문서화만 되었고 구현은 아직 남아 있음.
