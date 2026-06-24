from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    app_name: str = "Orbit"
    debug: bool = False
    secret_key: str = "change-me-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 30

    database_url: str = "postgresql+asyncpg://orbit:orbit@localhost/orbitdb"
    redis_url: str = "redis://localhost:6379/0"

    anthropic_api_key: Optional[str] = None
    replicate_api_token: Optional[str] = None

    twitter_client_id: Optional[str] = None
    twitter_client_secret: Optional[str] = None
    linkedin_client_id: Optional[str] = None
    linkedin_client_secret: Optional[str] = None
    facebook_app_id: Optional[str] = None
    facebook_app_secret: Optional[str] = None
    instagram_client_id: Optional[str] = None
    tiktok_client_key: Optional[str] = None
    tiktok_client_secret: Optional[str] = None

    frontend_url: str = "http://localhost:3000"

    class Config:
        env_file = ".env"


settings = Settings()
