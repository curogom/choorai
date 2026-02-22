# Release 2 QA Gate Report (Issue #18)

작성일: 2026-02-17 (KST)  
기준 브랜치: `codex/release2-qa-gate`

## 1) 실행 범위
- 대상: Release 2 신규 콘텐츠 10개 주제 x ko/en = 20페이지
- 기준 문서: `docs/planning/14_RELEASE_2_CHECKLIST.md`

## 2) 실행 명령
```bash
npm -C site run build
node site/scripts/release2-qa-audit.mjs
```

## 3) 핵심 결과
- Gate A: 통과
  - build 성공
  - 신규 20페이지 렌더링 실패 0건
  - 신규 20페이지 내부 링크 404 0건
  - 구조화 데이터(Article + BreadcrumbList) 누락 0건
- Gate B: 미통과
  - 템플릿 섹션(`TL;DR`, `Prerequisites`, `Steps`, `Validation`, `Troubleshooting`, `References`) 누락 페이지: 20/20
  - ko/en 문서 쌍 누락: 0건

## 4) 이번 반영 사항 (Gate A blocker 해소)
- `/deploy`, `/en/deploy` 인덱스 페이지 추가
  - 기존 deploy 상세 페이지 breadcrumb가 가리키던 상위 경로 404 해소
- 반영 파일:
  - `site/src/pages/deploy/index.astro`
  - `site/src/pages/en/deploy/index.astro`
  - `site/src/i18n/navigation.ts`
  - `site/src/data/pageOrder.ts`

## 5) Gate B blocker 정리
- 공통 blocker:
  - 신규 20페이지 모두 템플릿 필수 섹션 일부 누락
- 누락 패턴:
  - Recipes: `Prerequisites`, `Troubleshooting` 공통 누락 + 일부 `TL;DR/Steps/Validation/References` 누락
  - Deploy: `Prerequisites`, `Steps`, `Troubleshooting`, `References` 중심 누락
  - Runtime/Ops: `TL;DR`, `Prerequisites`, `Steps`, `Troubleshooting`, `References` 누락

## 6) 권장 후속 조치
1. Release 2 신규 20페이지에 템플릿 섹션 표준화 적용
2. References를 공식 문서 우선으로 보강 (플랫폼/프레임워크 공식 링크)
3. 표준화 반영 후 `node site/scripts/release2-qa-audit.mjs` 재실행으로 Gate B 재검증

## 7) 재검증 결과 (Issue #22)
- 재검증 시각: 2026-02-17 (KST)
- 실행 브랜치: `codex/release2-gateb-template-standardization`
- 실행 명령:
  - `npm -C site run build`
  - `node site/scripts/release2-qa-audit.mjs`
- 결과:
  - `routeRenderFailures = 0`
  - `linkFailures = 0`
  - `jsonLdFailures = 0`
  - `templateFailures = 0`
  - `pairFailures = 0`
- 조치 요약:
  - `site/src/components/TemplateSections.astro` 공통 템플릿 섹션 컴포넌트 추가
  - Release 2 대상 20페이지에 템플릿 섹션 + 공식 문서 References 연결
  - `site/scripts/release2-qa-audit.mjs`를 렌더 결과 기반 점검으로 개선
