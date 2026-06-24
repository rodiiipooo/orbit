"""AI content generation using Claude."""
import anthropic
from typing import Optional
from ..core.config import settings

PLATFORM_CONSTRAINTS = {
    "twitter": {"max_chars": 280, "media": True, "threads": True},
    "linkedin": {"max_chars": 3000, "media": True, "threads": False},
    "instagram": {"max_chars": 2200, "media": True, "threads": False},
    "facebook": {"max_chars": 63206, "media": True, "threads": False},
    "tiktok": {"max_chars": 2200, "media": True, "threads": False},
}


def _client() -> anthropic.Anthropic:
    return anthropic.Anthropic(api_key=settings.anthropic_api_key)


async def generate_post(
    topic: str,
    platform: str,
    tone: str = "professional",
    campaign_context: Optional[str] = None,
    target_audience: Optional[str] = None,
    include_hashtags: bool = True,
    num_variants: int = 3,
) -> list[dict]:
    constraints = PLATFORM_CONSTRAINTS.get(platform, {"max_chars": 500})
    context_block = ""
    if campaign_context:
        context_block += f"\nCampaign context: {campaign_context}"
    if target_audience:
        context_block += f"\nTarget audience: {target_audience}"

    system = (
        f"You are a world-class social media copywriter specializing in {platform} content. "
        f"Write in a {tone} tone. Always stay within {constraints['max_chars']} characters. "
        "Return ONLY a valid JSON array with no markdown fences."
    )

    user_prompt = (
        f"Generate {num_variants} distinct post variants about: {topic}{context_block}\n\n"
        f"Each variant must be a JSON object with keys:\n"
        f'- "body": post text (max {constraints["max_chars"]} chars)\n'
        f'- "hashtags": array of relevant hashtag strings (no #)\n'
        f'- "hook": one-sentence hook explaining why this works\n'
        f'- "best_time": suggested posting time (e.g. "Tuesday 10am")\n\n'
        f"Return a JSON array of {num_variants} objects."
    )

    client = _client()
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2048,
        system=system,
        messages=[{"role": "user", "content": user_prompt}],
    )

    import json
    text = response.content[0].text.strip()
    # Strip any accidental markdown fences
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    variants = json.loads(text)
    return variants


async def generate_video_script(
    topic: str,
    duration_seconds: int = 60,
    style: str = "educational",
    platform: str = "tiktok",
) -> dict:
    client = _client()
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2048,
        messages=[{
            "role": "user",
            "content": (
                f"Write a {duration_seconds}-second {style} video script about: {topic}\n"
                f"Platform: {platform}\n\n"
                "Return JSON with keys:\n"
                '- "title": video title\n'
                '- "hook": first 3-second hook line\n'
                '- "scenes": array of {time_marker, action, dialogue} objects\n'
                '- "cta": call-to-action text\n'
                '- "caption": platform caption with hashtags\n'
                '- "thumbnail_concept": description of ideal thumbnail\n'
                "Return only valid JSON, no markdown."
            )
        }],
    )
    import json
    text = response.content[0].text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    return json.loads(text)


async def generate_strategy(
    brand_name: str,
    industry: str,
    goal: str,
    target_audience: str,
    platforms: list[str],
    budget_range: Optional[str] = None,
    timeline_weeks: int = 12,
) -> dict:
    client = _client()
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4096,
        messages=[{
            "role": "user",
            "content": (
                f"Create a comprehensive {timeline_weeks}-week social media marketing strategy.\n\n"
                f"Brand: {brand_name}\n"
                f"Industry: {industry}\n"
                f"Primary goal: {goal}\n"
                f"Target audience: {target_audience}\n"
                f"Platforms: {', '.join(platforms)}\n"
                f"Budget range: {budget_range or 'flexible'}\n\n"
                "Return detailed JSON with keys:\n"
                '- "executive_summary": 2-3 sentence overview\n'
                '- "brand_voice": {tone, personality_traits, do_list, dont_list}\n'
                '- "content_pillars": array of {pillar_name, description, content_ratio_pct}\n'
                '- "posting_schedule": {platform: {frequency_per_week, best_days, best_times}}\n'
                '- "content_mix": {post_type: percentage} (e.g. educational, promotional, engagement)\n'
                '- "weekly_plan": array of 4 weeks, each {week, theme, goals, content_ideas}\n'
                '- "kpis": array of {metric, target, measurement_method}\n'
                '- "growth_tactics": array of {tactic, platform, effort, expected_impact}\n'
                '- "competitive_differentiation": 3 key differentiators\n'
                "Return only valid JSON."
            )
        }],
    )
    import json
    text = response.content[0].text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    return json.loads(text)


async def repurpose_content(
    original_content: str,
    source_platform: str,
    target_platforms: list[str],
) -> dict:
    client = _client()
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=3000,
        messages=[{
            "role": "user",
            "content": (
                f"Repurpose this {source_platform} content for other platforms:\n\n"
                f"{original_content}\n\n"
                f"Target platforms: {', '.join(target_platforms)}\n\n"
                "Return JSON: {platform: {body, hashtags, adaptation_notes}} for each target.\n"
                "Respect each platform's tone and character limits. Return only valid JSON."
            )
        }],
    )
    import json
    text = response.content[0].text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    return json.loads(text)
