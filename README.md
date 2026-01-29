# choorai.com

> **개발 한 숟갈, 츄라이 츄라이.**

코딩을 전혀 모르는 사람이 AI Agent를 활용해 **작동하는 웹서비스**를 만들고 배포까지 가도록 돕는 문서형 참고서입니다.

## 목표

- **60분 내 배포 완주** - URL 생성까지 경험 제공
- **스택 독립 표준 플로우** - 언어/프레임워크가 바뀌어도 유지되는 구조
- **운영비 0원** 유지 가능한 설계

## 누구를 위한 프로젝트인가요?

- 프로그래밍 지식 0, "바이브 코딩으로 뭐 만들고 싶은" 분
- 형식 있는 배포/운영 템플릿이 필요한 입문자

## 주요 콘텐츠

| 섹션 | 설명 |
|------|------|
| **Start 60min** | 60분 만에 배포까지 완주하는 튜토리얼 |
| **Cycle 0~6** | DNS → Front → Backend → DB → Runtime → Ops 학습 사이클 |
| **Troubleshooting** | CORS, ENV, SPA 404 등 자주 막히는 문제 해결 |
| **Agent Recipes** | AI에게 복사해서 주는 프롬프트 팩 |
| **Reference Project** | B2B Admin Console 샘플 프로젝트 |

## 기술 스택

### choorai.com (문서 사이트)
| 구분 | 기술 |
|------|------|
| 프레임워크 | VitePress / Astro |
| 배포 | Cloudflare Pages |

### 예시 프로젝트 (문서에서 가르치는 샘플)
| 구분 | Primary (MVP) | Secondary (추후) |
|------|---------------|------------------|
| Frontend | React (Vite) | - |
| Backend | Python (FastAPI) | Go |
| 배포 | Cloudflare Pages + Cloud Run | 동일 |
| Contract | OpenAPI | 동일 |

## 프로젝트 구조

```
choorai/
├── site/                    # choorai.com 문서 사이트
│   └── (VitePress/Astro)
├── examples/                # 예시 프로젝트
│   └── b2b-admin/
│       ├── web/             # React + Vite
│       ├── api/             # Python + FastAPI
│       └── api-go/          # Go (추후 추가)
├── contracts/
│   └── openapi.yaml         # API 스펙
├── docs/
│   ├── planning/            # 기획 문서
│   └── development/         # 개발 문서
├── README.md
├── LICENSE
└── Makefile
```

## 시작하기

```bash
# 저장소 클론
git clone https://github.com/your-org/choorai.git
cd choorai

# 의존성 설치 (추후 추가)
# pnpm install

# 로컬 실행 (추후 추가)
# make dev
```

## 문서

- [기획 문서](docs/planning/) - PRD, IA, 학습 사이클 등
- [개발 문서](docs/development/) - 개발 계획, 기술 가이드

## 라이센스

이 프로젝트는 [CC BY-NC-SA 4.0](LICENSE) 라이센스를 따릅니다.

- 저작자 표시 필수
- 비상업적 사용만 허용
- 동일 조건 변경 허락

## 기여

이슈와 PR은 언제나 환영합니다!

---

**choorai.com** - 코딩 몰라도 괜찮아요. 츄라이 츄라이!
