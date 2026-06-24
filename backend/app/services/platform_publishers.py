"""Social platform publishing adapters."""
import httpx
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..models.platform import PlatformConnection
from ..models.post import Post, PostStatus
from datetime import datetime, timezone


async def get_connection(db: AsyncSession, user_id: int, platform: str) -> Optional[PlatformConnection]:
    result = await db.execute(
        select(PlatformConnection).where(
            PlatformConnection.user_id == user_id,
            PlatformConnection.platform == platform,
        )
    )
    return result.scalar_one_or_none()


async def publish_twitter(conn: PlatformConnection, post: Post) -> dict:
    """Post to Twitter/X via v2 API."""
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://api.twitter.com/2/tweets",
            headers={"Authorization": f"Bearer {conn.access_token}"},
            json={"text": post.body[:280]},
        )
        if resp.status_code == 201:
            data = resp.json()["data"]
            return {"success": True, "platform_id": data["id"]}
        return {"success": False, "error": resp.text}


async def publish_linkedin(conn: PlatformConnection, post: Post) -> dict:
    """Post to LinkedIn via v2 API."""
    payload = {
        "author": f"urn:li:person:{conn.platform_user_id}",
        "lifecycleState": "PUBLISHED",
        "specificContent": {
            "com.linkedin.ugc.ShareContent": {
                "shareCommentary": {"text": post.body},
                "shareMediaCategory": "NONE",
            }
        },
        "visibility": {"com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"},
    }
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://api.linkedin.com/v2/ugcPosts",
            headers={"Authorization": f"Bearer {conn.access_token}"},
            json=payload,
        )
        if resp.status_code in (200, 201):
            return {"success": True, "platform_id": resp.headers.get("x-restli-id", "")}
        return {"success": False, "error": resp.text}


async def publish_facebook(conn: PlatformConnection, post: Post) -> dict:
    """Post to a Facebook page via Graph API."""
    page_id = conn.meta.get("page_id", conn.platform_user_id)
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"https://graph.facebook.com/v19.0/{page_id}/feed",
            params={"access_token": conn.access_token},
            json={"message": post.body},
        )
        data = resp.json()
        if "id" in data:
            return {"success": True, "platform_id": data["id"]}
        return {"success": False, "error": data.get("error", {}).get("message", resp.text)}


PUBLISHERS = {
    "twitter": publish_twitter,
    "linkedin": publish_linkedin,
    "facebook": publish_facebook,
}


async def publish_post(db: AsyncSession, post: Post) -> dict:
    """Dispatch post to all target platforms. Returns per-platform results."""
    results = {}
    for platform in post.platforms:
        conn = await get_connection(db, post.user_id, platform)
        if not conn:
            results[platform] = {"success": False, "error": "no_connection"}
            continue
        publisher = PUBLISHERS.get(platform)
        if not publisher:
            results[platform] = {"success": False, "error": "unsupported_platform"}
            continue
        try:
            result = await publisher(conn, post)
            results[platform] = result
        except Exception as e:
            results[platform] = {"success": False, "error": str(e)}

    all_ok = all(r.get("success") for r in results.values())
    any_ok = any(r.get("success") for r in results.values())

    post.platform_post_ids = {
        p: r.get("platform_id", "") for p, r in results.items() if r.get("success")
    }
    if all_ok:
        post.status = PostStatus.published
    elif any_ok:
        post.status = PostStatus.published  # partial publish still counts
    else:
        post.status = PostStatus.failed
    post.published_at = datetime.now(timezone.utc)

    await db.commit()
    return results
