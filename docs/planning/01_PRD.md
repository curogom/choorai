# Product Requirements Document (PRD) — choorai.com

## 0. 비전 & 미션

### 비전
**비개발자도 AI를 활용해 자신만의 웹서비스를 만들 수 있는 세상**

### 미션
코딩을 전혀 모르는 사람이 AI Agent를 활용해 '작동하는 웹서비스'를 만들고 배포까지 완주하도록 돕는다.

### 핵심 가치
- **무료**: 사용자는 돈을 내지 않는다
- **접근성**: 누구나 쉽게 시작할 수 있다
- **완주**: 이탈 없이 끝까지 도달한다
- **환원**: 지식을 사회에 공유한다

### 운영자
- **curogom** ([curogom.dev](https://curogom.dev))
- 목표: 지식 공유 환원 + 개인 브랜드/명예

---

## 1. 제품 한 줄
**choorai.com은 코딩을 전혀 모르는 사람이 AI Agent를 써서 '작동하는 웹서비스'를 만들고 배포까지 가도록 돕는 문서형 참고서다.**
모토: **개발 한 숟갈, 츄라이 츄라이.**

---

## 2. 목표
- **60분 내 배포 완주**(URL 생성 + 검증) 경험 제공
- 언어/프레임워크가 바뀌어도 유지되는 **스택 독립 표준 플로우** 제공
- 운영비 **0원(또는 0원에 가깝게)** 유지 가능한 설계
- AI 검색(LLM 검색 포함)에서 "문제 해결 문서"로 잘 노출

---

## 3. Non-goals
- 각 스택의 "Best practice" 강의
- **수익 극대화** (사용자 과금 없음)
- 무거운 DB/스토리지 기반 서비스(초기 금지)
- 유료 프리미엄 기능

---

## 4. 수익 모델

| 수익원 | 우선순위 | 설명 |
|--------|----------|------|
| **광고** | Primary | 비침습적, 문서 하단/사이드바 |
| **후원/기부** | Secondary | GitHub Sponsors, Buy Me a Coffee 등 |
| **제휴** | Tertiary | 클라우드 크레딧 제휴 (GCP, Cloudflare 등) |

> **원칙**: 사용자에게 직접 과금하지 않음. 광고와 기부로 유지비만 충당.

---

## 5. 타겟 사용자
- **Primary**: 프로그래밍 지식 0, "바이브 코딩으로 뭐 만들고 싶음"
- **Secondary**: 입문자, "형식 있는 배포/운영" 템플릿이 필요한 사람

---

## 6. 사용자의 핵심 문제
- 무엇을 시켜야 할지 모름(요구사항 → 작업지시)
- 실패 시 어디가 문제인지 모름(로그/에러 해석 불가)
- 배포/환경변수/CORS/라우팅에서 멈춤
- AI가 준 코드가 돌아가도 유지·확장 구조가 없음

---

## 7. 제공 가치(핵심)
1) **완주 루트**: Start(60min)
2) **실패 처방**: Troubleshooting + "AI에게 이렇게 물어봐라" 템플릿
3) **Formal case**: staging/prod, CI/CD, 관측, 보안, 비용가드레일

---

## 8. 이탈 방지 전략

| 이탈 포인트 | 해결책 |
|-------------|--------|
| "뭘 해야 할지 모름" | 60min 완주 (명확한 첫 단계) |
| "에러에서 막힘" | Troubleshooting + AI 프롬프트 템플릿 |
| "중간에 지침" | Checkpoint/진행률 표시 |
| "혼자라서 외로움" | 커뮤니티 (Discord/쇼케이스) |
| "성취감 없음" | 배지/완주 인증/쇼케이스 |

---

## 9. MVP 범위
- 기본 스택: **Python(FastAPI) + React(Vite)** (Go는 추후 비용 최적화 트랙으로 추가)
- 배포: **Cloudflare Pages(Front) + Cloud Run(API)**, staging/prod 분리
- Reference 프로젝트 1개: **B2B Admin Console**
- 문서:
  - `/start/60min`
  - `/cycle/0-overview` + `/cycle/0-tools`
  - `/cycle/1~6` 공통 페이지 + FastAPI/React 분기 일부
  - `/deploy` 2개(Front/API)
  - `/troubleshooting` Top 5
  - `/agent-recipes` Core Pack(10개)

---

## 10. 성공지표(KPI)

### 제품 지표
- Start 60min 완주(배포 URL 생성) 전환율
- Troubleshooting 페이지에서 해결 링크 클릭/체류
- 검색 유입 키워드 발생(CORS/ENV/SPA 404/Cloud Run 등)

### 브랜드 지표
- GitHub star/fork
- 외부 링크/인용
- 후원자 수 (GitHub Sponsors 등)
- 소셜 팔로워/멘션

---

## 11. 리스크/대응
- 문서만 많고 완주가 안 됨 → Start 60min + 실패처방 우선
- 비용/과금 사고 → max instances 제한 + 예산 알림 + DB 금지 원칙
- 스택 확장 시 파편화 → Cycle(공통) → Stack(분기) 구조 고정 + OpenAPI 계약 고정

---

## 12. 향후 확장 (Phase 2+)
- 커뮤니티: 쇼케이스, Q&A, Discord
- 콘텐츠 채널: YouTube, 블로그 연계
- 추가 스택: Go, Node, Spring
- (검토 중) AI Agent 서비스, 배포 플랫폼
