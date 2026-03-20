# vercel-react-best-practices 기준 리렌더 및 조회 최적화 프롬프트 기록

- 작성시각: 2026-03-21 03:20:00 +09:00

## 해결하고자 한 문제

`vercel-react-best-practices` 스킬 기준으로 현재 React 코드에 바로 적용 가능한 성능 최적화를 반영하는 것.

## 사용한 프롬프트 요약

- `[$vercel-react-best-practices](C:\\Users\\khc\\.codex\\skills\\vercel-react-best-practices\\SKILL.md)`
- `저 규칙 기준으로 바로 반영`

## 해결된 것

- 반복 `find()`를 `Map` 기반 조회로 치환했음.
- 관심 종목 storage 접근을 캐시 유틸로 분리했음.
- 관련 테스트를 추가하고 lint/typecheck/test를 통과했음.

## 아직 안 된 것

- 데이터 fetch dedup이나 더 큰 범위의 렌더링 최적화는 이번 변경 범위에 포함하지 않았음.
