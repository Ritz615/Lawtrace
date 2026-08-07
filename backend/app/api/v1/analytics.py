"""Analytics router."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db

router = APIRouter()


@router.get("/overview")
async def get_overview(db: AsyncSession = Depends(get_db)):
    """Dashboard KPI overview: total docs, high risk, expiring soon, completed analyses."""
    return {
        "total_contracts": 0,
        "high_risk": 0,
        "expiring_soon": 0,
        "ai_analyzed": 0,
        "pending_review": 0,
    }


@router.get("/monthly-uploads")
async def monthly_uploads(months: int = Query(6), db: AsyncSession = Depends(get_db)):
    return {"message": "Monthly uploads chart — implemented in Phase 5"}


@router.get("/risk-distribution")
async def risk_distribution(db: AsyncSession = Depends(get_db)):
    return {"message": "Risk distribution chart — implemented in Phase 5"}


@router.get("/contract-types")
async def contract_types(db: AsyncSession = Depends(get_db)):
    return {"message": "Contract types chart — implemented in Phase 5"}
