"""
LexAI FastAPI Application Entry Point
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1 import auth, documents, contracts, ai, reports, analytics, notifications


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle events."""
    # Startup
    async with engine.begin() as conn:
        # Create tables (use Alembic in production)
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Shutdown
    await engine.dispose()


limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title=settings.APP_NAME,
    description="Enterprise AI Contract Lifecycle Management Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── Middleware ─────────────────────────────────────────────────────────────────
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
API_V1 = settings.API_PREFIX
app.include_router(auth.router, prefix=f"{API_V1}/auth", tags=["Authentication"])
app.include_router(documents.router, prefix=f"{API_V1}/documents", tags=["Documents"])
app.include_router(contracts.router, prefix=f"{API_V1}/contracts", tags=["Contracts"])
app.include_router(ai.router, prefix=f"{API_V1}/ai", tags=["AI"])
app.include_router(reports.router, prefix=f"{API_V1}/reports", tags=["Reports"])
app.include_router(analytics.router, prefix=f"{API_V1}/analytics", tags=["Analytics"])
app.include_router(notifications.router, prefix=f"{API_V1}/notifications", tags=["Notifications"])


@app.get("/", tags=["Health"])
async def root():
    return {"name": settings.APP_NAME, "status": "running", "version": "1.0.0"}


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy"}
