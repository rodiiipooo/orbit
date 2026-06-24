"""
Media generation routing:
  Images → local diffusion endpoint (Jarvis / ComfyUI or Diffusers API)
  Video  → InVideo.io (script + deep-link; API tier if available, UI fallback)
"""
import httpx
from urllib.parse import urlencode
from typing import Optional
from ..core.config import settings

INVIDEO_MAKE_URL = "https://invideo.io/make/ai-video-generator/"

SIZE_MAP = {
    "instagram": (1080, 1080),
    "twitter": (1200, 675),
    "linkedin": (1200, 628),
    "facebook": (1200, 630),
    "tiktok": (1080, 1920),
}


# ── Image generation (local) ─────────────────────────────────────────────────

async def generate_social_banner(
    headline: str,
    brand_name: str,
    platform: str = "instagram",
    style: str = "modern",
) -> dict:
    """
    POST to local diffusion endpoint (ComfyUI API or Diffusers FastAPI wrapper).
    Falls back gracefully if LOCAL_DIFFUSION_URL is not configured.
    """
    if not settings.local_diffusion_url:
        return {
            "url": None,
            "status": "no_local_diffusion",
            "hint": f"Set LOCAL_DIFFUSION_URL in .env (e.g. http://localhost:7860/sdapi/v1/txt2img)",
        }

    w, h = SIZE_MAP.get(platform, (1200, 628))
    prompt = (
        f"{style} social media marketing banner, professional design, "
        f"headline text '{headline}', brand '{brand_name}', "
        f"clean typography, high-contrast, {platform} format, 8k, vibrant"
    )
    negative_prompt = "blurry, low quality, watermark, text errors, distorted"

    payload = {
        "prompt": prompt,
        "negative_prompt": negative_prompt,
        "width": w,
        "height": h,
        "steps": 28,
        "cfg_scale": 7.0,
        "sampler_name": "DPM++ 2M Karras",
    }

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            # Automatic1111 / AUTOMATIC1111-compatible endpoint
            resp = await client.post(
                f"{settings.local_diffusion_url.rstrip('/')}/sdapi/v1/txt2img",
                json=payload,
            )
            resp.raise_for_status()
            data = resp.json()
            # A1111 returns base64 images; return as data URI
            b64 = data["images"][0]
            return {
                "url": f"data:image/png;base64,{b64}",
                "status": "success",
                "provider": "local",
                "size": f"{w}x{h}",
            }
    except Exception as e:
        return {"url": None, "status": f"error: {e}", "provider": "local"}


async def generate_image(
    prompt: str,
    width: int = 1024,
    height: int = 1024,
    steps: int = 28,
    negative_prompt: str = "blurry, low quality, watermark",
) -> dict:
    """Generic local image generation — used for post thumbnails, story cards, etc."""
    if not settings.local_diffusion_url:
        return {"url": None, "status": "no_local_diffusion"}

    payload = {
        "prompt": prompt,
        "negative_prompt": negative_prompt,
        "width": width,
        "height": height,
        "steps": steps,
        "cfg_scale": 7.0,
    }
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(
                f"{settings.local_diffusion_url.rstrip('/')}/sdapi/v1/txt2img",
                json=payload,
            )
            resp.raise_for_status()
            b64 = resp.json()["images"][0]
            return {"url": f"data:image/png;base64,{b64}", "status": "success", "provider": "local"}
    except Exception as e:
        return {"url": None, "status": f"error: {e}", "provider": "local"}


# ── Video generation (InVideo) ────────────────────────────────────────────────

def build_invideo_url(script_title: str, script_body: str) -> str:
    """
    Build an InVideo AI deep-link pre-populated with the script.
    InVideo supports a `prompt` query parameter on their AI generator URL.
    """
    prompt_text = f"{script_title}. {script_body[:400]}"  # keep URL sane
    params = urlencode({"prompt": prompt_text})
    return f"{INVIDEO_MAKE_URL}?{params}"


async def request_video(
    script: dict,
    platform: str = "tiktok",
    duration_seconds: int = 60,
) -> dict:
    """
    Route video generation to InVideo.

    If INVIDEO_API_KEY is set, calls the InVideo API directly.
    Otherwise returns a deep-link URL the frontend opens in a new tab.
    """
    title = script.get("title", "Untitled")
    hook = script.get("hook", "")
    scenes_text = " ".join(
        s.get("dialogue", "") for s in script.get("scenes", [])
    )
    full_script = f"{hook} {scenes_text}".strip()

    if settings.invideo_api_key:
        return await _invideo_api(title, full_script, platform, duration_seconds)

    # No API key — return deep-link for frontend to open
    link = build_invideo_url(title, full_script)
    return {
        "status": "redirect",
        "provider": "invideo",
        "redirect_url": link,
        "message": "Open InVideo to render this script",
        "script_title": title,
        "script_preview": full_script[:200],
    }


async def _invideo_api(
    title: str,
    script: str,
    platform: str,
    duration_seconds: int,
) -> dict:
    """Call InVideo API if key is available (enterprise/invite tier)."""
    aspect = "9:16" if platform in ("tiktok", "instagram") else "16:9"
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                "https://api.invideo.io/v1/videos",
                headers={
                    "Authorization": f"Bearer {settings.invideo_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "title": title,
                    "script": script,
                    "duration": duration_seconds,
                    "aspect_ratio": aspect,
                    "platform": platform,
                },
            )
            resp.raise_for_status()
            data = resp.json()
            return {
                "status": "processing",
                "provider": "invideo",
                "job_id": data.get("id"),
                "estimated_seconds": data.get("estimated_duration", 120),
            }
    except Exception as e:
        # Fall back to deep-link on API error
        link = build_invideo_url(title, script)
        return {
            "status": "redirect",
            "provider": "invideo",
            "redirect_url": link,
            "error": str(e),
        }
