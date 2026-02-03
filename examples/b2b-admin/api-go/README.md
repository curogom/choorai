# B2B Admin API (Go)

> Go + Chi Router 기반 백엔드

## 특징

- **빠른 시작**: 단일 바이너리로 즉시 실행
- **작은 이미지**: Docker 이미지 < 20MB
- **낮은 메모리**: 최소 메모리 사용량
- **동시성**: Go의 goroutine으로 높은 동시 처리

## 개발

```bash
# 의존성 설치
go mod download

# 개발 서버 (hot reload with air)
go run main.go

# 또는 빌드 후 실행
go build -o server .
./server
```

## API 엔드포인트

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | 헬스 체크 |
| GET | `/api/v1/projects` | 프로젝트 목록 |
| POST | `/api/v1/projects` | 프로젝트 생성 |
| GET | `/api/v1/projects/:id` | 프로젝트 조회 |
| PUT | `/api/v1/projects/:id` | 프로젝트 수정 |
| DELETE | `/api/v1/projects/:id` | 프로젝트 삭제 |

## Docker

```bash
# 빌드
docker build -t b2b-admin-api-go .

# 실행
docker run -p 8080:8080 b2b-admin-api-go
```

## 배포

Cloud Run으로 배포됩니다.

```bash
# Cloud Run 배포
gcloud run deploy b2b-admin-api \
  --source . \
  --region asia-northeast3 \
  --allow-unauthenticated \
  --min-instances 0 \
  --max-instances 1
```
