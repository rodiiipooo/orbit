from sqlalchemy import String, Text, ForeignKey, DateTime, Integer
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime, timezone
from ..core.database import Base


class EmailLog(Base):
    """Tracks every email sent — drip, outreach, or manual."""
    __tablename__ = "email_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=True)
    to_email: Mapped[str] = mapped_column(String(255))
    to_name: Mapped[str] = mapped_column(String(255), default="")
    from_email: Mapped[str] = mapped_column(String(255))
    subject: Mapped[str] = mapped_column(String(500))
    template_id: Mapped[str] = mapped_column(String(100), default="")
    sender_role: Mapped[str] = mapped_column(String(50), default="founder")
    category: Mapped[str] = mapped_column(String(50), default="drip")  # drip|outreach|support
    resend_id: Mapped[str] = mapped_column(String(255), default="")
    status: Mapped[str] = mapped_column(String(50), default="sent")
    sent_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )


class DripEnrollment(Base):
    """Tracks which drip day a user is on."""
    __tablename__ = "drip_enrollments"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)
    enrolled_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    last_step_sent: Mapped[int] = mapped_column(Integer, default=0)
    last_sent_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    unsubscribed: Mapped[bool] = mapped_column(default=False)
    unsubscribed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
