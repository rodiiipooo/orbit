from sqlalchemy import String, Integer, Text, ForeignKey, DateTime, JSON, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
import enum
from ..core.database import Base


class PostStatus(str, enum.Enum):
    draft = "draft"
    scheduled = "scheduled"
    published = "published"
    failed = "failed"
    cancelled = "cancelled"


class Post(Base):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    campaign_id: Mapped[int] = mapped_column(ForeignKey("campaigns.id"), nullable=True)

    title: Mapped[str] = mapped_column(String(500), default="")
    body: Mapped[str] = mapped_column(Text, default="")
    media_urls: Mapped[list] = mapped_column(JSON, default=list)
    platforms: Mapped[list] = mapped_column(JSON, default=list)  # ["twitter","linkedin",...]
    platform_post_ids: Mapped[dict] = mapped_column(JSON, default=dict)  # {"twitter": "123"}

    status: Mapped[PostStatus] = mapped_column(
        Enum(PostStatus), default=PostStatus.draft
    )
    scheduled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    published_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)

    hashtags: Mapped[list] = mapped_column(JSON, default=list)
    ai_generated: Mapped[bool] = mapped_column(default=False)
    prompt_used: Mapped[str] = mapped_column(Text, default="")

    # Engagement metrics (synced from platform APIs)
    metrics: Mapped[dict] = mapped_column(JSON, default=dict)
    # {"twitter": {"likes": 0, "retweets": 0, "replies": 0, "impressions": 0}}

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    user = relationship("User", back_populates="posts")
    campaign = relationship("Campaign", back_populates="posts")
