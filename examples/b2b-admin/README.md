# B2B Admin Console (예시 프로젝트)

> choorai.com 문서에서 가르치는 샘플 프로젝트

## 구조

```
b2b-admin/
├── web/          # React + Vite 프론트엔드
├── api/          # Python + FastAPI 백엔드
└── api-go/       # Go 백엔드 (추후 추가)
```

## 기능 범위 (MVP)

- [x] Health Check (`GET /health`)
- [ ] 프로젝트 목록 조회 (`GET /api/v1/projects`)
- [ ] 프로젝트 생성 (`POST /api/v1/projects`)
- [ ] 프로젝트 상세 조회 (`GET /api/v1/projects/:id`)
- [ ] 프로젝트 수정 (`PUT /api/v1/projects/:id`)
- [ ] 프로젝트 삭제 (`DELETE /api/v1/projects/:id`)

## API 스펙

[contracts/openapi.yaml](../../contracts/openapi.yaml) 참조

## 개발

```bash
# 전체 실행 (루트에서)
make dev

# 또는 개별 실행
make dev-api  # API만
make dev-web  # Web만
```
