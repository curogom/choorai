# Prompt Packs (Antigravity/Codex)

## 공통 프롬프트 템플릿 v1
```text
[Mission] 이번 작업에서 완성할 것 1줄
[Context] 레포 구조, 현재 상태, 관련 파일/경로, 사용 도구
[Deliverables] 생성/수정 파일 목록 + 명령 + 문서 + 검증 로그
[Constraints] 비용 0원, DB 금지(초기), 파괴 명령 금지, max instances=1
[Validation] 성공 확인 방법(URL, curl 응답, 화면 기준)
[Safety] 실행 전 계획/영향/롤백을 먼저 출력. 삭제/대량 변경은 승인 없이는 금지.
```

## Core Pack(MVP 최소 10개)
1) Repo Bootstrap(모노레포+docs+openapi)
2) Start 60min 문서 생성
3) FastAPI 스캐폴딩(`/health`, `/api/v1/projects`, 로그)
4) React/Vite 스캐폴딩(health 표시)
5) OpenAPI 업데이트 규칙 적용
6) Auth(데모)
7) RBAC + 권한 테스트
8) Audit Log
9) Deploy: Cloudflare Pages
10) Deploy: Cloud Run(가드레일)
11) Troubleshooting Top5 문서 생성
12) SEO 파일(robots/sitemap/structured data) 생성

## Go Pack(추후 추가)
- Go API 스캐폴딩(`/health`, `/api/v1/projects`, 로그)
- Go + Chi Router 설정
- Go 배포: Cloud Run(비용 최적화)

## “Start 60min”용 예시 프롬프트(바로 사용)
```text
[Mission] 코딩 0 사용자가 60분 내 배포 URL을 얻도록 튜토리얼(/docs/start/60min.md)을 작성하고, 그 튜토리얼을 만족하는 최소 web/api 코드를 만든다.
[Deliverables]
- /docs/start/60min.md (복붙 명령 10개 이내)
- apps/web: health 표시 페이지
- apps/api: /health 응답
- 로컬 실행 및 검증 로그
[Constraints]
- DB 금지, seed/in-memory
- 실패 섹션: CORS, ENV, SPA 404, build fail 포함
```
