"""Contracts router."""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db

router = APIRouter()


@router.get("/")
async def list_contracts(db: AsyncSession = Depends(get_db)):
    return {"message": "Contracts list — implemented in Phase 2"}


@router.get("/{contract_id}")
async def get_contract(contract_id: str, db: AsyncSession = Depends(get_db)):
    return {"message": "Contract detail — implemented in Phase 2", "id": contract_id}


@router.get("/{contract_id}/report")
async def get_contract_report(contract_id: str, db: AsyncSession = Depends(get_db)):
    return {"message": "AI report for contract — implemented in Phase 3", "id": contract_id}
