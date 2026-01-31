# Platform/Infra Standard (Stack-agnostic)

## 목표
- 언어/프레임워크를 바꿔도 유지되는 **표준 배포 단위/운영 표준** 제공
- 비용 0원 유지 가능 설계(폭주 방지 포함)

## 표준 구성
- DNS/Edge: Cloudflare DNS(+Proxy 선택)
- Front: Cloudflare Pages(정적)
- Backend: Cloud Run(컨테이너)
- Contract: OpenAPI 단일 진실(`/contracts/openapi.yaml`)
- Env: `staging`/`prod` 분리 + 서브도메인 분리

## 과금 사고 방지(필수)
- 백엔드: `min instances=0`, `max instances=1`
- 예산 알림(소액이라도 발생 시 알림)
- DB는 MVP에서 금지(필요해질 때만 옵션 문서로 추가)

## 레포 표준(초안)
```
choorai/
├── site/                    # choorai.com 문서 사이트 (VitePress/Astro)
├── examples/                # 예시 프로젝트
│   └── b2b-admin/
│       ├── web/             # React + Vite
│       ├── api/             # Python + FastAPI (Primary)
│       └── api-go/          # Go (추후 추가)
├── contracts/
│   └── openapi.yaml
├── docs/
│   ├── planning/
│   └── development/
└── docker-compose.yml
```
- 로컬 실행: `make dev` 또는 `docker compose up`

## 도메인 구조

### 네이밍 규칙
| 서비스 | 도메인 | 설명 |
|--------|--------|------|
| 문서 사이트 | `choorai.com` | 메인 문서/랜딩 |
| 예시 프론트엔드 | `{project}.choorai.com` | 예: `b2b-admin.choorai.com` |
| 백엔드 API | `{language}.backend.choorai.com` | 예: `fastapi.backend.choorai.com` |

### 환경별 서브도메인
| 환경 | 패턴 | 예시 |
|------|------|------|
| Production | `{service}.choorai.com` | `b2b-admin.choorai.com` |
| Staging | `staging-{service}.choorai.com` | `staging-b2b-admin.choorai.com` |

### 현재 도메인 목록
```
choorai.com                      → Cloudflare Pages (문서)
b2b-admin.choorai.com            → Cloudflare Pages (예시 프론트)
fastapi.backend.choorai.com      → Cloud Run (FastAPI 백엔드)
go.backend.choorai.com           → Cloud Run (Go 백엔드, 예정)
```

### Cloudflare DNS 설정 예시
```
Type    Name                    Content                         Proxy
-----   ----------------------  ------------------------------- ------
CNAME   @                       <pages-project>.pages.dev       ✓
CNAME   b2b-admin               <pages-project>.pages.dev       ✓
CNAME   fastapi.backend         <cloud-run-url>.run.app         ✓
CNAME   go.backend              <cloud-run-url>.run.app         ✓
```

### CORS 설정 (백엔드)
각 백엔드는 환경 변수로 허용 도메인 설정:
```bash
# .env.production
ALLOWED_ORIGINS=https://b2b-admin.choorai.com,https://choorai.com

# .env.staging
ALLOWED_ORIGINS=https://staging-b2b-admin.choorai.com
```
