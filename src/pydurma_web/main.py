from __future__ import annotations

from pathlib import Path

import uvicorn
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from pydurma_web.api.router import api_router


def find_frontend_dir() -> Path | None:
    candidates = [
        Path.cwd() / "frontend" / "dist",
        Path(__file__).resolve().parents[2] / "frontend" / "dist",
    ]
    for candidate in candidates:
        if candidate.is_dir():
            return candidate
    return None


app = FastAPI(title="Pydurma Web")
app.include_router(api_router, prefix="/api")

frontend_dir = find_frontend_dir()
if frontend_dir is not None:
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")


def run() -> None:
    uvicorn.run(
        "pydurma_web.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )


if __name__ == "__main__":
    run()
