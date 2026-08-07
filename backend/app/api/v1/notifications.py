"""Notifications router."""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db

router = APIRouter()


@router.get("/")
async def list_notifications(db: AsyncSession = Depends(get_db)):
    return {"notifications": [], "unread_count": 0}


@router.patch("/{notification_id}/read")
async def mark_read(notification_id: str, db: AsyncSession = Depends(get_db)):
    return {"message": "Marked as read", "id": notification_id}


@router.patch("/read-all")
async def mark_all_read(db: AsyncSession = Depends(get_db)):
    return {"message": "All notifications marked as read"}
