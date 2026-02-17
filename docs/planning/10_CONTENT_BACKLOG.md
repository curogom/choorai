# Choorai 추가 콘텐츠 백로그 (2026-02-17)

## 목적
- 현재 공개된 문서 범위를 기준으로, 다음 배포 사이클에서 실제로 추가해야 할 콘텐츠를 우선순위로 정리한다.
- 각 항목은 바로 페이지 생성이 가능하도록 `ko/en 경로`를 함께 정의한다.

## 현재 기준
- 완료: `Path(60분)`, `Map`, `Fix Top10`, `Deploy 3종`, `BaaS`, `Auth`, `Testing`, `Reference`, `Recipes(4종)`.
- 미완료 성격: Recipes 확장, Deploy 레퍼런스 확장, 실전 운영 콘텐츠, 심화 코스(미니 SaaS/B2B Admin).

## Release 2 즉시 반영 후보 (목표: 2026-03-09)
- 기준 문서: `docs/planning/13_RELEASE_2_SCOPE_DRAFT.md`
- 후보 묶음 (10개 주제 / ko-en 동시):
  - Recipes 6개: `react-bootstrap`, `fastapi-bootstrap`, `hono-bootstrap`, `add-crud-endpoint`, `add-auth-cookie`, `review-pr-quality`
  - Deploy 2개: `netlify`, `railway`
  - Ops/Runtime 2개: `environments`, `release-rollback`

---

## P0 (즉시) - 검색/실사용 빈도가 높은 문제

### 1) 트러블슈팅 확장 Top 10
| 주제 | ko 경로 | en 경로 | 우선순위 근거 |
|---|---|---|---|
| DNS 미전파 / NXDOMAIN | `/fix/dns-nxdomain` | `/en/fix/dns-nxdomain` | 배포 직후 가장 빈번한 도메인 이슈 |
| SSL 인증서 오류 | `/fix/ssl-cert` | `/en/fix/ssl-cert` | HTTPS 전환 시 즉시 장애 |
| Mixed Content 차단 | `/fix/mixed-content` | `/en/fix/mixed-content` | HTTPS 환경 API 호출 실패 다발 |
| 502/504 Gateway Timeout | `/fix/gateway-timeout` | `/en/fix/gateway-timeout` | 런타임/프록시 설정 실수 빈번 |
| `TypeError: Failed to fetch` | `/fix/failed-to-fetch` | `/en/fix/failed-to-fetch` | 네트워크, CORS, DNS 원인 혼재 |
| 빌드 OOM/메모리 부족 | `/fix/build-oom` | `/en/fix/build-oom` | CI 환경에서 반복 발생 |
| Node 버전 불일치 | `/fix/node-version` | `/en/fix/node-version` | 로컬/CI 불일치로 빌드 실패 |
| CORS Preflight 405 | `/fix/preflight-405` | `/en/fix/preflight-405` | CORS 상위 케이스로 자주 분리 필요 |
| Webhook 서명 검증 실패 | `/fix/webhook-signature` | `/en/fix/webhook-signature` | 결제/외부 연동 시 치명적 |
| 429 Rate Limit | `/fix/rate-limit` | `/en/fix/rate-limit` | 무료 플랜 사용자의 실전 이슈 |

### 2) Agent Recipes Core Pack 확장 (10개)
| 레시피 | ko 경로 | en 경로 | 비고 |
|---|---|---|---|
| React 프로젝트 부트스트랩 | `/recipes/react-bootstrap` | `/en/recipes/react-bootstrap` | Vite 기준 |
| FastAPI API 부트스트랩 | `/recipes/fastapi-bootstrap` | `/en/recipes/fastapi-bootstrap` | `/health`, CORS 포함 |
| Hono API 부트스트랩 | `/recipes/hono-bootstrap` | `/en/recipes/hono-bootstrap` | 최소 라우트/로그 |
| CRUD 엔드포인트 추가 | `/recipes/add-crud-endpoint` | `/en/recipes/add-crud-endpoint` | DTO/검증 포함 |
| 인증 추가(세션/쿠키) | `/recipes/add-auth-cookie` | `/en/recipes/add-auth-cookie` | CORS/쿠키 속성 포함 |
| Cloudflare Pages 배포 | `/recipes/deploy-cloudflare-pages` | `/en/recipes/deploy-cloudflare-pages` | `_redirects` 포함 |
| Cloud Run 배포 | `/recipes/deploy-cloud-run` | `/en/recipes/deploy-cloud-run` | max instances 가드레일 |
| 환경변수 일괄 점검 | `/recipes/check-env-vars` | `/en/recipes/check-env-vars` | 빌드/런타임 분리 |
| 빌드 실패 진단 | `/recipes/debug-build-fail` | `/en/recipes/debug-build-fail` | 로그 요약 프롬프트 |
| PR 품질 점검 | `/recipes/review-pr-quality` | `/en/recipes/review-pr-quality` | 테스트/회귀 체크 |

---

## P1 (다음 분기) - 제품 가치 확장

### 3) 신규 학습 코스 2종
| 코스 | ko 경로 | en 경로 | 목표 |
|---|---|---|---|
| Mini SaaS 코스 | `/path/mini-saas` | `/en/path/mini-saas` | 결제/구독 없는 소형 SaaS 완주 |
| B2B Admin 코스 | `/path/b2b-admin` | `/en/path/b2b-admin` | 인증/권한/감사로그 중심 |

#### Mini SaaS 세부 페이지 (권장)
- `/start/mini-saas/frontend`
- `/start/mini-saas/backend`
- `/start/mini-saas/database`
- `/start/mini-saas/deploy`
- `/start/mini-saas/ops`
- `/start/mini-saas/complete`

#### B2B Admin 세부 페이지 (권장)
- `/start/b2b-admin/frontend`
- `/start/b2b-admin/backend`
- `/start/b2b-admin/auth`
- `/start/b2b-admin/rbac`
- `/start/b2b-admin/deploy`
- `/start/b2b-admin/complete`

### 4) 배포 레퍼런스 확장
| 플랫폼 | ko 경로 | en 경로 | 비고 |
|---|---|---|---|
| Netlify | `/deploy/netlify` | `/en/deploy/netlify` | SPA 리라이트 포함 |
| Railway | `/deploy/railway` | `/en/deploy/railway` | 백엔드 입문 수요 |
| Render | `/deploy/render` | `/en/deploy/render` | 무료 플랜 수요 |
| Fly.io | `/deploy/fly-io` | `/en/deploy/fly-io` | Docker 기반 배포 |
| AWS Amplify | `/deploy/aws-amplify` | `/en/deploy/aws-amplify` | 프론트 배포 수요 |

---

## P2 (중기) - 운영/신뢰성 강화

### 5) Ops 심화 콘텐츠
| 주제 | ko 경로 | en 경로 |
|---|---|---|
| 로그 표준화(JSON 로그) | `/map/ops/logging` | `/en/map/ops/logging` |
| 알림 설정(Slack/Email) | `/map/ops/alerts` | `/en/map/ops/alerts` |
| 백업/복구 전략 | `/map/ops/backup-restore` | `/en/map/ops/backup-restore` |
| 릴리즈/롤백 런북 | `/map/ops/release-rollback` | `/en/map/ops/release-rollback` |
| 비용 가드레일 | `/map/ops/cost-guardrail` | `/en/map/ops/cost-guardrail` |

### 6) Runtime 심화 콘텐츠
| 주제 | ko 경로 | en 경로 |
|---|---|---|
| 멀티 환경(.env.staging/prod) | `/map/runtime/environments` | `/en/map/runtime/environments` |
| Secret Manager 연동 | `/map/runtime/secret-manager` | `/en/map/runtime/secret-manager` |
| 헬스체크/레디니스 | `/map/runtime/health-readiness` | `/en/map/runtime/health-readiness` |

---

## 실행 순서 제안
1. Release 2 묶음 10개 주제(Recipes 6 + Deploy 2 + Ops/Runtime 2) 우선 반영
2. Release 2 모니터링 결과 기준으로 Render/Fly.io/AWS Amplify를 후순위 반영
3. Mini SaaS 코스 공개 후 B2B Admin 코스 착수
4. Ops 심화(`logging`, `alerts`, `backup-restore`)를 Release 3 후보로 이관

## 품질 기준 (모든 신규 페이지 공통)
- 템플릿 고정: `TL;DR`, `Prerequisites`, `Steps`, `Validation`, `Troubleshooting`, `References`.
- 구조화 데이터: `Article + Breadcrumb`, FAQ 가능 시 `FAQPage` 추가.
- ko/en 동시 출시: 한쪽만 출시 금지.
- 링크 품질: References는 공식 문서 우선.
