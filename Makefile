.PHONY: help dev dev-site dev-api dev-web build clean install lint test test-api test-web test-b2c-api test-b2c-web

# 기본 타겟
help:
	@echo "choorai.com 개발 명령어"
	@echo ""
	@echo "사용법: make [타겟]"
	@echo ""
	@echo "개발:"
	@echo "  dev          전체 개발 환경 실행 (docker-compose)"
	@echo "  dev-site     문서 사이트만 실행"
	@echo "  dev-api      API 서버만 실행"
	@echo "  dev-web      예시 웹 앱만 실행"
	@echo ""
	@echo "빌드:"
	@echo "  build        전체 빌드"
	@echo "  build-site   문서 사이트 빌드"
	@echo "  build-api    API 도커 이미지 빌드"
	@echo ""
	@echo "유틸:"
	@echo "  install      의존성 설치"
	@echo "  lint         린트 실행"
	@echo "  test         전체 테스트 실행"
	@echo "  test-api     B2B Admin API 테스트"
	@echo "  test-web     B2B Admin Web 테스트"
	@echo "  test-b2c-api B2C Todo API 테스트"
	@echo "  test-b2c-web B2C Todo Web 테스트"
	@echo "  clean        빌드 결과물 삭제"

# === 개발 환경 ===

dev:
	docker-compose up

dev-site:
	cd site && npm run dev

dev-api:
	cd examples/b2b-admin/api && uvicorn app.main:app --reload --port 8000

dev-web:
	cd examples/b2b-admin/web && npm run dev

# === 빌드 ===

build: build-site build-api

build-site:
	cd site && npm run build

build-api:
	docker build -t choorai-api:latest -f examples/b2b-admin/api/Dockerfile examples/b2b-admin/api

# === 의존성 설치 ===

install: install-site install-web install-api

install-site:
	cd site && npm install

install-web:
	cd examples/b2b-admin/web && npm install

install-api:
	cd examples/b2b-admin/api && pip install -r requirements.txt

# === 린트 & 테스트 ===

lint:
	@echo "TODO: 린트 설정 필요"

test: test-api test-web test-b2c-api test-b2c-web

test-api:
	cd examples/b2b-admin/api && pytest -v

test-web:
	cd examples/b2b-admin/web && npm run test:run

test-b2c-api:
	cd examples/b2c-todo/api && pytest -v

test-b2c-web:
	cd examples/b2c-todo/web && npm run test:run

# === 정리 ===

clean:
	rm -rf site/.vitepress/dist
	rm -rf site/dist
	rm -rf examples/b2b-admin/web/dist
	rm -rf examples/b2c-todo/web/dist
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
