"""AI router — fully implemented with RAG, analysis, comparison, generation."""
import uuid
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import decode_token, oauth2_scheme
from app.models.models import Document, AIReport, User, RiskLevel, ContractType

router = APIRouter()


async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)) -> User:
    payload = decode_token(token)
    result = await db.execute(select(User).where(User.id == payload["sub"]))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


class AnalyzeRequest(BaseModel):
    document_id: str


class ChatRequest(BaseModel):
    document_id: str
    question: str
    conversation_history: list = []


class CompareRequest(BaseModel):
    document_id_a: str
    document_id_b: str


class GenerateRequest(BaseModel):
    contract_type: str
    form_data: dict


@router.post("/analyze")
async def analyze_document(
    payload: AnalyzeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Trigger AI analysis on a document. Returns analysis result or queues Celery job."""
    result = await db.execute(
        select(Document).where(Document.id == payload.document_id, Document.owner_id == current_user.id)
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(404, "Document not found")
    if not doc.extracted_text:
        raise HTTPException(400, "Document text not yet extracted. Please wait for OCR to complete.")

    # Run analysis via Celery
    from app.workers.tasks import analyze_document_task
    task = analyze_document_task.delay(str(doc.id), doc.extracted_text)

    return {
        "success": True,
        "data": {"job_id": task.id, "document_id": payload.document_id},
        "message": "AI analysis queued. Use WebSocket to track progress.",
    }


@router.post("/chat")
async def chat_with_document(
    payload: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """RAG-powered Q&A on an uploaded contract using ChromaDB context."""
    result = await db.execute(
        select(Document).where(Document.id == payload.document_id, Document.owner_id == current_user.id)
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(404, "Document not found")

    from app.ai.chains.rag import answer_contract_question
    response = answer_contract_question(
        question=payload.question,
        document_id=payload.document_id,
        conversation_history=payload.conversation_history,
    )
    return {"success": True, "data": response}


@router.post("/compare")
async def compare_documents(
    payload: CompareRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Compare two contracts side by side using the ComparisonAgent."""
    doc_a_res = await db.execute(select(Document).where(Document.id == payload.document_id_a, Document.owner_id == current_user.id))
    doc_b_res = await db.execute(select(Document).where(Document.id == payload.document_id_b, Document.owner_id == current_user.id))
    doc_a = doc_a_res.scalar_one_or_none()
    doc_b = doc_b_res.scalar_one_or_none()

    if not doc_a or not doc_b:
        raise HTTPException(404, "One or both documents not found")
    if not doc_a.extracted_text or not doc_b.extracted_text:
        raise HTTPException(400, "Documents must be processed before comparison")

    from app.ai.chains.rag import compare_contracts
    result = compare_contracts(doc_a.extracted_text, doc_b.extracted_text)
    return {"success": True, "data": result}


@router.post("/generate")
async def generate_contract(
    payload: GenerateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate a contract draft from form data using the DraftingAgent."""
    from app.ai.chains.rag import generate_contract as gen
    draft = gen(payload.contract_type, payload.form_data)
    return {
        "success": True,
        "data": {
            "contract_type": payload.contract_type,
            "draft": draft,
            "word_count": len(draft.split()),
        },
    }


@router.get("/report/{document_id}")
async def get_ai_report(
    document_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve the latest AI analysis report for a document."""
    result = await db.execute(
        select(AIReport)
        .join(Document)
        .where(Document.id == document_id, Document.owner_id == current_user.id)
        .order_by(AIReport.created_at.desc())
    )
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(404, "No AI report found. Run analysis first.")

    return {
        "success": True,
        "data": {
            "id": str(report.id),
            "document_id": document_id,
            "contract_type": report.contract_type.value if report.contract_type else None,
            "parties": report.parties,
            "effective_date": report.effective_date,
            "expiration_date": report.expiration_date,
            "clauses": report.clauses,
            "executive_summary": report.executive_summary,
            "rights": report.rights,
            "obligations": report.obligations,
            "key_risks": report.key_risks,
            "missing_clauses": report.missing_clauses,
            "recommendations": report.recommendations,
            "risk_level": report.risk_level.value if report.risk_level else None,
            "risk_score": report.risk_score,
            "risk_explanation": report.risk_explanation,
            "ai_confidence": report.ai_confidence,
            "created_at": report.created_at.isoformat(),
        },
    }


@router.websocket("/ws/job/{job_id}")
async def job_status_ws(websocket: WebSocket, job_id: str):
    """WebSocket endpoint for real-time Celery job status."""
    await websocket.accept()
    try:
        from celery.result import AsyncResult
        from app.workers.celery_app import celery_app
        import asyncio

        for _ in range(120):  # max 120s timeout
            task = AsyncResult(job_id, app=celery_app)
            status = task.status
            progress = task.info.get("progress", 0) if isinstance(task.info, dict) else 0

            await websocket.send_json({
                "job_id": job_id,
                "status": status.lower(),
                "progress": progress,
                "step": task.info.get("step", "") if isinstance(task.info, dict) else "",
            })

            if status in ("SUCCESS", "FAILURE", "REVOKED"):
                break
            await asyncio.sleep(1)

        await websocket.close()
    except WebSocketDisconnect:
        pass
