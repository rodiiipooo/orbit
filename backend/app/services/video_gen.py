"""Video generation via Replicate API."""
import replicate
import httpx
from typing import Optional
from ..core.config import settings


async def generate_video_from_prompt(
    prompt: str,
    duration_seconds: int = 5,
    aspect_ratio: str = "9:16",  # portrait for TikTok/Reels
    style: str = "cinematic",
) -> dict:
    """
    Generate a short video clip via Replicate stable-video-diffusion or wan-video.
    Returns {url, status, model_used}.
    """
    if not settings.replicate_api_token:
        return {"url": None, "status": "no_api_key", "model_used": None}

    import os
    os.environ["REPLICATE_API_TOKEN"] = settings.replicate_api_token

    model = "stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438"

    try:
        output = replicate.run(
            model,
            input={
                "input_image": None,
                "sizing_strategy": "maintain_aspect_ratio",
                "frames_per_second": 6,
                "motion_bucket_id": 127,
                "cond_aug": 0.02,
            }
        )
        url = output[0] if isinstance(output, list) else str(output)
        return {"url": url, "status": "success", "model_used": "stable-video-diffusion"}
    except Exception as e:
        return {"url": None, "status": f"error: {e}", "model_used": None}


async def generate_social_banner(
    headline: str,
    brand_name: str,
    platform: str = "instagram",
    style: str = "modern",
) -> dict:
    """Generate a social media banner image via SDXL."""
    if not settings.replicate_api_token:
        return {"url": None, "status": "no_api_key"}

    import os
    os.environ["REPLICATE_API_TOKEN"] = settings.replicate_api_token

    size_map = {
        "instagram": (1080, 1080),
        "twitter": (1200, 675),
        "linkedin": (1200, 628),
        "facebook": (1200, 630),
        "tiktok": (1080, 1920),
    }
    w, h = size_map.get(platform, (1200, 628))

    prompt = (
        f"{style} social media marketing banner, professional design, "
        f"headline text '{headline}', brand '{brand_name}', "
        f"clean typography, high-contrast, {platform} format, 8k, vibrant"
    )

    try:
        output = replicate.run(
            "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
            input={
                "prompt": prompt,
                "width": w,
                "height": h,
                "num_inference_steps": 30,
                "guidance_scale": 7.5,
            }
        )
        url = output[0] if isinstance(output, list) else str(output)
        return {"url": url, "status": "success"}
    except Exception as e:
        return {"url": None, "status": f"error: {e}"}
