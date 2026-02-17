# Release 2 운영 체크리스트 (Go/No-Go)

기준일: 2026-02-17  
권장 배포일: 2026-03-09 (월) 10:00 KST

## 1) 릴리스 범위 (Draft)
- Recipes 6개(ko/en)
  - `react-bootstrap`
  - `fastapi-bootstrap`
  - `hono-bootstrap`
  - `add-crud-endpoint`
  - `add-auth-cookie`
  - `review-pr-quality`
- Deploy 레퍼런스 2개(ko/en)
  - `netlify`
  - `railway`
- Runtime/Ops 심화 2개(ko/en)
  - `runtime/environments`
  - `ops/release-rollback`

## 2) Go/No-Go 게이트

### Gate A: 기술 검증
- [ ] `npm -C site run build` 성공
- [ ] 신규 페이지 내부 링크 404 0건
- [ ] ko/en 라우트 렌더링 오류 0건
- [ ] 구조화 데이터(Article + Breadcrumb) 누락 0건

### Gate B: 콘텐츠 품질
- [ ] 모든 신규 문서에 `TL;DR`, `Prerequisites`, `Steps`, `Validation`, `Troubleshooting`, `References` 포함
- [ ] ko/en 문서 쌍 누락 0건
- [ ] 코드/명령어 오탈자 재현 불가
- [ ] References는 공식 문서 우선

### Gate C: 운영 승인 (#13 입력 반영)
- [ ] Release 1 모니터링(#13)에서 치명 이슈 0건
- [ ] Release 1 모니터링(#13) 이관 백로그가 Release 2 범위 문서에 반영됨
- [ ] 배포 담당/검증 담당/모니터링 담당 지정 완료
- [ ] 롤백 트리거와 핫픽스 담당자 확정

## 3) No-Go 조건
- Gate A/B/C 중 미완료 항목 존재
- 신규 페이지에서 메인 플로우 404가 1건 이상 재현
- 배포 준비 시점까지 담당자 미지정

## 4) 배포 당일 절차
1. 최종 빌드 및 링크 검증
2. 샘플 페이지 점검(ko/en 각 5페이지 이상)
3. Search Console 색인 제출
4. 72시간 모니터링 이슈 오픈 및 담당자 확인

## 5) 72시간 모니터링 기준

### 0~24시간
- [ ] 404/500 급증 여부 확인
- [ ] 신규 페이지 접근/렌더링 이상치 확인
- [ ] 초기 사용자 피드백 수집

### 24~48시간
- [ ] 상위 유입 키워드/랜딩 페이지 점검
- [ ] Recipes 상세 클릭/복사 이벤트 점검
- [ ] 제목/요약 개선 대상 페이지 기록

### 48~72시간
- [ ] 치명 이슈 핫픽스 필요 여부 판단
- [ ] Release 3 이관 항목 분류
- [ ] 결과 요약(성과/이슈/후속 액션) 작성

## 6) 릴리스 종료 기준
- 치명 장애 0건
- 신규 페이지 접근성 정상
- 다음 릴리스 이관 항목이 이슈/문서에 반영됨
