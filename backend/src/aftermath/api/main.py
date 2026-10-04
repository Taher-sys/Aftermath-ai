from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from aftermath.api.routes import (
    commitments,
    conflicts,
    documents,
    evaluation,
    evidence,
    facts,
    health,
    privacy,
    simulation,
    workspaces,
)
from aftermath.config import settings
from aftermath.database import async_engine
from aftermath.models.base import Base


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Lifespan context manager: initialize database tables if running in SQLite / dev."""
    if "sqlite" in settings.DATABASE_URL:
        async with async_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    yield
    await async_engine.dispose()


app = FastAPI(
    title="AFTERMATH API",
    description="Evidence-Backed Commitment & Consequence Simulator API",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routes under API_V1_PREFIX
app.include_router(health.router, prefix=settings.API_V1_PREFIX)
app.include_router(workspaces.router, prefix=settings.API_V1_PREFIX)
app.include_router(documents.router, prefix=settings.API_V1_PREFIX)
app.include_router(commitments.router, prefix=settings.API_V1_PREFIX)
app.include_router(facts.router, prefix=settings.API_V1_PREFIX)
app.include_router(conflicts.router, prefix=settings.API_V1_PREFIX)
app.include_router(evidence.router, prefix=settings.API_V1_PREFIX)
app.include_router(simulation.router, prefix=settings.API_V1_PREFIX)
app.include_router(evaluation.router, prefix=settings.API_V1_PREFIX)
app.include_router(privacy.router, prefix=settings.API_V1_PREFIX)


@app.get("/")
async def root():
    return {
        "system": "AFTERMATH",
        "description": "AI-Powered Commitment & Consequence Simulator",
        "version": "0.1.0",
        "phase": "Phase 1 — Foundation",
        "docs": "/docs",
    }
