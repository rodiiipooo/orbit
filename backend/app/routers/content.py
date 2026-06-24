from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from ..routers.auth import get_current_user
from ..models.user import User
from ..services import content_ai, video_gen

router = APIRouter(prefix="/content", tags=["content"])


class GeneratePostRequest(BaseModel):
    topic: str
    platform: str
    tone: str = "professional"
    campaign_context: Optional[str] = None
    target_audience: Optional[str] = None
    include_hashtags: bool = True
    num_variants: int = 3


class GenerateVideoScriptRequest(BaseModel):
    topic: str
    duration_seconds: int = 60
    style: str = "educational"
    platform: str = "tiktok"


class GenerateStrategyRequest(BaseModel):
    brand_name: str
    industry: str
    goal: str
    target_audience: str
    platforms: list[str]
    budget_range: Optional[str] = None
    timeline_weeks: int = 12


class RepurposeRequest(BaseModel):
    original_content: str
    source_platform: str
    target_platforms: list[str]


class GenerateBannerRequest(BaseModel):
    headline: str
    brand_name: str
    platform: str = "instagram"
    style: str = "modern"


@router.post("/generate-post")
async def generate_post(req: GeneratePostRequest, user: User = Depends(get_current_user)):
    try:
        variants = await content_ai.generate_post(
            topic=req.topic,
            platform=req.platform,
            tone=req.tone,
            campaign_context=req.campaign_context,
            target_audience=req.target_audience,
            include_hashtags=req.include_hashtags,
            num_variants=req.num_variants,
        )
        return {"variants": variants}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-video-script")
async def generate_video_script(req: GenerateVideoScriptRequest, user: User = Depends(get_current_user)):
    try:
        script = await content_ai.generate_video_script(
            topic=req.topic,
            duration_seconds=req.duration_seconds,
            style=req.style,
            platform=req.platform,
        )
        return script
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-strategy")
async def generate_strategy(req: GenerateStrategyRequest, user: User = Depends(get_current_user)):
    try:
        strategy = await content_ai.generate_strategy(
            brand_name=req.brand_name,
            industry=req.industry,
            goal=req.goal,
            target_audience=req.target_audience,
            platforms=req.platforms,
            budget_range=req.budget_range,
            timeline_weeks=req.timeline_weeks,
        )
        return strategy
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/repurpose")
async def repurpose(req: RepurposeRequest, user: User = Depends(get_current_user)):
    try:
        result = await content_ai.repurpose_content(
            original_content=req.original_content,
            source_platform=req.source_platform,
            target_platforms=req.target_platforms,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-banner")
async def generate_banner(req: GenerateBannerRequest, user: User = Depends(get_current_user)):
    result = await video_gen.generate_social_banner(
        headline=req.headline,
        brand_name=req.brand_name,
        platform=req.platform,
        style=req.style,
    )
    return result
