"""AI router — analyze, chat (RAG), compare, generate contracts."""
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db

router = APIRouter()


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
async def analyze_document(payload: AnalyzeRequest, db: AsyncSession = Depends(get_db)):
    """Trigger full AI analysis pipeline for a document.
    Returns job_id for WebSocket tracking.
    Implemented in Phase 3 (LangGraph multi-agent).
    """
    return {"message": "AI analysis queued", "job_id": "stub-job-id", "document_id": payload.document_id}


@router.post("/chat")
async def chat_with_document(payload: ChatRequest, db: AsyncSession = Depends(get_db)):
    """RAG-powered Q&A on uploaded contract.
    Implemented in Phase 3 (ChromaDB + LangChain RAG).
    """
    return {
        "answer": "This feature is being implemented in Phase 3.",
        "sources": [],
        "document_id": payload.document_id,
    }


@router.post("/compare")
async def compare_documents(payload: CompareRequest, db: AsyncSession = Depends(get_db)):
    """Compare two contracts side-by-side.
    Implemented in Phase 3 (ComparisonAgent).
    """
    return {"message": "Contract comparison — implemented in Phase 3"}


@router.post("/generate")
async def generate_contract(payload: GenerateRequest, db: AsyncSession = Depends(get_db)):
    """Generate a contract from structured form data.
    Implemented in Phase 4 (DraftingAgent).
    """
    return {"message": "Contract generation — implemented in Phase 4", "type": payload.contract_type}


@router.websocket("/ws/job/{job_id}")
async def job_status_ws(websocket: WebSocket, job_id: str):
    """WebSocket endpoint for real-time AI job status updates."""
    await websocket.accept()
    try:
        # Phase 3: stream Celery task progress
        await websocket.send_json({"job_id": job_id, "status": "pending", "progress": 0})
        await websocket.send_json({"job_id": job_id, "status": "complete", "progress": 100})
    except WebSocketDisconnect:
        pass
