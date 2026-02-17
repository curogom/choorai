## Release 정보
- 배포 예정일 (KST): 2026-03-09 10:00
- 대상 브랜치/태그: [to-fill]
- 배포 담당자: [to-fill]
- 검증 담당자: [to-fill]

## Scope 확인
- [ ] Recipes 신규 6개(ko/en) 반영 확인
  - react-bootstrap / fastapi-bootstrap / hono-bootstrap / add-crud-endpoint / add-auth-cookie / review-pr-quality
- [ ] Deploy 신규 2개(ko/en) 반영 확인
  - netlify / railway
- [ ] Runtime/Ops 신규 2개(ko/en) 반영 확인
  - runtime/environments / ops/release-rollback

## Gate A - 기술 검증
- [ ] `npm -C site run build` 성공
- [ ] 신규 페이지 내부 링크 404 없음
- [ ] ko/en 라우트 정상 렌더링
- [ ] 구조화 데이터 누락 없음

## Gate B - 콘텐츠 품질
- [ ] TL;DR/실행 단계/검증/참고 링크 포함
- [ ] ko/en 문서 쌍 누락 없음
- [ ] 오탈자 및 잘못된 명령어 없음
- [ ] 내부 링크 정상 동작

## Gate C - 운영 승인
- [ ] Release 1 모니터링(#13) 결과 반영 완료
- [ ] 배포/검증/모니터링 담당 확정
- [ ] 롤백 기준 확정
- [ ] 72시간 모니터링 이슈 생성

## 최종 판단
- [ ] GO
- [ ] NO-GO

## 비고
- 기준 문서: `docs/planning/14_RELEASE_2_CHECKLIST.md`
- 범위 문서: `docs/planning/13_RELEASE_2_SCOPE_DRAFT.md`
