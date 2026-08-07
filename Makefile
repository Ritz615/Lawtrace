.PHONY: help dev stop restart logs clean install-backend install-frontend migrate seed test-backend test-frontend

# ── Help ──────────────────────────────────────────────────────────────────────
help:
	@echo "LexAI – Available Commands"
	@echo ""
	@echo "  make dev              Start all services (Docker Compose)"
	@echo "  make stop             Stop all services"
	@echo "  make restart          Restart all services"
	@echo "  make logs             Tail logs for all services"
	@echo "  make logs-backend     Tail backend logs only"
	@echo "  make logs-frontend    Tail frontend logs only"
	@echo ""
	@echo "  make install-backend  Install Python dependencies"
	@echo "  make install-frontend Install Node dependencies"
	@echo "  make migrate          Run Alembic database migrations"
	@echo "  make seed             Seed the database with demo data"
	@echo ""
	@echo "  make test-backend     Run backend tests (pytest)"
	@echo "  make test-frontend    Run frontend tests (Jest)"
	@echo "  make test-e2e         Run E2E tests (Playwright)"
	@echo ""
	@echo "  make clean            Stop + remove all containers and volumes"
	@echo "  make pull-llm         Pull Llama 3 model via Ollama"

# ── Docker ────────────────────────────────────────────────────────────────────
dev:
	docker-compose up -d
	@echo "✅ LexAI is running!"
	@echo "   Frontend: http://localhost:3000"
	@echo "   Backend:  http://localhost:8000"
	@echo "   API Docs: http://localhost:8000/docs"
	@echo "   MinIO:    http://localhost:9001"

stop:
	docker-compose down

restart:
	docker-compose down && docker-compose up -d

logs:
	docker-compose logs -f

logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

logs-celery:
	docker-compose logs -f celery_worker

# ── Installation ──────────────────────────────────────────────────────────────
install-backend:
	cd backend && pip install -r requirements.txt

install-frontend:
	cd frontend && npm install

install: install-backend install-frontend

# ── Database ──────────────────────────────────────────────────────────────────
migrate:
	cd backend && alembic upgrade head

migrate-create:
	cd backend && alembic revision --autogenerate -m "$(name)"

migrate-down:
	cd backend && alembic downgrade -1

seed:
	cd backend && python -m app.scripts.seed_db

# ── Testing ───────────────────────────────────────────────────────────────────
test-backend:
	cd backend && pytest tests/ -v --cov=app --cov-report=term-missing

test-frontend:
	cd frontend && npm run test

test-e2e:
	cd frontend && npx playwright test

test: test-backend test-frontend

# ── AI ────────────────────────────────────────────────────────────────────────
pull-llm:
	ollama pull llama3
	@echo "✅ Llama 3 model ready"

# ── Cleanup ───────────────────────────────────────────────────────────────────
clean:
	docker-compose down -v --remove-orphans
	@echo "✅ All containers and volumes removed"

clean-cache:
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -name "*.pyc" -delete 2>/dev/null || true
	cd frontend && rm -rf .next node_modules/.cache

# ── Git ───────────────────────────────────────────────────────────────────────
push:
	git add .
	git commit -m "$(msg)"
	git push origin $(branch)

setup-branches:
	git checkout -b dev && git push -u origin dev
	git checkout main
