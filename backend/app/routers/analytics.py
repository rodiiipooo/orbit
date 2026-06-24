from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from datetime import datetime, timedelta, timezone
from ..core.database import get_db
from ..routers.auth import get_current_user
from ..models.user import User
from ..models.post import Post, PostStatus
from ..models.analytics import AnalyticsSnapshot, CausalInsight
from ..services.causal_engine import analyze_user_posts

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/overview")
async def overview(
    days: int = Query(30, ge=7, le=365),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    since = datetime.now(timezone.utc) - timedelta(days=days)

    posts_result = await db.execute(
        select(Post).where(Post.user_id == user.id, Post.created_at >= since)
    )
    posts = posts_result.scalars().all()

    total_posts = len(posts)
    published = sum(1 for p in posts if p.status == PostStatus.published)

    total_engagements = 0
    total_impressions = 0
    platform_breakdown = {}

    for post in posts:
        for platform, m in (post.metrics or {}).items():
            eng = m.get("likes", 0) + m.get("shares", 0) + m.get("comments", 0)
            imp = m.get("impressions", 0)
            total_engagements += eng
            total_impressions += imp
            if platform not in platform_breakdown:
                platform_breakdown[platform] = {"engagements": 0, "impressions": 0, "posts": 0}
            platform_breakdown[platform]["engagements"] += eng
            platform_breakdown[platform]["impressions"] += imp
            platform_breakdown[platform]["posts"] += 1

    engagement_rate = (
        (total_engagements / total_impressions * 100) if total_impressions > 0 else 0
    )

    return {
        "period_days": days,
        "total_posts": total_posts,
        "published_posts": published,
        "total_engagements": total_engagements,
        "total_impressions": total_impressions,
        "engagement_rate_pct": round(engagement_rate, 2),
        "platform_breakdown": platform_breakdown,
    }


@router.get("/causal-insights")
async def causal_insights(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    refresh: bool = Query(False),
):
    if refresh:
        posts_result = await db.execute(
            select(Post).where(Post.user_id == user.id, Post.status == PostStatus.published)
        )
        posts_data = [
            {
                "body": p.body,
                "scheduled_at": p.scheduled_at,
                "hashtags": p.hashtags,
                "media_urls": p.media_urls,
                "ai_generated": p.ai_generated,
                "metrics": p.metrics or {},
            }
            for p in posts_result.scalars()
        ]
        insights = analyze_user_posts(posts_data)
        if insights:
            await db.execute(
                CausalInsight.__table__.delete().where(CausalInsight.user_id == user.id)
            )
            for ins in insights:
                db.add(CausalInsight(
                    user_id=user.id,
                    **{k: ins[k] for k in
                       ["treatment", "outcome", "ate", "ci_lower", "ci_upper",
                        "p_value", "method", "interpretation"]}
                ))
            await db.commit()

    result = await db.execute(
        select(CausalInsight)
        .where(CausalInsight.user_id == user.id)
        .order_by(CausalInsight.ate.desc())
    )
    rows = result.scalars().all()
    return [
        {
            "treatment": r.treatment,
            "outcome": r.outcome,
            "ate": r.ate,
            "ci_lower": r.ci_lower,
            "ci_upper": r.ci_upper,
            "p_value": r.p_value,
            "significant": r.p_value < 0.05,
            "method": r.method,
            "interpretation": r.interpretation,
            "computed_at": r.computed_at,
        }
        for r in rows
    ]


@router.get("/top-posts")
async def top_posts(
    limit: int = Query(10, ge=1, le=50),
    metric: str = Query("engagements"),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Post).where(Post.user_id == user.id, Post.status == PostStatus.published)
    )
    posts = result.scalars().all()

    def score(p):
        total = 0
        for m in (p.metrics or {}).values():
            if metric == "engagements":
                total += m.get("likes", 0) + m.get("shares", 0) + m.get("comments", 0)
            elif metric == "impressions":
                total += m.get("impressions", 0)
            elif metric == "reach":
                total += m.get("reach", 0)
        return total

    sorted_posts = sorted(posts, key=score, reverse=True)[:limit]
    return [
        {
            "id": p.id,
            "title": p.title,
            "body": p.body[:150],
            "platforms": p.platforms,
            "published_at": p.published_at,
            "score": score(p),
            "metrics": p.metrics,
        }
        for p in sorted_posts
    ]
