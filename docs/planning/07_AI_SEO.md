# AI SEO / Indexing Plan

## 목표
- “질문형/에러형” 문서가 검색 및 LLM 답변에 인용되기 쉬운 구조
- 기술적 SEO 최소 세트 적용

## 문서 템플릿(모든 페이지 강제)
- TL;DR(5줄)
- Prerequisites(3개 이내)
- Steps(번호+코드)
- Validation(성공 기준)
- Troubleshooting(에러 문자열 포함)
- References(공식 문서 우선)
- Last updated + Version

## 제목 규칙(검색 노출 최적)
- 질문형: “Vite SPA 배포했는데 404 나는 이유”
- 에러 문자열 포함: “CORS blocked by… 해결”
- 키워드: Cloud Run, ENV, cookie, redirect, DNS, CNAME

## 기술 파일
- `sitemap.xml`
- `robots.txt`
- 구조화 데이터(FAQ/Article/Breadcrumb)
- canonical/lastmod

## llms.txt(옵션)
- 인덱스 역할로만 사용(효과 보장 X)
- Start/Deploy/Troubleshooting/Reference 핵심 링크만 나열
