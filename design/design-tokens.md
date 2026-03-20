# Ant Gravity Design Tokens

## 입력 이해

- 기준 레퍼런스: 업로드한 홈 대시보드 이미지
- 플랫폼: mobile-first web
- 목표: `shadcn/ui` 호환 토큰으로 일반화 가능한 디자인 규칙 정의

## 컬러 토큰

### Light

```css
:root {
  --background: 0 0% 98%;
  --foreground: 222 32% 10%;
  --card: 0 0% 100%;
  --card-foreground: 222 32% 10%;
  --popover: 0 0% 100%;
  --popover-foreground: 222 32% 10%;
  --primary: 225 43% 23%;
  --primary-foreground: 0 0% 100%;
  --secondary: 206 100% 90%;
  --secondary-foreground: 222 32% 10%;
  --muted: 225 38% 96%;
  --muted-foreground: 220 12% 45%;
  --accent: 49 100% 77%;
  --accent-foreground: 222 32% 10%;
  --destructive: 353 86% 73%;
  --destructive-foreground: 0 0% 100%;
  --border: 220 33% 91%;
  --input: 206 100% 84%;
  --ring: 205 82% 73%;
  --radius: 1.5rem;
}
```

### Dark

```css
.dark {
  --background: 226 28% 12%;
  --foreground: 210 40% 98%;
  --card: 226 24% 16%;
  --card-foreground: 210 40% 98%;
  --popover: 226 24% 16%;
  --popover-foreground: 210 40% 98%;
  --primary: 210 100% 88%;
  --primary-foreground: 225 43% 23%;
  --secondary: 226 18% 22%;
  --secondary-foreground: 210 40% 98%;
  --muted: 226 18% 20%;
  --muted-foreground: 220 16% 72%;
  --accent: 49 100% 72%;
  --accent-foreground: 225 43% 23%;
  --destructive: 353 82% 67%;
  --destructive-foreground: 0 0% 100%;
  --border: 226 18% 24%;
  --input: 226 18% 24%;
  --ring: 205 82% 73%;
}
```

## 보조 팔레트

- `sky-surface`: `#CDEBFF`
- `yellow-surface`: `#FFE68A`
- `pink-surface`: `#FFC7D7`
- `mint-surface`: `#CFF5D9`
- `lavender-surface`: `#E8E2FF`
- `header-navy-deep`: `#1D2747`
- `header-navy-top`: `#24345F`
- `mascot-sky`: `#C9DFFF`
- `icon-ink-soft`: `#42517A`
- `danger-soft`: `#F28B8B`
- `ink`: `#111827`
- `muted-ink`: `#6B7280`

## 타이포그래피 스케일

- `display`: 40/44, weight 900
- `hero-title`: 32/36, weight 900
- `section-title`: 24/28, weight 900
- `card-title`: 20/24, weight 800
- `body`: 16/24, weight 500
- `body-small`: 14/20, weight 500
- `label`: 13/18, weight 700
- `micro`: 12/16, weight 700

## 권장 폰트 무드

- 헤드라인: 둥글고 굵은 산세리프
- 본문: 고가독성 산세리프
- 실제 적용 우선순위:
  - `Arial Rounded MT Bold`
  - `SUIT`
  - `Pretendard`
  - 시스템 산세리프

## 간격 스케일

- `4, 8, 12, 16, 20, 24, 32`
- 카드 내부 기본 패딩은 `16~20`
- 섹션 간 여백은 `20~24`
- 헤더와 첫 카드 사이 여백은 `16`
- 브랜드 헤더 내부 요소 간격은 `16`

## 라운드 스케일

- `sm`: `12px`
- `md`: `18px`
- `lg`: `24px`
- `xl`: `28px`
- `hero`: `30px`
- `card-xl`: `26px`
- `pill`: `999px`

## 그림자 스케일

- `card`: `0 10px 22px rgba(136, 148, 188, 0.14)`
- `hero`: `0 16px 28px rgba(57, 71, 112, 0.24)`
- `fab`: `0 18px 28px rgba(140, 118, 204, 0.24)`
- `icon-soft`: `0 8px 18px rgba(79, 105, 160, 0.12)`

## 컴포넌트 치수 힌트

- 브랜드 헤더 마스코트 원형 배지: `62x62`
- 홈 바로가기 카드 아이콘 박스: `64x64`
- 홈 바로가기 카드 최소 높이: `116`

## 브레이크포인트 전략

- 기본: `390px` 모바일 기준
- `<= 420px`: 모바일 단일 기준 유지
- 태블릿 이상 확장은 후순위
- 우선순위는 항상 모바일 1:1 체감

## 터치 규칙

- 모든 인터랙션 요소 최소 `44x44`
- 카드 전체 탭 가능
- 탭과 칩도 손가락 중심 크기 유지

## 통과한 체크

- `primary`와 `primary-foreground` 대비는 강함
- 파스텔 배경 위 본문은 검정 계열이라 가독성 확보 가능
- border/input/ring 토큰이 시각적으로 분리됨
- spacing scale이 4px 기반으로 일관됨
- dark 토큰이 존재함

## 주의할 이슈

- 파스텔 핑크 배경 위 중간 회색 텍스트는 너무 흐려지지 않게 유지해야 함
- 카드가 많아질수록 shadow를 더 세게 키우지 말아야 함
- 캐릭터 사용량이 과해지면 금융 정보 전달력이 약해질 수 있음
- 홈 3개 진입 카드 아이콘은 이모지보다 일러스트형으로 유지해야 톤이 덜 흔들림

## 리스크

- 실제 둥근 한글 폰트 에셋이 없으면 시스템 폰트 대체 느낌이 날 수 있음
- reference가 한 장이라 다른 화면에서 과한 해석이 들어갈 수 있음

## 추천 편집

- 헤드라인 weight는 항상 800 이상 유지
- 본문 글줄 길이는 짧게
- 숫자 카드 안 단위 텍스트는 한 단계 작게
- 리스트 카드에는 실제 데이터와 감성 문구를 섞지 말고 역할을 분리
- 개미 캐릭터는 원형 프로필 일러스트처럼 쓰고, 몸 전체 캐릭터를 반복 배치하지 않기
- 홈 진입 카드 3개는 색상과 아이콘 역할을 고정해서 브랜드 학습 비용을 낮추기

## 최종 상태

- `pass with fixes`
- 방향성과 토큰 체계는 충분히 usable하고, 실제 구현 단계에서 폰트 에셋 확보와 다크 모드 운영 규칙만 추가되면 더 안정적이다.
