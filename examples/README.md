# Choorai 예제 프로젝트

> choorai.com 문서와 함께 학습할 수 있는 예제 프로젝트 모음

## 프로젝트 목록

| 프로젝트 | 설명 | API 테스트 | Web 테스트 |
|----------|------|-----------|-----------|
| [b2b-admin](./b2b-admin/) | B2B 관리자 콘솔 (프로젝트 CRUD) | 19 tests | 11 tests |
| [b2c-todo](./b2c-todo/) | 개인용 할 일 관리 (필터링 포함) | 23 tests | 12 tests |

## 공통 기술 스택

### 백엔드
- **FastAPI (Python)** - Primary 튜토리얼 스택
- **Hono (TypeScript)** - 경량 API 스택
- **NestJS (TypeScript)** - 구조화 API 스택
- **Go (chi)** - 저비용 API 스택 예시

### 프론트엔드
- **React 18 + Vite**
- **Vue 3 + Vite**
- **TypeScript 5**
- **TanStack Query**
- **Tailwind CSS**
- **Vitest**

## 빠른 시작

### 1. 프로젝트 선택

```bash
cd examples/b2b-admin  # 또는 b2c-todo
```

### 2. API 실행 (FastAPI 기준)

```bash
cd api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 3. Web 실행 (React 기준, 새 터미널)

```bash
cd web
npm install
npm run dev
```

### 4. 브라우저에서 확인

- **Web**: http://localhost:5173
- **API Docs**: http://localhost:8000/docs

## 테스트 실행

```bash
# FastAPI 테스트
cd api && pytest -v

# React Web 테스트
cd web && npm test
```

각 스택별 테스트:

- `api-hono`: `npm run test:run`
- `api-nest`: `npm run test:e2e`
- `web-vue`: `npm run test:run`

## 학습 경로

1. [**60분 완주**](https://choorai.com/start/60min)
   - 프론트엔드 (React + Vite)
   - 백엔드 (FastAPI)
   - API 연결 (TanStack Query)
   - 배포 (Cloudflare Pages)

2. [**학습 사이클**](https://choorai.com/cycle/0-overview)
   - 심화 학습 콘텐츠
