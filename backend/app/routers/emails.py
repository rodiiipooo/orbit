"""
Email agent router.
- POST /api/emails/send-template   — manual send (admin)
- POST /api/emails/outreach        — send a cold outreach step
- POST /api/emails/inbound-triage  — classify + draft reply for inbound
- POST /api/emails/unsubscribe     — unsubscribe a user from drip
- GET  /api/emails/log             — email history for current user
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr
from typing import Optional
from ..core.database import get_db
from ..routers.auth import get_current_user
from ..models.user import User
from ..models.email_log import EmailLog, DripEnrollment
from ..services.email_agent import send_template, run_outreach_sequence, triage_inbound
from datetime import datetime, timezone

router = APIRouter(prefix="/emails", tags=["emails"])


class SendTemplateRequest(BaseModel):
    template_id: str
    to_email: EmailStr
    to_name: str
    to_first_name: str = ""
    company: str = ""


class OutreachRequest(BaseModel):
    prospect_email: EmailStr
    prospect_name: str
    prospect_first_name: str
    company: str = ""
    title: str = ""
    step: int = 1


class InboundTriageRequest(BaseModel):
    from_email: EmailStr
    from_name: str
    subject: str
    body: str


class UnsubscribeRequest(BaseModel):
    email: EmailStr


@router.post("/send-template")
async def send_template_endpoint(
    req: SendTemplateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    recipient = {
        "email": req.to_email,
        "full_name": req.to_name,
        "first_name": req.to_first_name or req.to_name.split()[0],
        "company": req.company,
    }
    try:
        result = await send_template(req.template_id, recipient)
        db.add(EmailLog(
            user_id=user.id,
            to_email=req.to_email,
            to_name=req.to_name,
            from_email=f"team@orbitmarketing.io",
            subject=result["subject"],
            template_id=req.template_id,
            category="drip",
            resend_id=result["send_result"].get("id", ""),
        ))
        await db.commit()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/outreach")
async def outreach(
    req: OutreachRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    prospect = {
        "email": req.prospect_email,
        "full_name": req.prospect_name,
        "first_name": req.prospect_first_name,
        "company": req.company,
        "title": req.title,
    }
    try:
        result = await run_outreach_sequence(prospect, step=req.step)
        db.add(EmailLog(
            user_id=user.id,
            to_email=req.prospect_email,
            to_name=req.prospect_name,
            from_email="sam@orbitmarketing.io",
            subject=result.get("subject", ""),
            template_id=result.get("template", ""),
            category="outreach",
            resend_id=result.get("send_result", {}).get("id", ""),
        ))
        await db.commit()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/inbound-triage")
async def inbound_triage(
    req: InboundTriageRequest,
    user: User = Depends(get_current_user),
):
    try:
        return await triage_inbound(req.from_email, req.from_name, req.subject, req.body)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/unsubscribe")
async def unsubscribe(req: UnsubscribeRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(DripEnrollment).join(User, User.id == DripEnrollment.user_id)
        .where(User.email == req.email)
    )
    enrollment = result.scalar_one_or_none()
    if enrollment:
        enrollment.unsubscribed = True
        enrollment.unsubscribed_at = datetime.now(timezone.utc)
        await db.commit()
    return {"unsubscribed": True}


@router.get("/log")
async def email_log(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(EmailLog).where(EmailLog.user_id == user.id)
        .order_by(EmailLog.sent_at.desc()).limit(50)
    )
    rows = result.scalars().all()
    return [
        {
            "id": r.id,
            "to": r.to_email,
            "subject": r.subject,
            "template": r.template_id,
            "category": r.category,
            "status": r.status,
            "sent_at": r.sent_at,
        }
        for r in rows
    ]
