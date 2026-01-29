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
