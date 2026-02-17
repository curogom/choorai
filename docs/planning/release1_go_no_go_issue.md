## Release 정보
- 배포 예정일: 2026-02-23 (월)
- 대상 브랜치/태그: [to-fill]
- 담당자: [to-fill]

## Scope 확인
- [ ] Fix 신규 5개(ko/en) 반영 확인
  - mixed-content / gateway-timeout / build-oom / preflight-405 / webhook-signature
- [ ] Recipes 신규 4개(ko/en) 반영 확인
  - deploy-cloudflare-pages / deploy-cloud-run / debug-build-fail / check-env-vars

## Gate A - 기술 검증
- [ ] `npm -C site run build` 성공
- [ ] 신규 페이지 링크 404 없음
- [ ] ko/en 라우트 정상 렌더링

## Gate B - 콘텐츠 품질
- [ ] TL;DR/실행 단계/참고 링크 포함
- [ ] 오탈자 및 잘못된 명령어 없음
- [ ] 내부 링크 정상 동작

## Gate C - 운영 준비
- [ ] 배포/검증 담당자 확정
- [ ] 롤백 기준 확정
- [ ] 72시간 모니터링 담당자 확정

## 최종 판단
- [ ] GO
- [ ] NO-GO

## 비고
- 기준 문서: `docs/planning/12_RELEASE_1_CHECKLIST.md`
