"""Celery worker: scheduled post dispatch + metrics sync."""
from celery import Celery
from celery.schedules import crontab
from ..core.config import settings

celery = Celery(
    "orbit",
    broker=settings.redis_url,
    backend=settings.redis_url,
)

celery.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    beat_schedule={
        "dispatch-scheduled-posts": {
            "task": "orbit.workers.tasks.dispatch_scheduled_posts",
            "schedule": 60.0,  # every minute
        },
        "sync-platform-metrics": {
            "task": "orbit.workers.tasks.sync_platform_metrics",
            "schedule": crontab(minute=0, hour="*/6"),  # every 6h
        },
        "run-causal-analysis": {
            "task": "orbit.workers.tasks.run_causal_analysis",
            "schedule": crontab(minute=0, hour=3),  # 3am daily
        },
    },
)


@celery.task(name="orbit.workers.tasks.dispatch_scheduled_posts")
def dispatch_scheduled_posts():
    import asyncio
    from ..core.database import AsyncSessionLocal
    from ..models.post import Post, PostStatus
    from ..services.platform_publishers import publish_post
    from sqlalchemy import select
    from datetime import datetime, timezone

    async def _run():
        async with AsyncSessionLocal() as db:
            now = datetime.now(timezone.utc)
            result = await db.execute(
                select(Post).where(
                    Post.status == PostStatus.scheduled,
                    Post.scheduled_at <= now,
                )
            )
            posts = result.scalars().all()
            for post in posts:
                await publish_post(db, post)

    asyncio.run(_run())


@celery.task(name="orbit.workers.tasks.sync_platform_metrics")
def sync_platform_metrics():
    """Placeholder: pull engagement metrics from connected platform APIs."""
    pass


@celery.task(name="orbit.workers.tasks.run_causal_analysis")
def run_causal_analysis():
    """Run nightly causal analysis for all users with enough post history."""
    import asyncio
    from ..core.database import AsyncSessionLocal
    from ..models.post import Post, PostStatus
    from ..models.analytics import CausalInsight
    from ..services.causal_engine import analyze_user_posts
    from sqlalchemy import select, func

    async def _run():
        async with AsyncSessionLocal() as db:
            user_counts = await db.execute(
                select(Post.user_id, func.count(Post.id).label("cnt"))
                .where(Post.status == PostStatus.published)
                .group_by(Post.user_id)
                .having(func.count(Post.id) >= 30)
            )
            for user_id, _ in user_counts:
                posts = await db.execute(
                    select(Post).where(Post.user_id == user_id, Post.status == PostStatus.published)
                )
                posts_data = [
                    {
                        "body": p.body,
                        "scheduled_at": p.scheduled_at,
                        "hashtags": p.hashtags,
                        "media_urls": p.media_urls,
                        "ai_generated": p.ai_generated,
                        "metrics": p.metrics,
                    }
                    for p in posts.scalars()
                ]
                insights = analyze_user_posts(posts_data)
                for ins in insights:
                    db.add(CausalInsight(
                        user_id=user_id,
                        **{k: ins[k] for k in
                           ["treatment", "outcome", "ate", "ci_lower", "ci_upper", "p_value", "method", "interpretation"]}
                    ))
            await db.commit()

    asyncio.run(_run())
