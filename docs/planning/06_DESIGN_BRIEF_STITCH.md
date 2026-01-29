# Design Identity & Stitch Brief — choorai.com

## 1. 브랜드 정체성

### 핵심 메시지
- **모토**: "개발 한 숟갈, 츄라이 츄라이"
- **약속**: 코딩 몰라도 60분이면 배포까지 간다
- **톤**: 격려하되 과장 없이, 전문적이되 어렵지 않게

### 브랜드 키워드
```
Primary:   완주 | 성취 | 시작
Secondary: 친근 | 명확 | 신뢰
Avoid:     복잡 | 압도 | 과장
```

### 타겟 사용자 감정 여정
```
Before:  "코딩 모르는데 뭘 어떻게 해야 하지..." (불안, 막막)
During:  "오 이거 되네? 다음은 뭐지?" (호기심, 몰입)
After:   "내가 만든 거 진짜 돌아간다!" (성취, 자신감)
```

---

## 2. 비주얼 톤

### 스타일: 게이미피케이션 + 다크 모드
- **Duolingo**의 성취감/진행 UI + **VS Code/GitHub**의 다크 전문성
- 작은 완료마다 시각적 보상 (체크, 프로그레스, 배지)
- 눈이 편한 다크 테마로 장시간 집중 가능

### 레퍼런스
| 요소 | 참고 |
|------|------|
| 진행률/성취 | Duolingo, Codecademy |
| 다크 테마 | GitHub, VS Code, Linear |
| 문서 레이아웃 | VitePress, Stripe Docs |
| 코드 블록 | Shiki, Carbon |

---

## 3. 컬러 시스템

### Primary Palette (Dark Navy Base)
```
Background (Dark):
  --bg-primary:    #0D1117    (GitHub Dark)
  --bg-secondary:  #161B22    (카드, 사이드바)
  --bg-elevated:   #21262D    (호버, 액티브)

Text:
  --text-primary:   #E6EDF3   (본문)
  --text-secondary: #8B949E   (보조 텍스트)
  --text-muted:     #484F58   (비활성)
```

### Accent Colors (성취/상태)
```
Success (완료/성공):
  --accent-success:  #238636  (녹색 - 체크, 완료)
  --accent-success-bright: #3FB950

Progress (진행):
  --accent-progress: #1F6FEB (파랑 - 진행 중)
  --accent-progress-bright: #58A6FF

Warning (주의):
  --accent-warning:  #9E6A03 (주황 - 주의)

Error (에러):
  --accent-error:    #DA3633 (빨강 - 에러)

Highlight (강조):
  --accent-highlight: #8957E5 (보라 - AI/프롬프트)
```

### 포인트 컬러 (브랜드)
```
choorai Brand:
  --brand-primary:   #58A6FF  (밝은 파랑 - 링크, CTA)
  --brand-secondary: #8957E5  (보라 - AI 관련)
```

---

## 4. 타이포그래피

### 폰트 패밀리
```css
--font-sans:  'Pretendard', 'Inter', -apple-system, sans-serif;
--font-mono:  'JetBrains Mono', 'Fira Code', monospace;
```

### 스케일
```
Heading 1:  32px / Bold / 1.2 line-height
Heading 2:  24px / Semibold / 1.3
Heading 3:  20px / Semibold / 1.4
Body:       16px / Regular / 1.6
Small:      14px / Regular / 1.5
Code:       14px / Mono / 1.5
```

---

## 5. 게이미피케이션 요소

### 진행률 표시
```
┌─────────────────────────────────────┐
│  Start 60min                        │
│  ████████████░░░░░░░░  60% 완료     │
│  Step 4 of 7                        │
└─────────────────────────────────────┘
```

### 완료 체크리스트
```
✅ 도메인 연결 완료
✅ 프론트엔드 배포 완료
⬜ 백엔드 배포
⬜ 최종 검증
```

### 성취 배지 (MVP 이후)
- 🎯 First Deploy - 첫 배포 완료
- 🔥 60min Master - 60분 완주
- 🛠 Troubleshooter - 에러 5개 해결
- 🚀 Full Cycle - Cycle 6까지 완주

### 마이크로 인터랙션
- 체크 완료 시: 부드러운 체크 애니메이션 + 색상 전환
- 코드 복사 시: "Copied!" 토스트
- 스텝 완료 시: 다음 스텝 하이라이트

---

## 6. 핵심 컴포넌트

### Stepper (단계 진행)
```
┌──────────────────────────────────────────┐
│ ① 준비 ──── ② 프론트 ──── ③ 백엔드 ──── ④ 검증 │
│   ✓           ●            ○            ○    │
└──────────────────────────────────────────┘
```
- 완료: 녹색 체크
- 현재: 파란 원 (활성)
- 대기: 회색 원

### CodeBlock
```
┌─ JavaScript ─────────────────────── [Copy] ─┐
│                                             │
│  const health = await fetch('/health');     │
│  console.log(await health.json());          │
│                                             │
└─────────────────────────────────────────────┘
```
- 다크 배경, 구문 강조
- 언어 탭 (여러 언어 지원 시)
- 복사 버튼 항상 표시

### PromptBox (AI 프롬프트)
```
┌─ 🤖 AI에게 복사해서 붙여넣기 ─────── [Copy] ─┐
│                                             │
│  [Mission] 프로젝트 목록 API를 만들어줘      │
│  [Context] FastAPI, /api/v1/projects       │
│  ...                                        │
│                                             │
└─────────────────────────────────────────────┘
```
- 보라색 테두리/강조 (AI 느낌)
- 눈에 띄는 복사 버튼

### Checklist (DoD)
```
┌─ ✅ 이 단계 완료 조건 ───────────────────────┐
│                                             │
│  ☑ localhost:3000 접속 가능                 │
│  ☑ /health 응답 확인                        │
│  ☐ 콘솔에 에러 없음                         │
│                                             │
└─────────────────────────────────────────────┘
```
- 체크 가능한 인터랙티브 (로컬 저장)
- 완료 시 녹색 강조

### Callout (알림)
```
💡 Info:    파란색 배경 - 팁, 추가 정보
⚠️ Warning: 주황색 배경 - 주의사항
❌ Error:   빨간색 배경 - 흔한 실수
✅ Success: 녹색 배경 - 성공 확인
```

### ErrorCard (트러블슈팅)
```
┌─ ❌ CORS policy: blocked ────────────────────┐
│                                              │
│  원인: 백엔드에 CORS 설정이 없음             │
│                                              │
│  해결:                                       │
│  FastAPI에 다음 코드 추가...                 │
│                                              │
│  [🤖 AI에게 물어보기]                        │
└──────────────────────────────────────────────┘
```
- 에러 메시지 그대로 표시 (검색 유입)
- 원인 → 해결 구조
- AI 프롬프트 연결

---

## 7. 레이아웃

### 브레이크포인트
```
Mobile:   < 768px    → 1단, 햄버거 메뉴, TOC 숨김
Tablet:   768-1199px → 2단, Sidebar + Content, TOC 숨김
Desktop:  ≥ 1200px   → 3단, Sidebar + Content + TOC
```

### Desktop (1200px+)
```
┌─────────────────────────────────────────────────────┐
│  🔍 Search                              [GitHub] 🌙 │
├──────────┬──────────────────────────────┬───────────┤
│          │                              │           │
│ Sidebar  │       Main Content           │ On-this-  │
│ (240px)  │       (flex)                 │ page      │
│          │                              │ (200px)   │
│ - Start  │  # Title                     │           │
│ - Cycle  │                              │ - Intro   │
│ - Deploy │  Content...                  │ - Step 1  │
│ - ...    │                              │ - Step 2  │
│          │                              │           │
│          │  ┌─ Progress ─────────────┐  │           │
│          │  │ ████████░░░░ 60%      │  │           │
│          │  └────────────────────────┘  │           │
│          │                              │           │
└──────────┴──────────────────────────────┴───────────┘
```

### Mobile (<768px)
```
┌─────────────────────┐
│ ☰  choorai  🔍  🌙 │
├─────────────────────┤
│                     │
│  # Title            │
│                     │
│  Progress: 60%      │
│  ████████░░░░       │
│                     │
│  Content...         │
│                     │
│  [← Prev] [Next →]  │
│                     │
└─────────────────────┘
```

---

## 8. 필수 화면

| # | 화면 | 핵심 요소 |
|---|------|-----------|
| 1 | **Home** | 히어로, 60min CTA, 특징 카드 |
| 2 | **Start 60min** | Stepper, Checklist, Progress |
| 3 | **Doc Detail** | TOC, CodeBlock, Callout |
| 4 | **Troubleshooting** | ErrorCard, 검색 |
| 5 | **Agent Recipes** | PromptBox, 카테고리 필터 |
| 6 | **Reference Project** | API 스펙, 요구사항 카드 |

---

## 9. Stitch 프롬프트 (복사용)

### 프롬프트 1: 전체 디자인 시스템
```
Design a documentation website design system for "choorai.com" - a free learning platform that helps non-developers build and deploy web services using AI agents.

Brand Identity:
- Tagline: "개발 한 숟갈, 츄라이 츄라이" (One spoonful of development, just try it)
- Tone: Encouraging but not exaggerated, professional but accessible
- Target: Complete beginners (zero coding knowledge)

Visual Style:
- Dark mode with Navy base (#0D1117, #161B22)
- Gamification elements (progress bars, checkmarks, achievements)
- Reference: Duolingo's achievement UI + GitHub's dark theme + VitePress docs

Color System:
- Background: #0D1117 (primary), #161B22 (secondary), #21262D (elevated)
- Text: #E6EDF3 (primary), #8B949E (secondary)
- Success: #238636, Progress: #1F6FEB, Warning: #9E6A03, Error: #DA3633
- AI/Highlight: #8957E5 (purple)

Typography:
- Sans: Pretendard/Inter
- Mono: JetBrains Mono
- Body: 16px, Headings: 32/24/20px

Components needed:
1. Stepper - horizontal progress with steps (complete/active/pending)
2. CodeBlock - dark theme, syntax highlighting, copy button, language tabs
3. PromptBox - purple accent, AI prompt template with copy button
4. Checklist - interactive checkboxes with local storage
5. Callout - info/warning/error/success variants
6. ErrorCard - error message + cause + solution + AI prompt link
7. Progress bar - percentage with visual fill

Layout:
- Desktop (≥1200px): Left sidebar (240px) + Main content + Right TOC (200px)
- Tablet (768-1199px): Left sidebar + Main content, TOC hidden
- Mobile (<768px): Hamburger menu + stacked content, bottom navigation
- Fixed search bar at top
- Breakpoints: 768px, 1200px
```

### 프롬프트 2: Home 페이지
```
Design a dark-themed home page for "choorai.com" documentation site.

Hero Section:
- Headline: "코딩 몰라도 괜찮아요"
- Subheadline: "AI와 함께 60분 만에 나만의 웹서비스를 배포하세요"
- Primary CTA: "60분 완주 시작하기" (bright blue button)
- Secondary CTA: "둘러보기"
- Background: Dark navy (#0D1117) with subtle gradient or grid pattern

Features Section (3-4 cards):
1. ⏱️ "60분 완주" - 복붙만으로 배포까지
2. 🔧 "막히면 해결" - Troubleshooting 가이드
3. 🤖 "AI 프롬프트" - 복사해서 붙여넣기만
4. 💰 "비용 0원" - 무료로 시작하고 유지

Stats or Social Proof:
- "GitHub ⭐" count
- "완주한 사용자" count

Footer:
- Links: GitHub, Blog (curogom.dev)
- "by curogom"

Style: Dark mode, clean, gamification subtle hints (maybe a progress indicator teaser)
```

### 프롬프트 3: Start 60min 페이지
```
Design a tutorial page for "60분 완주" (60-minute completion challenge).

Top Section:
- Title: "Start: 60분 완주"
- Progress bar: "████████░░░░ Step 4/7 - 57% 완료"
- Estimated time remaining

Stepper:
- Horizontal step indicator
- Steps: 준비 → 프론트 → 백엔드 → 연결 → 배포 → 검증 → 완료
- Current step highlighted in blue, completed in green with checkmark

Content Area:
- Step title and description
- CodeBlock components with copy buttons
- Checklist: "이 단계 완료 조건" with checkboxes
- Callout boxes for tips and warnings

Navigation:
- "← 이전 단계" / "다음 단계 →" buttons
- Next button disabled until checklist complete (gamification)

Sidebar (right):
- On-this-page navigation
- Current step summary

Style: Dark theme, clear visual hierarchy, encouraging micro-interactions
```

### 프롬프트 4: Troubleshooting 페이지
```
Design a troubleshooting page for common deployment errors.

Search Section:
- Large search bar: "에러 메시지를 붙여넣어 보세요"
- Popular searches as tags below

Error List:
- Cards for each error type
- Each card shows: Error message snippet, view count, "해결됨" badge if common

Error Detail (ErrorCard component):
- Error message in red-tinted code block (exact string for SEO)
- "원인" section with explanation
- "해결" section with step-by-step fix
- CodeBlock with solution code
- "🤖 AI에게 물어보기" button linking to PromptBox

Categories sidebar:
- CORS, ENV, SPA 404, Build Fail, Auth/Cookie

Style: Dark theme, scannable, error messages prominent for search/copy
```

### 프롬프트 5: 개선 요청 (한국어 통일 + 시각적 개선)
```
Please refine the existing choorai.com designs with these improvements:

## 1. 전체 한국어 통일 (IMPORTANT - ALL UI IN KOREAN)

Navigation & Headers:
- "Docs" → "문서"
- "ON THIS PAGE" → "이 페이지에서"
- "Search documentation..." → "문서 검색..."
- "Log In" → "로그인"
- "Getting Started" → "시작하기"
- "Core Concepts" → "핵심 개념"
- "Resources" → "리소스"

Buttons & Actions:
- "Copy" / "COPY" → "복사"
- "Copy Prompt" → "프롬프트 복사"
- "Copy Solution" → "해결책 복사"
- "Ask AI for help" → "AI에게 물어보기"
- "Read Docs" → "문서 보기"
- "View Build Logs" → "빌드 로그 보기"
- "Previous Step" → "이전 단계"
- "Next Step" → "다음 단계"
- "Load more common errors" → "더 많은 에러 보기"
- "Contact Human Support" → "사람에게 문의하기"

Labels & Status:
- "CRITICAL" → "심각"
- "WARNING" → "주의"
- "Track" → "트랙"
- "TUTORIAL PROGRESS" → "튜토리얼 진행률"
- "Pro Tip" → "꿀팁"
- "Trending" → "자주 찾는 에러"
- "Step Checklist" → "완료 체크리스트"
- "AI Assistant Instruction" → "AI 프롬프트"
- "Action Required" → "입력 필요"
- "Manual Configuration" → "직접 설정하기"
- "Prerequisites" → "사전 준비"
- "Configuration" → "설정"
- "Deployment" → "배포"
- "Deployment Successful" → "배포 완료!"
- "Security Notice" → "보안 주의"
- "Managed Infrastructure" → "관리형 인프라"

Placeholders:
- "Paste your error log here..." → "에러 메시지를 붙여넣어 보세요..."
- "Search documentation..." → "문서 검색..."

Footer:
- "All rights reserved" → "모든 권리 보유"
- "Designed for non-developers" → "비개발자를 위해 만들었습니다"

## 2. 시각적 개선

Home CTA:
- Primary 버튼 "60분 완주 시작하기" 더 크고 눈에 띄게 (glow effect 추가)
- Secondary 버튼은 outline 스타일로 확실히 구분

Progress & Gamification:
- 진행률 바에 subtle gradient/glow 효과
- 체크박스 완료 시 부드러운 애니메이션
- 모든 체크리스트 완료 시 "완료!" 축하 효과

Navigation:
- Breadcrumb 추가: 홈 / 문서 / 트러블슈팅
- 사이드바 현재 섹션 더 강조
- 튜토리얼 페이지에 사이드바에 "현재 진행률" 표시

## 3. 반응형 디자인 (Mobile & Tablet)

Breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1199px
- Desktop: ≥ 1200px

Mobile (< 768px):
- 햄버거 메뉴 (☰)로 사이드바 대체
- TOC 숨김 (하단 "이 페이지에서" 접이식으로 대체)
- 1단 레이아웃, 전체 너비 콘텐츠
- 하단 고정 네비게이션: "이전" / "다음" 버튼
- 진행률 바는 상단에 항상 표시
- 코드 블록 가로 스크롤 허용
- CTA 버튼 전체 너비 (100%)
- 터치 친화적 체크박스 (최소 44px 터치 영역)

Tablet (768px - 1199px):
- 2단 레이아웃: 사이드바 (200px) + 콘텐츠
- TOC 숨김
- 사이드바 접기/펼치기 토글 버튼

공통:
- 모든 인터랙티브 요소 최소 44px 터치 영역
- 스와이프로 이전/다음 단계 이동 (튜토리얼)
- 가로 모드(landscape) 대응

## 4. 유지할 것
- Dark navy theme (#0D1117) 그대로 유지
- 컬러 시스템 (녹색 성공, 파랑 진행, 빨강 에러, 보라 AI) 유지
- 로고는 텍스트 "Choorai"로 유지 (별도 제작 예정)
```
