# B2B Admin Console

> choorai.com "60분 완주" 튜토리얼 예제 프로젝트

## 구조

```
b2b-admin/
├── api/          # FastAPI 백엔드
│   ├── app/      # 애플리케이션 코드
│   └── tests/    # pytest 테스트 (19 tests)
└── web/          # React + Vite 프론트엔드
    └── src/      # 소스 코드 + 테스트 (11 tests)
```

## 기능

| 기능 | API | Web |
|------|-----|-----|
| Health Check | ✅ | ✅ |
| 프로젝트 목록 | ✅ | ✅ |
| 프로젝트 생성 | ✅ | ✅ |
| 프로젝트 상세 | ✅ | ✅ |
| 프로젝트 수정 | ✅ | ✅ |
| 프로젝트 삭제 | ✅ | ✅ |

## 개발

### API (FastAPI)

```bash
cd api

# 가상환경 설정
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 서버 실행 (포트 8000)
uvicorn app.main:app --reload

# 테스트
pytest -v
```

### Web (React + Vite)

```bash
cd web

# 의존성 설치
npm install

# 개발 서버 (포트 5173)
npm run dev

# 테스트
npm test

# 빌드
npm run build
```

## API 문서

서버 실행 후:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 기술 스택

### API
- FastAPI 0.115
- Pydantic 2.9
- pytest

### Web
- React 18
- TypeScript 5
- TanStack Query 5
- React Router 6
- Tailwind CSS 3
- Vitest
