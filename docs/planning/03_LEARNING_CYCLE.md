# Learner “One Cycle” Flow

## 사이클 정의
학습자가 반복해서 경험하는 플로우:  
**DNS → Front → Backend(+DB) → Runtime(온프레/클라우드) → Ops**

## 단계별 산출물(필수)
### Cycle Step 0: 목표 정의
- 산출물: 기능 1개 + DoD 5줄 + 검증 방법 1개

### 1) DNS
- 산출물: staging/prod 서브도메인 규칙 + 라우팅 다이어그램 1장

### 2) Front(정적 배포)
- 산출물: 배포 URL + `/health` 상태 표시 화면 + SPA 404 방지

### 3) Backend(API)
- 산출물: API URL + `GET /health` + `GET /api/v1/projects` + 구조화 로그

### 4) DB(선택)
- 산출물(택1):
  - DB 없음(Seed/In-memory + 리셋 규칙)
  - Postgres 연결(Projects 테이블 + 마이그 1개)

### 5) Runtime
- 산출물: 로컬(docker compose)과 클라우드(Cloud Run)에서 동일 기능 검증

### 6) Ops(필수)
- 산출물: staging→prod 승격 규칙 + 롤백 방법 + 비용 가드레일 체크리스트

## MVP는 “사이클 3회”로 Formal case 완성
- Cycle 1: Hello Deploy(Front+API health)
- Cycle 2: 기능 1개(Projects list/create)
- Cycle 3: Production-lite(staging/prod + CI + 롤백 + 비용가드레일)
