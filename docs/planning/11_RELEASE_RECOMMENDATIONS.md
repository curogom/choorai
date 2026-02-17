# Choorai 출시 권장 포인트 (기준일: 2026-02-16)

## 목적
- 콘텐츠 확장을 “한 번에 대량 공개”하지 않고, 검색 유입/오류율/완주율을 기준으로 단계적으로 출시한다.
- 각 단계는 명확한 Go/No-Go 기준을 가진다.

---

## 출시 트랙 권장안

## Release 1 - Fix 확장 1차
- 권장 출시일: **2026-02-23 (월)**
- 범위:
  - 신규 트러블슈팅 5개 (`dns-nxdomain`, `ssl-cert`, `failed-to-fetch`, `node-version`, `rate-limit`)
  - ko/en 동시 공개
  - Fix 인덱스/사이드바 노출
- 기대효과:
  - 검색성 높은 에러 키워드 유입 증가
  - 기존 Top5의 연관 문서 체류시간 개선

### Go 기준
- `npm run build` 성공
- 신규 10페이지(ko/en)에서 404 링크 0건
- Search Console 색인 제출 완료

### No-Go 기준
- 페이지별 구조화 데이터 에러 발생
- 내부 링크 깨짐 1건 이상

---

## Release 2 - Fix 확장 2차 + Recipes 선공개
- 권장 출시일: **2026-03-09 (월)**
- 범위:
  - 트러블슈팅 추가 5개 (`gateway-timeout`, `mixed-content`, `build-oom`, `preflight-405`, `webhook-signature`)
  - Recipes 4개 선공개 (`deploy-cloudflare-pages`, `deploy-cloud-run`, `debug-build-fail`, `check-env-vars`)
- 기대효과:
  - 트러블슈팅 → Recipes 전환 동선 강화
  - “문제 해결 + 재발 방지” 흐름 구축

### Go 기준
- Release 1 이후 2주 동안:
  - 신규 Fix 페이지 평균 체류시간 40초 이상
  - 신규 Fix 페이지 이탈률 급증 없음(기존 대비 +15% 이내)
  - 치명적 사용자 피드백 0건

---

## Release 3 - 코스 확장 Alpha
- 권장 출시일: **2026-03-30 (월)**
- 범위:
  - `mini-saas` 코스 베타 공개 (필수 단계만)
  - `b2b-admin` 코스는 Preview 라벨로 일부만 공개
- 기대효과:
  - Path 체류시간 증가
  - 60분 완주 이후의 “다음 단계” 제공

### Go 기준
- Release 2 시점에서:
  - `start_60min` 대비 `complete_step_6` 전환율 추적 안정
  - Fix 페이지 유입 대비 Recipes 클릭률 확인 가능

---

## Release 4 - 정식 확장
- 권장 출시일: **2026-04-20 (월)**
- 범위:
  - Mini SaaS 정식
  - B2B Admin 정식
  - Deploy 레퍼런스 2개 추가 (Netlify, Railway)
- 기대효과:
  - 중급 사용자 유입 확대
  - 외부 커뮤니티 공유 가치 상승

---

## 운영 권장 포인트

## 1) 콘텐츠 공개 단위
- 1회 배포당 신규 상세 문서는 **최대 10페이지(ko/en 합산 20)**를 넘기지 않는다.
- 이유: 색인 지연/품질 리스크를 줄이고 피드백 반영 속도를 높이기 위함.

## 2) 출시 요일/시간
- 권장: **월요일 오전 10시 KST**
- 이유: 주중 모니터링/핫픽스 대응 시간을 확보하기 쉬움.

## 3) 출시 후 72시간 집중 모니터링
- 확인 항목:
  - Search Console 색인 상태
  - 404/500 로그
  - GA4 이벤트 이상치 (`start_60min`, `complete_step_*`, `copy_prompt`)
  - FeedbackBox 신규 제보

## 4) KPI 기반 다음 릴리스 결정
- 신규 Fix 문서 클릭수 상위 30% 주제는 Recipes 우선 연계
- 클릭수 하위 30% 문서는 제목/요약 개선 후 재평가

---

## 최종 권장
1. 2026-02-23에 Release 1 즉시 배포
2. 2주 지표 확인 후 2026-03-09에 Release 2 배포
3. 코스 확장은 2026-03-30 Alpha, 2026-04-20 정식으로 단계 분리
