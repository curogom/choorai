# B2B Admin API (FastAPI)

> Python + FastAPI 기반 백엔드

## 설정 예정

- [ ] FastAPI 프로젝트 초기화
- [ ] Health Check 엔드포인트
- [ ] Projects CRUD
- [ ] 구조화 로깅
- [ ] CORS 설정
- [ ] Dockerfile

## 개발

```bash
# 가상환경 생성
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt

# 개발 서버
uvicorn main:app --reload --port 8000
```

## 배포

Cloud Run으로 배포됩니다.

- `min-instances: 0`
- `max-instances: 1`
