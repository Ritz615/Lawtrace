"""Documents router — fully implemented with MinIO storage + Celery AI dispatch."""
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Query, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import decode_token, oauth2_scheme
from app.models.models import Document, User, DocumentStatus
from app.services.storage import storage_service
from app.ai.ocr.extractor import extract_text

router = APIRouter()

ALLOWED_TYPES = {"pdf", "docx", "doc", "png", "jpg", "jpeg", "tiff", "bmp"}


async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)) -> User:
    payload = decode_token(token)
    result = await db.execute(select(User).where(User.id == payload["sub"]))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@router.post("/upload", status_code=201)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    folder: Optional[str] = Query(None),
    tags: Optional[str] = Query(""),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload a PDF/DOCX/image. Stores in MinIO, extracts text via OCR, dispatches AI analysis."""
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in (file.filename or "") else ""
    if ext not in ALLOWED_TYPES:
        raise HTTPException(400, f"File type .{ext} not allowed. Supported: {ALLOWED_TYPES}")

    # Store in MinIO
    try:
        storage_meta = storage_service.upload_file(file, str(current_user.id))
    except Exception as e:
        raise HTTPException(500, f"Storage error: {e}")

    # Create DB record
    tag_list = [t.strip() for t in tags.split(",") if t.strip()] if tags else []
    doc = Document(
        owner_id=current_user.id,
        title=file.filename.rsplit(".", 1)[0],
        original_filename=file.filename,
        file_type=ext,
        file_size=storage_meta["file_size"],
        storage_path=storage_meta["storage_path"],
        folder=folder,
        tags=tag_list,
        status=DocumentStatus.UPLOADED,
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)

    # OCR + embed in background
    background_tasks.add_task(_process_document, str(doc.id), storage_meta["storage_path"], ext)

    return {
        "success": True,
        "data": {
            "id": str(doc.id),
            "title": doc.title,
            "filename": doc.original_filename,
            "status": doc.status.value,
            "file_size": doc.file_size,
        },
        "message": "Document uploaded. AI processing queued.",
    }


async def _process_document(document_id: str, storage_path: str, file_type: str):
    """Background: OCR → embed → dispatch Celery analysis task."""
    from app.core.database import AsyncSessionLocal
    from app.ai.embeddings.chroma import embed_document

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Document).where(Document.id == document_id))
        doc = result.scalar_one_or_none()
        if not doc:
            return

        try:
            doc.status = DocumentStatus.PROCESSING
            await db.commit()

            file_bytes = storage_service.get_file_bytes(storage_path)
            ocr_result = extract_text(file_bytes, file_type)
            doc.extracted_text = ocr_result.get("text", "")
            doc.page_count = ocr_result.get("page_count", 0)

            # Embed for RAG
            if doc.extracted_text:
                embed_document(document_id, doc.extracted_text, {"filename": doc.original_filename})

            # Dispatch Celery task for full AI analysis
            from app.workers.tasks import analyze_document_task
            analyze_document_task.delay(document_id, doc.extracted_text)

            doc.status = DocumentStatus.PROCESSING
            await db.commit()
        except Exception as e:
            doc.status = DocumentStatus.ERROR
            await db.commit()


@router.get("/")
async def list_documents(
    folder: Optional[str] = Query(None),
    tag: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List documents with filters for folder, tag, and full-text search."""
    query = select(Document).where(
        Document.owner_id == current_user.id,
        Document.status != DocumentStatus.ARCHIVED,
    )
    if folder:
        query = query.where(Document.folder == folder)
    if search:
        query = query.where(Document.title.ilike(f"%{search}%"))
    if tag:
        query = query.where(Document.tags.contains([tag]))

    query = query.order_by(Document.created_at.desc())
    result = await db.execute(query.offset((page - 1) * limit).limit(limit))
    docs = result.scalars().all()

    count_result = await db.execute(query)
    total = len(count_result.scalars().all())

    return {
        "success": True,
        "data": {
            "items": [_doc_to_dict(d) for d in docs],
            "total": total,
            "page": page,
            "limit": limit,
        },
    }


@router.get("/{document_id}")
async def get_document(
    document_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Document)
        .where(Document.id == document_id, Document.owner_id == current_user.id)
        .options(selectinload(Document.ai_reports))
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(404, "Document not found")

    data = _doc_to_dict(doc)
    if doc.ai_reports:
        latest = doc.ai_reports[-1]
        data["ai_report"] = {
            "risk_level": latest.risk_level.value if latest.risk_level else None,
            "risk_score": latest.risk_score,
            "executive_summary": latest.executive_summary,
            "clauses": latest.clauses,
            "parties": latest.parties,
        }
    return {"success": True, "data": data}


@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Document).where(Document.id == document_id, Document.owner_id == current_user.id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(404, "Document not found")
    doc.status = DocumentStatus.ARCHIVED
    await db.commit()
    return {"success": True, "message": "Document archived"}


@router.get("/{document_id}/download-url")
async def get_download_url(
    document_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Document).where(Document.id == document_id, Document.owner_id == current_user.id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(404, "Document not found")
    url = storage_service.get_presigned_url(doc.storage_path, expires_minutes=60)
    return {"success": True, "data": {"url": url, "expires_in": 3600}}


@router.get("/{document_id}/versions")
async def get_versions(document_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Document).where(Document.id == document_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(404, "Document not found")
    versions_result = await db.execute(
        select(Document).where(
            or_(Document.id == document_id, Document.parent_id == document_id)
        ).order_by(Document.version)
    )
    versions = versions_result.scalars().all()
    return {"success": True, "data": [_doc_to_dict(v) for v in versions]}


def _doc_to_dict(doc: Document) -> dict:
    return {
        "id": str(doc.id),
        "title": doc.title,
        "original_filename": doc.original_filename,
        "file_type": doc.file_type,
        "file_size": doc.file_size,
        "status": doc.status.value,
        "folder": doc.folder,
        "tags": doc.tags,
        "version": doc.version,
        "page_count": doc.page_count,
        "created_at": doc.created_at.isoformat() if doc.created_at else None,
        "updated_at": doc.updated_at.isoformat() if doc.updated_at else None,
    }
