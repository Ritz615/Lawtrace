"""Notifications router — create, list, mark-read, delete."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from fastapi import HTTPException

from app.core.database import get_db
from app.core.security import decode_token, oauth2_scheme
from app.models.models import Notification, User, NotificationType

router = APIRouter()


async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)) -> User:
    payload = decode_token(token)
    result = await db.execute(select(User).where(User.id == payload["sub"]))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(401, "User not found")
    return user


@router.get("/")
async def list_notifications(
    unread_only: bool = Query(False),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = (
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(limit)
    )
    if unread_only:
        query = query.where(Notification.is_read == False)

    result = await db.execute(query)
    notifs = result.scalars().all()

    return {
        "success": True,
        "data": [_notif_dict(n) for n in notifs],
        "unread_count": sum(1 for n in notifs if not n.is_read),
    }


@router.patch("/{notif_id}/read")
async def mark_read(
    notif_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Notification).where(Notification.id == notif_id, Notification.user_id == current_user.id)
    )
    notif = result.scalar_one_or_none()
    if not notif:
        raise HTTPException(404, "Notification not found")
    notif.is_read = True
    await db.commit()
    return {"success": True}


@router.patch("/read-all")
async def mark_all_read(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await db.execute(
        update(Notification)
        .where(Notification.user_id == current_user.id, Notification.is_read == False)
        .values(is_read=True)
    )
    await db.commit()
    return {"success": True, "message": "All notifications marked as read"}


@router.delete("/{notif_id}")
async def delete_notification(
    notif_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Notification).where(Notification.id == notif_id, Notification.user_id == current_user.id)
    )
    notif = result.scalar_one_or_none()
    if not notif:
        raise HTTPException(404, "Notification not found")
    await db.delete(notif)
    await db.commit()
    return {"success": True}


async def create_notification(
    db: AsyncSession,
    user_id: str,
    notif_type: NotificationType,
    title: str,
    body: str,
    document_id: str = None,
):
    """Helper to create a notification — called by other services."""
    notif = Notification(
        user_id=user_id,
        type=notif_type,
        title=title,
        body=body,
        document_id=document_id,
        is_read=False,
    )
    db.add(notif)
    await db.commit()


def _notif_dict(n: Notification) -> dict:
    return {
        "id": str(n.id),
        "type": n.type.value if n.type else None,
        "title": n.title,
        "body": n.body,
        "is_read": n.is_read,
        "document_id": str(n.document_id) if n.document_id else None,
        "created_at": n.created_at.isoformat() if n.created_at else None,
    }
