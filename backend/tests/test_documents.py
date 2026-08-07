"""pytest tests for documents endpoint."""
import io
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

from app.main import app
from app.core.database import get_db, Base

TEST_DATABASE_URL = "sqlite+aiosqlite:///./test_docs.db"
engine = create_async_engine(TEST_DATABASE_URL, echo=False)
TestSession = async_sessionmaker(engine, expire_on_commit=False)


async def override_get_db():
    async with TestSession() as session:
        yield session


@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    app.dependency_overrides[get_db] = override_get_db
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac


@pytest_asyncio.fixture
async def auth_headers(client: AsyncClient):
    reg = await client.post("/api/v1/auth/register", json={
        "email": "docs@lexai.com", "full_name": "Docs User",
        "password": "SecurePass123", "role": "client",
    })
    token = reg.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_list_documents_empty(client: AsyncClient, auth_headers):
    resp = await client.get("/api/v1/documents/", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["data"]["items"] == []
    assert resp.json()["data"]["total"] == 0


@pytest.mark.asyncio
async def test_list_documents_unauthenticated(client: AsyncClient):
    resp = await client.get("/api/v1/documents/")
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_get_nonexistent_document(client: AsyncClient, auth_headers):
    resp = await client.get(
        "/api/v1/documents/00000000-0000-0000-0000-000000000000",
        headers=auth_headers,
    )
    assert resp.status_code == 404
