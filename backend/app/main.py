from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .core.config import settings
from .core.database import init_db
from .routers import auth, content, schedule, analytics, platforms, emails


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="Orbit API",
    version="1.0.0",
    description="AI-powered cross-platform marketing facilitator",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(content.router, prefix="/api")
app.include_router(schedule.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(platforms.router, prefix="/api")
app.include_router(emails.router, prefix="/api")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "orbit-api"}
