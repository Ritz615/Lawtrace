"""Documents router — upload, list, retrieve, update, delete, version history."""
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db

router = APIRouter()


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    folder: str = Query(None),
    tags: str = Query(""),
    db: AsyncSession = Depends(get_db),
):
    """Upload a document (PDF, DOCX, image). Triggers async AI processing."""
    # Phase 2: implement MinIO storage + Celery task dispatch
    return {"message": "Document upload endpoint — implemented in Phase 2", "filename": file.filename}


@router.get("/")
async def list_documents(
    folder: str = Query(None),
    tag: str = Query(None),
    search: str = Query(None),
    page: int = Query(1),
    limit: int = Query(20),
    db: AsyncSession = Depends(get_db),
):
    """List documents with search, folder, and tag filters."""
    return {"message": "Document list — implemented in Phase 2", "page": page}


@router.get("/{document_id}")
async def get_document(document_id: str, db: AsyncSession = Depends(get_db)):
    """Get a single document by ID."""
    return {"message": "Document retrieve — implemented in Phase 2", "id": document_id}


@router.delete("/{document_id}")
async def delete_document(document_id: str, db: AsyncSession = Depends(get_db)):
    """Soft-delete a document (moves to archive)."""
    return {"message": "Document archive — implemented in Phase 2", "id": document_id}


@router.get("/{document_id}/versions")
async def get_versions(document_id: str, db: AsyncSession = Depends(get_db)):
    """Get version history for a document."""
    return {"message": "Version history — implemented in Phase 2", "id": document_id}
