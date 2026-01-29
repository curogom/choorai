# Development Plan — choorai.com

## Overview
이 문서는 choorai.com의 개발 계획을 정의합니다.
기획 문서는 [docs/planning/](../planning/)을 참조하세요.

---

## 스택 구분

### choorai.com (문서 사이트 자체)
| 항목 | 기술 | 이유 |
|------|------|------|
| 프레임워크 | VitePress / Astro | 정적 사이트, 문서 최적화 |
| 스타일링 | Tailwind CSS | 빠른 커스터마이징 |
| 배포 | Cloudflare Pages | 무료 + 빠른 글로벌 배포 |
| API (필요시) | Cloudflare Workers | Edge Function, 최소 비용 |

### 예시 프로젝트 (문서에서 가르치는 샘플)
| 항목 | Primary (MVP) | Secondary (추후) |
|------|---------------|------------------|
| Frontend | React + Vite | - |
| Backend | **Python + FastAPI** | Go |
| DB | In-memory → Postgres | 동일 |
| 배포 | Cloudflare Pages + Cloud Run | 동일 |

> **왜 FastAPI가 Primary인가?**
> - 초보자 친화적 (가독성 높음)
> - AI 코드 생성 품질 높음
> - 60분 완주 목표에 적합
> - Go는 비용 최적화 트랙으로 추후 제공

---

## Phase 1: 프로젝트 초기 설정

### 1.1 레포지토리 구조 생성
```
choorai/
├── site/                    # choorai.com 문서 사이트
│   └── (VitePress/Astro)
├── examples/                # 예시 프로젝트들
│   └── b2b-admin/
│       ├── web/             # React + Vite
│       ├── api/             # Python + FastAPI (Primary)
│       └── api-go/          # Go (추후 추가)
├── contracts/
│   └── openapi.yaml         # API 스펙
├── docs/
│   ├── planning/            # 기획 문서
│   └── development/         # 개발 문서
├── README.md
├── LICENSE
├── Makefile
└── docker-compose.yml
```

### 1.2 개발 환경 설정
- [ ] Node.js 20+ / pnpm 설치
- [ ] Python 3.11+ 설치
- [ ] Docker / Docker Compose 설치
- [ ] Cloudflare 계정 생성
- [ ] GCP 계정 생성 (Cloud Run용)

### 1.3 도메인 설정
- [ ] choorai.com 도메인 구매/연결
- [ ] Cloudflare DNS 설정
- [ ] 서브도메인 규칙 정의
  - `choorai.com` → 프로덕션
  - `staging.choorai.com` → 스테이징

---

## Phase 2: 문서 사이트 구축 (site/)

### 2.1 핵심 페이지 개발 순서
1. **Home** - 랜딩 페이지
2. **Start/60min** - 60분 완주 튜토리얼 (MVP 핵심)
3. **Troubleshooting** - 에러 해결 가이드 Top 5
4. **Cycle 0~6** - 학습 사이클 문서
5. **Agent Recipes** - 프롬프트 팩
6. **Reference Project** - B2B Admin Console

### 2.2 핵심 컴포넌트 개발
- [ ] `Stepper` - 단계 진행 표시
- [ ] `CodeBlock` - 언어 탭 + 복사 버튼
- [ ] `PromptBox` - AI 프롬프트 복사 박스
- [ ] `Checklist` - 완료 체크리스트
- [ ] `Callout` - warn/info/success 알림
- [ ] `ErrorCard` - 에러 → 원인 → 해결

---

## Phase 3: 콘텐츠 작성

### 3.1 MVP 문서 목록 (우선순위순)
| # | 문서 | 상태 | 비고 |
|---|------|------|------|
| 1 | /start/60min | 미작성 | MVP 핵심 |
| 2 | /troubleshooting/cors | 미작성 | 검색 유입 |
| 3 | /troubleshooting/env | 미작성 | 검색 유입 |
| 4 | /troubleshooting/spa-404 | 미작성 | 검색 유입 |
| 5 | /troubleshooting/build-fail | 미작성 | 검색 유입 |
| 6 | /troubleshooting/auth-cookie | 미작성 | 검색 유입 |
| 7 | /cycle/0-overview | 미작성 | |
| 8 | /cycle/0-tools | 미작성 | |
| 9 | /deploy/cloudflare-pages | 미작성 | |
| 10 | /deploy/cloud-run | 미작성 | |

### 3.2 문서 템플릿 (필수 섹션)
모든 문서는 다음 구조를 따름:
- TL;DR (5줄)
- Prerequisites (3개 이내)
- Steps (번호 + 코드)
- Validation (성공 기준)
- Troubleshooting (에러 문자열 포함)
- References (공식 문서 링크)
- Last updated + Version

---

## Phase 4: Reference Project (B2B Admin Console)

### 4.1 기능 범위
- 프로젝트 목록 조회 (`GET /api/v1/projects`)
- 프로젝트 생성 (`POST /api/v1/projects`)
- Health Check (`GET /health`)
- 인증 (데모용)
- RBAC (데모용)

### 4.2 기술 스택
| 구분 | Primary (MVP) | Secondary (추후) |
|------|---------------|------------------|
| Frontend | React + Vite + TanStack Query | - |
| Backend | **Python + FastAPI** | Go + Chi Router |
| DB | In-memory (Seed) → Postgres | 동일 |

---

## Phase 5: 배포 파이프라인

### 5.1 문서 사이트 (Cloudflare Pages)
- [ ] GitHub 연동
- [ ] 빌드 명령어 설정
- [ ] 커스텀 도메인 연결

### 5.2 예시 프로젝트 Frontend (Cloudflare Pages)
- [ ] GitHub 연동
- [ ] 빌드 명령어 설정
- [ ] 환경 변수 설정

### 5.3 예시 프로젝트 Backend (Cloud Run)
- [ ] Dockerfile 작성
- [ ] Cloud Build 설정
- [ ] 환경 변수 설정 (Secret Manager)
- [ ] 가드레일 설정
  - `min-instances: 0`
  - `max-instances: 1`
  - 예산 알림

### 5.4 CI/CD
- [ ] GitHub Actions 워크플로우
  - PR: lint + test
  - main → staging 자동 배포
  - tag → prod 배포

---

## Phase 6: SEO & Analytics

### 6.1 기술적 SEO
- [ ] sitemap.xml 생성
- [ ] robots.txt 설정
- [ ] 구조화 데이터 (FAQ/Article/Breadcrumb)
- [ ] canonical URL 설정
- [ ] llms.txt (옵션)

### 6.2 Analytics
- [ ] Google Search Console 등록
- [ ] Cloudflare Analytics 활성화
- [ ] 핵심 지표 대시보드 구성

---

## Milestone 요약

| Milestone | 목표 | 핵심 산출물 |
|-----------|------|-------------|
| **M1** | 프로젝트 설정 | 레포 구조, 도메인, CI/CD 기본 |
| **M2** | 문서 사이트 뼈대 | VitePress/Astro 설정, 핵심 컴포넌트 |
| **M3** | MVP 콘텐츠 | Start 60min + Troubleshooting 5개 |
| **M4** | Reference Project | B2B Admin (FastAPI) 샘플 + 배포 |
| **M5** | SEO & 런칭 | sitemap, 구조화 데이터, 검색 등록 |

---

## 스택 확장 로드맵

| 순서 | 스택 | 시점 | 비고 |
|------|------|------|------|
| 1 | Python + FastAPI | MVP | Primary |
| 2 | **Go** | MVP 이후 | 비용 최적화 트랙 |
| 3 | Node + Express | 수요에 따라 | 옵션 |
| 4 | Spring Boot | 수요에 따라 | 옵션 |

---

## 기술 부채 / 향후 과제
- 다국어 지원 (i18n)
- Go 백엔드 예시 추가
- 광고 시스템 (`<AdSlot/>` 컴포넌트 활성화)
- 커뮤니티 기능 (댓글, 피드백)
