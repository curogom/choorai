# Choorai 예제 프로젝트

> choorai.com 문서와 함께 학습할 수 있는 예제 프로젝트 모음

## 프로젝트 목록

| 프로젝트 | 설명 | API 테스트 | Web 테스트 |
|----------|------|-----------|-----------|
| [b2b-admin](./b2b-admin/) | B2B 관리자 콘솔 (프로젝트 CRUD) | 19 tests | 11 tests |
| [b2c-todo](./b2c-todo/) | 개인용 할 일 관리 (필터링 포함) | 23 tests | 12 tests |

## 공통 기술 스택

### 백엔드
- **Python 3.9+**
- **FastAPI** - 웹 프레임워크
- **Pydantic** - 데이터 검증
- **pytest** - 테스트

### 프론트엔드
- **React 18** - UI 라이브러리
- **TypeScript 5** - 타입 안전성
- **Vite 5** - 빌드 도구
- **TanStack Query** - 서버 상태 관리
- **Tailwind CSS** - 스타일링
- **Vitest** - 테스트

## 빠른 시작

### 1. 프로젝트 선택

```bash
cd examples/b2b-admin  # 또는 b2c-todo
```

### 2. API 실행

```bash
cd api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 3. Web 실행 (새 터미널)

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
# API 테스트
cd api && pytest -v

# Web 테스트
cd web && npm test
```

## 학습 경로

1. **60분 완주** - https://choorai.com/start/60min
   - 프론트엔드 (React + Vite)
   - 백엔드 (FastAPI)
   - API 연결 (TanStack Query)
   - 배포 (Cloudflare Pages)

2. **학습 사이클** - https://choorai.com/cycle/0-overview
   - 심화 학습 콘텐츠
