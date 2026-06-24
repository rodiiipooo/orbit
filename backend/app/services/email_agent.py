"""
Orbit email agent.
Handles transactional drip sequences and cold outreach via Resend.
Persona and template data loaded from app/data/persona.json.
"""
import json
import os
import anthropic
from pathlib import Path
from typing import Optional
from ..core.config import settings

_PERSONA_PATH = Path(__file__).parent.parent / "data" / "persona.json"
_persona: dict = {}


def persona() -> dict:
    global _persona
    if not _persona:
        _persona = json.loads(_PERSONA_PATH.read_text())
    return _persona


def _sender(role: str) -> dict:
    team = persona()["team"]
    member = team.get(role) or team["founder"]
    company = persona()["company"]
    return {
        "name": member["name"],
        "email": member["email"],
        "from_address": f'{member["name"]} <{member["email"]}>',
        "reply_to": company["reply_to"],
        "signing": member.get("signing", member["name"]),
        "voice": member.get("voice", "professional"),
    }


# ── Template rendering via Claude ─────────────────────────────────────────────

def _render_template(template_id: str, recipient: dict, extra_context: dict = {}) -> dict:
    """
    Use Claude to write a polished email from a template spec + persona voice.
    Returns {"subject": str, "html": str, "text": str}.
    """
    company = persona()["company"]
    seq = persona()["email_sequences"]

    # Find the sequence entry to get sender + subject hint
    seq_entry = None
    for block in list(seq.values()):
        for item in (block if isinstance(block, list) else []):
            if isinstance(item, dict) and item.get("template") == template_id:
                seq_entry = item
                break

    sender_role = seq_entry["sender"] if seq_entry else "founder"
    sender = _sender(sender_role)
    subject_hint = (seq_entry or {}).get("subject", "")

    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

    template_briefs = {
        "welcome": "A warm, personal welcome from the founder. Tells his agency backstory in 2 sentences. Explains Orbit's one core promise: you'll know WHY your content works, not just what's popular. CTA: connect your first platform (link: {app_url}/platforms).",
        "day1_checkin": "From customer success. Short and casual. Ask if they've connected a platform yet and whether they had any trouble. Offer to jump on a 15-min call. No sales pitch.",
        "day3_tip": "From the founder. Share the single most impactful insight from Orbit data: posts with a clear CTA get 2.3x more engagement on average. Tie it to the causal inference engine. CTA: run your first causal analysis.",
        "day7_checkin": "From customer success. Warm check-in. Ask how content creation is going. Offer a free 'first strategy session' — 20 min, no pitch, just help.",
        "day14_causal": "From product. Feature spotlight on Causal Insights — explain the difference between correlation and causation in one sentence, then describe what Orbit's engine does. CTA: view their insights dashboard.",
        "day30_upgrade": "From growth. Review what they've accomplished in month 1 (frame as milestone). Introduce the Growth plan benefits (unlimited posts, causal insights, strategy builder). Light-touch upgrade CTA.",
        "cold_1_founder_story": "Cold email, step 1. From the founder. 4-5 short sentences. Story: 'I managed 40 client accounts and guessed at what worked. So I built the thing that tells you WHY.' Invite them to try Orbit free.",
        "cold_2_social_proof": "Cold email, step 2. From growth. Short data point: 'Teams using Orbit's causal engine cut wasted content spend by 30% on average.' Ask if that number matters to them.",
        "cold_3_session_offer": "Cold email, step 3. From customer success. Offer a free 30-min strategy session — no pitch, just audit their current social setup and share what the data says. Calendar link placeholder.",
    }

    brief = template_briefs.get(template_id, f"Write a professional marketing email for template: {template_id}")
    brief = brief.format(app_url=settings.frontend_url)

    first_name = recipient.get("first_name") or recipient.get("full_name", "there").split()[0]
    company_name = recipient.get("company", "")

    prompt = (
        f"Write a marketing email from {sender['name']} ({sender['voice']} voice).\n\n"
        f"Recipient: {first_name}" + (f" at {company_name}" if company_name else "") + "\n"
        f"Company: {company['name']} ({company['domain']})\n"
        f"Brief: {brief}\n\n"
        "Rules:\n"
        "- Max 150 words body text\n"
        "- No em-dashes, no buzzwords\n"
        "- Plain conversational tone\n"
        "- End with the sender's signing block\n"
        "- Use {{first_name}} as a literal placeholder for personalization\n\n"
        "Return JSON only:\n"
        '{"subject": "...", "html": "<p>...</p>", "text": "plain text version"}'
    )

    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
    )
    raw = response.content[0].text.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    result = json.loads(raw)
    # Inject first_name
    for key in ("subject", "html", "text"):
        if key in result:
            result[key] = result[key].replace("{{first_name}}", first_name)
    return result


# ── Resend sender ─────────────────────────────────────────────────────────────

async def send_email(
    to_email: str,
    to_name: str,
    subject: str,
    html: str,
    text: str,
    sender_role: str = "founder",
    reply_to: Optional[str] = None,
) -> dict:
    """Send via Resend API. Falls back to a dry-run log if no key configured."""
    sender = _sender(sender_role)

    if not settings.resend_api_key:
        print(f"[email-agent DRY RUN] To: {to_email} | Subject: {subject}")
        return {"id": "dry-run", "status": "dry_run"}

    import httpx
    payload = {
        "from": sender["from_address"],
        "to": [f"{to_name} <{to_email}>"],
        "subject": subject,
        "html": html,
        "text": text,
        "reply_to": reply_to or sender["reply_to"],
    }
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {settings.resend_api_key}"},
            json=payload,
            timeout=15.0,
        )
        resp.raise_for_status()
        return resp.json()


async def send_template(
    template_id: str,
    recipient: dict,
    extra_context: dict = {},
) -> dict:
    """Render a template and send it."""
    rendered = _render_template(template_id, recipient, extra_context)
    sender_role = _get_sender_role_for_template(template_id)
    result = await send_email(
        to_email=recipient["email"],
        to_name=recipient.get("full_name") or recipient.get("first_name", ""),
        subject=rendered["subject"],
        html=rendered["html"],
        text=rendered["text"],
        sender_role=sender_role,
    )
    return {"template": template_id, "send_result": result, "subject": rendered["subject"]}


def _get_sender_role_for_template(template_id: str) -> str:
    seq = persona()["email_sequences"]
    for block in seq.values():
        for item in (block if isinstance(block, list) else []):
            if isinstance(item, dict) and item.get("template") == template_id:
                return item.get("sender", "founder")
    return "founder"


# ── Outreach agent (cold email) ───────────────────────────────────────────────

async def run_outreach_sequence(
    prospect: dict,
    step: int = 1,
) -> dict:
    """
    Send a single cold outreach step to a prospect.
    prospect: {email, first_name, company, title, linkedin_url?}
    """
    steps = persona()["email_sequences"]["cold_outreach"]
    entry = next((s for s in steps if s["step"] == step), None)
    if not entry:
        return {"error": f"No outreach step {step}"}
    return await send_template(entry["template"], prospect)


# ── Inbound triage ────────────────────────────────────────────────────────────

async def triage_inbound(
    from_email: str,
    from_name: str,
    subject: str,
    body: str,
) -> dict:
    """
    Classify an inbound email and return a draft reply from the right agent.
    Categories: support | billing | upgrade | churn_risk | general
    """
    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=512,
        messages=[{
            "role": "user",
            "content": (
                f"Classify this inbound email and draft a brief reply.\n\n"
                f"From: {from_name} <{from_email}>\n"
                f"Subject: {subject}\n"
                f"Body: {body[:1000]}\n\n"
                "Return JSON:\n"
                '{"category": "support|billing|upgrade|churn_risk|general", '
                '"priority": "high|normal|low", '
                '"draft_reply": "...", '
                '"suggested_agent": "jordan_lee|alex_rivera|sam_park"}'
            )
        }],
    )
    raw = response.content[0].text.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw)
