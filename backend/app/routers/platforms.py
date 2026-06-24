from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from pydantic import BaseModel
from typing import Optional
from ..core.database import get_db
from ..routers.auth import get_current_user
from ..models.user import User
from ..models.platform import PlatformConnection

router = APIRouter(prefix="/platforms", tags=["platforms"])


class ConnectPlatformRequest(BaseModel):
    platform: str
    access_token: str
    refresh_token: str = ""
    platform_user_id: str = ""
    platform_username: str = ""
    meta: dict = {}


@router.get("/")
async def list_connections(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(PlatformConnection).where(PlatformConnection.user_id == user.id)
    )
    conns = result.scalars().all()
    return [
        {
            "id": c.id,
            "platform": c.platform,
            "platform_username": c.platform_username,
            "platform_user_id": c.platform_user_id,
            "connected_at": c.connected_at,
        }
        for c in conns
    ]


@router.post("/connect")
async def connect_platform(
    req: ConnectPlatformRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    existing = await db.execute(
        select(PlatformConnection).where(
            PlatformConnection.user_id == user.id,
            PlatformConnection.platform == req.platform,
        )
    )
    conn = existing.scalar_one_or_none()
    if conn:
        conn.access_token = req.access_token
        conn.refresh_token = req.refresh_token
        conn.platform_user_id = req.platform_user_id
        conn.platform_username = req.platform_username
        conn.meta = req.meta
    else:
        conn = PlatformConnection(
            user_id=user.id,
            platform=req.platform,
            access_token=req.access_token,
            refresh_token=req.refresh_token,
            platform_user_id=req.platform_user_id,
            platform_username=req.platform_username,
            meta=req.meta,
        )
        db.add(conn)
    await db.commit()
    return {"connected": True, "platform": req.platform}


@router.delete("/{platform}")
async def disconnect_platform(
    platform: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await db.execute(
        delete(PlatformConnection).where(
            PlatformConnection.user_id == user.id,
            PlatformConnection.platform == platform,
        )
    )
    await db.commit()
    return {"disconnected": True, "platform": platform}


@router.get("/oauth/{platform}/callback")
async def oauth_callback(
    platform: str,
    code: str,
    state: Optional[str] = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Generic OAuth callback handler.
    In production, exchange `code` for tokens via each platform's token endpoint.
    """
    return {
        "platform": platform,
        "status": "pending",
        "message": f"Exchange code={code} for tokens via {platform} OAuth.",
    }
