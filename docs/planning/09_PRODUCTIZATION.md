# MVP 완성 계획 (Phase 2)

## Phase 1 완료 현황

### 완료된 항목
- [x] 60분 완주 튜토리얼 (React + FastAPI) - 6단계 전체
- [x] Cycle 0: 개요 + 도구
- [x] Cycle 4: 데이터베이스
- [x] 인증 가이드
- [x] 배포 레퍼런스 (Cloudflare Pages, Cloud Run)
- [x] 트러블슈팅 Top 5 (CORS, ENV, SPA 404, Build Fail, Auth/Cookie)
- [x] 사이드바 구조 개선 (disabled 상태 표시)
- [x] 에디터 추천 업데이트 (Antigravity 1순위)
- [x] 홈페이지 QA (로그인→GitHub, 허수 제거, 약관/개인정보)

### PRD 기준 미완료 항목
- [ ] Cycle 1~3, 5~6 콘텐츠
- [ ] Agent Recipes Core Pack (10개)

---

## Phase 2: MVP 완성 로드맵

### 1. 인프라 & 운영 (우선순위: 높음)

#### 1.1 Git Branch Protection
```yaml
규칙:
  - main 브랜치 직접 push 금지
  - PR 필수 (최소 1명 리뷰 또는 셀프 머지 허용)
  - CI 통과 필수 (빌드 성공)
  - force push 금지
```

**설정 방법**: GitHub → Settings → Branches → Add rule

#### 1.2 GA4 연동
```yaml
추적 이벤트:
  페이지뷰:
    - page_view (자동)

  사용자 행동:
    - start_60min: 60분 완주 시작
    - complete_step_{1-6}: 각 단계 완료
    - copy_prompt: 프롬프트 복사
    - check_item: 체크리스트 항목 체크
    - click_external_{service}: 외부 링크 클릭 (github, cloudflare, etc)

  성과 지표:
    - 완주율: complete_step_6 / start_60min
    - 이탈 지점: step별 이탈률
    - 트러블슈팅 활용도: 페이지뷰 + 체류시간
```

**구현 위치**: `site/src/layouts/BaseLayout.astro`에 gtag 삽입

#### 1.3 CI/CD 강화
```yaml
현재: Cloudflare Pages Git 연동 (자동 배포)
추가:
  - PR 미리보기 배포 (Preview URL)
  - Lighthouse CI (성능 체크)
  - 링크 체커 (깨진 링크 탐지)
```

---

### 2. 콘텐츠 확장 (우선순위: 중간)

#### 2.1 학습 사이클 완성
| Cycle | 주제 | 예상 분량 | 의존성 |
|-------|------|----------|--------|
| 1 | DNS | 1페이지 | 없음 |
| 2 | Frontend 배포 | 2페이지 | Cycle 1 |
| 3 | Backend 배포 | 2페이지 | Cycle 2 |
| 5 | Runtime | 1페이지 | Cycle 3 |
| 6 | Ops | 2페이지 | Cycle 5 |

#### 2.2 Agent Recipes Core Pack
```yaml
카테고리:
  프로젝트 시작:
    - 새 React 프로젝트 생성
    - FastAPI 보일러플레이트
    - 프로젝트 구조 설계

  개발:
    - 컴포넌트 생성
    - API 엔드포인트 추가
    - 에러 디버깅

  배포:
    - Cloudflare Pages 배포
    - Cloud Run 배포
    - 환경변수 설정
```

---

### 3. 사용자 경험 개선 (우선순위: 낮음)

#### 3.1 검색 기능
- 현재: 플레이스홀더만 있음
- 목표: Pagefind 또는 Algolia 연동

#### 3.2 다크/라이트 모드
- 현재: 다크 모드 고정
- 검토: 라이트 모드 추가 여부

#### 3.3 모바일 사이드바
- 현재: lg 이상에서만 표시
- 목표: 햄버거 메뉴 + 슬라이드 사이드바

---

## 우선순위 매트릭스

| 항목 | 영향도 | 난이도 | 우선순위 |
|------|--------|--------|----------|
| Branch Protection | 높음 | 낮음 | **P0** |
| GA4 연동 | 높음 | 중간 | **P0** |
| Cycle 1-3 콘텐츠 | 중간 | 높음 | P1 |
| Agent Recipes | 중간 | 중간 | P1 |
| 검색 기능 | 낮음 | 중간 | P2 |
| Cycle 5-6 콘텐츠 | 낮음 | 중간 | P2 |

---

## 성공 지표 (KPI)

### 단기 (1개월)
- GA4 데이터 수집 시작
- 60분 완주 시작 이벤트 100건 이상
- 완주율 측정 가능

### 중기 (3개월)
- 완주율 30% 이상
- 검색 유입 키워드 발생
- GitHub star 50개

### 장기 (6개월)
- 월간 방문자 1,000명
- 외부 링크/인용 발생
- 커뮤니티 형성 시작
