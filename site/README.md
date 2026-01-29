# choorai.com 문서 사이트

> Astro + React + Tailwind CSS 기반 문서 사이트

## 기술 스택

- **Astro** - 정적 사이트 생성
- **React** - 인터랙티브 컴포넌트
- **Tailwind CSS** - 스타일링
- **TypeScript** - 타입 안전성

## 디자인 시스템

Stitch에서 생성된 디자인을 기반으로 구축된 디자인 시스템:

### 핵심 컴포넌트

- [x] `Button` - Primary, Secondary, Ghost 변형
- [x] `ProgressBar` - 게이미피케이션 진행률
- [x] `CodeBlock` - 코드 표시 (복사 기능)
- [x] `PromptBox` - AI 프롬프트 템플릿
- [ ] `Checklist` - 대화형 체크박스
- [ ] `StepIndicator` - 튜토리얼 단계 표시
- [ ] `ErrorCard` - 트러블슈팅 카드

### 색상 팔레트

| 용도 | 색상 |
|------|------|
| 배경 | `#0D1117` |
| 카드 | `#161B22` |
| 테두리 | `#30363D` |
| 기본 액센트 | `#57ABFF` |
| AI 강조 | `#A855F7` |
| 성공 | `#238636` |
| 에러 | `#DA3633` |

## 개발

```bash
# 의존성 설치
npm install

# 개발 서버
npm run dev

# 빌드
npm run build

# 미리보기
npm run preview
```

## 폴더 구조

```
site/
├── src/
│   ├── components/     # React 컴포넌트
│   ├── layouts/        # Astro 레이아웃
│   ├── pages/          # Astro 페이지
│   └── styles/         # 전역 스타일
├── astro.config.mjs    # Astro 설정
├── tailwind.config.mjs # Tailwind 설정
└── tsconfig.json       # TypeScript 설정
```

## 배포

Cloudflare Pages로 자동 배포됩니다.
