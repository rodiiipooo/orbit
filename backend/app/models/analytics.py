from sqlalchemy import String, Integer, Float, ForeignKey, DateTime, JSON, Text
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime, timezone
from ..core.database import Base


class AnalyticsSnapshot(Base):
    """Daily rollup of engagement metrics per platform per user."""
    __tablename__ = "analytics_snapshots"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    platform: Mapped[str] = mapped_column(String(50))
    date: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    impressions: Mapped[int] = mapped_column(Integer, default=0)
    reach: Mapped[int] = mapped_column(Integer, default=0)
    engagements: Mapped[int] = mapped_column(Integer, default=0)
    clicks: Mapped[int] = mapped_column(Integer, default=0)
    followers_gained: Mapped[int] = mapped_column(Integer, default=0)
    conversions: Mapped[int] = mapped_column(Integer, default=0)

    posts_count: Mapped[int] = mapped_column(Integer, default=0)
    avg_engagement_rate: Mapped[float] = mapped_column(Float, default=0.0)

    breakdown: Mapped[dict] = mapped_column(JSON, default=dict)
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )


class CausalInsight(Base):
    """Stored causal inference results for a user."""
    __tablename__ = "causal_insights"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    treatment: Mapped[str] = mapped_column(String(255))   # e.g. "posting_on_tuesday"
    outcome: Mapped[str] = mapped_column(String(255))      # e.g. "engagements"
    ate: Mapped[float] = mapped_column(Float)              # average treatment effect
    ci_lower: Mapped[float] = mapped_column(Float)
    ci_upper: Mapped[float] = mapped_column(Float)
    p_value: Mapped[float] = mapped_column(Float)
    method: Mapped[str] = mapped_column(String(100))       # dowhy|regression|did
    interpretation: Mapped[str] = mapped_column(Text, default="")
    computed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
