"""Reports router."""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db

router = APIRouter()


@router.post("/generate/{document_id}")
async def generate_report(document_id: str, db: AsyncSession = Depends(get_db)):
    return {"message": "Report generation — implemented in Phase 5", "id": document_id}


@router.get("/{report_id}/download/pdf")
async def download_pdf(report_id: str, db: AsyncSession = Depends(get_db)):
    return {"message": "PDF download — implemented in Phase 5", "id": report_id}


@router.get("/{report_id}/download/docx")
async def download_docx(report_id: str, db: AsyncSession = Depends(get_db)):
    return {"message": "DOCX download — implemented in Phase 5", "id": report_id}
