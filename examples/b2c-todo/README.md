# B2C Todo App

> 개인용 할 일 관리 애플리케이션 예제

## 구조

```
b2c-todo/
├── api/          # FastAPI 백엔드
│   ├── app/      # 애플리케이션 코드
│   └── tests/    # pytest 테스트 (23 tests)
└── web/          # React + Vite 프론트엔드
    └── src/      # 소스 코드 + 테스트 (12 tests)
```

## 기능

| 기능 | API | Web |
|------|-----|-----|
| Health Check | ✅ | ✅ |
| 할 일 목록 | ✅ | ✅ |
| 할 일 생성 | ✅ | ✅ |
| 할 일 수정 | ✅ | ✅ |
| 할 일 삭제 | ✅ | ✅ |
| 완료 토글 | ✅ | ✅ |
| 상태 필터링 | ✅ | ✅ |

## 개발

### API (FastAPI)

```bash
cd api

# 가상환경 설정
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 서버 실행 (포트 8001 권장)
uvicorn app.main:app --reload --port 8001

# 테스트
pytest -v
```

### Web (React + Vite)

```bash
cd web

# 의존성 설치
npm install

# 개발 서버 (포트 5174 권장)
npm run dev -- --port 5174

# 테스트
npm test

# 빌드
npm run build
```

## API 문서

서버 실행 후:
- Swagger UI: http://localhost:8001/docs
- ReDoc: http://localhost:8001/redoc

## API 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| GET | /health | 헬스 체크 |
| GET | /api/v1/todos | 목록 조회 (?completed=true/false) |
| POST | /api/v1/todos | 생성 |
| GET | /api/v1/todos/{id} | 상세 조회 |
| PUT | /api/v1/todos/{id} | 수정 |
| DELETE | /api/v1/todos/{id} | 삭제 |

## 데이터 모델

```typescript
interface Todo {
  id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}
```

## 기술 스택

### API
- FastAPI 0.115
- Pydantic 2.9
- pytest

### Web
- React 18
- TypeScript 5
- TanStack Query 5
- Tailwind CSS 3
- Vitest
