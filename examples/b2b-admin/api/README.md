# B2B Admin API (FastAPI)

> Python + FastAPI 기반 백엔드

## 구현 범위

- Health Check (`GET /health`)
- Projects CRUD (`/api/v1/projects`)
- 페이지네이션 (`page`, `page_size`)
- CORS 설정
- Dockerfile 포함

## 개발

```bash
# 가상환경 생성
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt

# 개발 서버
uvicorn app.main:app --reload --port 8000

# 테스트
pytest -v
```

## 배포

Cloud Run으로 배포됩니다.

- `min-instances: 0`
- `max-instances: 1`
