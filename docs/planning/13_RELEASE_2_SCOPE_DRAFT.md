# Release 2 범위 초안 (기준일: 2026-02-17)

## 목적
- Release 1 모니터링 결과를 반영해 Release 2 범위/일정/Go-No-Go 조건을 확정한다.
- 추가 콘텐츠를 한 번에 과도하게 늘리지 않고, `최대 10개 주제(ko/en 동시)` 단위로 운영한다.

## 입력 이슈
- Release 1 Go/No-Go: [#12](https://github.com/curogom/choorai/issues/12) (closed)
- Release 1 72시간 모니터링: [#13](https://github.com/curogom/choorai/issues/13) (open)
- Release 2 준비: [#14](https://github.com/curogom/choorai/issues/14) (open)

## 목표 일정 (KST)
- Scope Draft: 2026-02-24
- Scope Freeze: 2026-02-27
- 구현/QA: 2026-03-02 ~ 2026-03-07
- 배포 목표: 2026-03-09 (월) 10:00

## Release 2 추가 콘텐츠 리스트업 (Draft)

### P1. Recipes 확장 (6개)
| 주제 | ko 경로 | en 경로 | 비고 |
|---|---|---|---|
| React 프로젝트 부트스트랩 | `/recipes/react-bootstrap` | `/en/recipes/react-bootstrap` | Vite 기준 기본 구성 |
| FastAPI API 부트스트랩 | `/recipes/fastapi-bootstrap` | `/en/recipes/fastapi-bootstrap` | `/health` + CORS 포함 |
| Hono API 부트스트랩 | `/recipes/hono-bootstrap` | `/en/recipes/hono-bootstrap` | 경량 API 시작점 |
| CRUD 엔드포인트 추가 | `/recipes/add-crud-endpoint` | `/en/recipes/add-crud-endpoint` | DTO/검증 포함 |
| 인증 추가(세션/쿠키) | `/recipes/add-auth-cookie` | `/en/recipes/add-auth-cookie` | CORS/쿠키 속성 체크 |
| PR 품질 점검 | `/recipes/review-pr-quality` | `/en/recipes/review-pr-quality` | 회귀/테스트 점검 루틴 |

### P1. Deploy 레퍼런스 확장 (2개)
| 플랫폼 | ko 경로 | en 경로 | 비고 |
|---|---|---|---|
| Netlify | `/deploy/netlify` | `/en/deploy/netlify` | SPA rewrite 포함 |
| Railway | `/deploy/railway` | `/en/deploy/railway` | 백엔드 입문 수요 대응 |

### P1. 운영/런타임 심화 (2개)
| 주제 | ko 경로 | en 경로 | 비고 |
|---|---|---|---|
| 멀티 환경 운영 | `/map/runtime/environments` | `/en/map/runtime/environments` | `.env` 계층 분리 |
| 릴리즈/롤백 런북 | `/map/ops/release-rollback` | `/en/map/ops/release-rollback` | 장애 대응 표준화 |

## 총량 관리/컷라인
- 초안 총량: 10개 주제 x 2언어 = 20페이지
- 컷라인:
  - #13 모니터링에서 치명 이슈 발생 시 `운영/런타임 2개`는 Release 3로 이관
  - 이슈가 없고 QA 일정이 안정적이면 10개 전체 유지

## 검색/유입 관점 제목/요약 개선 후보 (Release 2 병행)
| 페이지 | 개선 초점 |
|---|---|
| `/fix/failed-to-fetch` | 증상 키워드를 제목 앞부분으로 이동 (`TypeError`, `CORS`, `DNS`) |
| `/fix/gateway-timeout` | 502/504 키워드와 Nginx/Proxy 원인 분리 |
| `/fix/build-fail` | 프레임워크별 빌드 실패 키워드(Next.js/Vite) 보강 |
| `/fix/cors` | Preflight/credential 조합 케이스를 요약에 명시 |
| `/recipes/deploy-cloudflare-pages` | `_redirects`/SPA 404 키워드를 제목에 반영 |
| `/recipes/deploy-cloud-run` | `max instances`, `cold start` 키워드 요약 강화 |

## 잠정 담당
- 콘텐츠 작성: `@curogom`
- QA 검증: `@curogom`
- 배포/모니터링: `@curogom`

## Scope Freeze 전 필수 입력 (#13)
- 72시간 내 치명 이슈/핫픽스 발생 여부
- 신규 Fix 페이지 상위 유입 키워드
- Recipes 상세 클릭/복사 이벤트 추세
- 이탈률 급증 페이지(기존 대비 +15% 이상) 여부
