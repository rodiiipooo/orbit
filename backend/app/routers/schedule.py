from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from ..core.database import get_db
from ..routers.auth import get_current_user
from ..models.user import User
from ..models.post import Post, PostStatus
from ..services.platform_publishers import publish_post

router = APIRouter(prefix="/schedule", tags=["schedule"])


class CreatePostRequest(BaseModel):
    title: str = ""
    body: str
    platforms: list[str]
    scheduled_at: Optional[datetime] = None
    hashtags: list[str] = []
    media_urls: list[str] = []
    ai_generated: bool = False
    campaign_id: Optional[int] = None


class UpdatePostRequest(BaseModel):
    title: Optional[str] = None
    body: Optional[str] = None
    platforms: Optional[list[str]] = None
    scheduled_at: Optional[datetime] = None
    hashtags: Optional[list[str]] = None
    status: Optional[PostStatus] = None


@router.post("/posts")
async def create_post(
    req: CreatePostRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    post = Post(
        user_id=user.id,
        title=req.title,
        body=req.body,
        platforms=req.platforms,
        scheduled_at=req.scheduled_at,
        hashtags=req.hashtags,
        media_urls=req.media_urls,
        ai_generated=req.ai_generated,
        campaign_id=req.campaign_id,
        status=PostStatus.scheduled if req.scheduled_at else PostStatus.draft,
    )
    db.add(post)
    await db.commit()
    await db.refresh(post)
    return {"id": post.id, "status": post.status}


@router.get("/posts")
async def list_posts(
    status: Optional[str] = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    q = select(Post).where(Post.user_id == user.id)
    if status:
        q = q.where(Post.status == status)
    result = await db.execute(q.order_by(Post.scheduled_at.desc().nullslast(), Post.created_at.desc()))
    posts = result.scalars().all()
    return [
        {
            "id": p.id,
            "title": p.title,
            "body": p.body[:100] + ("..." if len(p.body) > 100 else ""),
            "platforms": p.platforms,
            "status": p.status,
            "scheduled_at": p.scheduled_at,
            "published_at": p.published_at,
            "hashtags": p.hashtags,
            "ai_generated": p.ai_generated,
            "metrics": p.metrics,
        }
        for p in posts
    ]


@router.post("/posts/{post_id}/publish-now")
async def publish_now(
    post_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Post).where(Post.id == post_id, Post.user_id == user.id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    results = await publish_post(db, post)
    return {"results": results, "status": post.status}


@router.delete("/posts/{post_id}")
async def delete_post(
    post_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Post).where(Post.id == post_id, Post.user_id == user.id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    await db.delete(post)
    await db.commit()
    return {"deleted": True}
