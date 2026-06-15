from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from annotation_transfer_tool.api.router import api_router

app = FastAPI()
app.include_router(api_router, prefix="/api")

_FRONTEND_DIST = Path(__file__).resolve().parents[2] / "frontend" / "dist"
_ASSETS_DIR = _FRONTEND_DIST / "assets"


def _setup_frontend(fastapi_app: FastAPI) -> None:
    if not _FRONTEND_DIST.is_dir():
        return

    if _ASSETS_DIR.is_dir():
        fastapi_app.mount(
            "/assets",
            StaticFiles(directory=_ASSETS_DIR),
            name="assets",
        )

    @fastapi_app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str = ""):
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="Not Found")

        if full_path:
            file_path = _FRONTEND_DIST / full_path
            if file_path.is_file():
                return FileResponse(file_path)

        index = _FRONTEND_DIST / "index.html"
        if not index.is_file():
            raise HTTPException(status_code=404, detail="Frontend not built")
        return FileResponse(index)


_setup_frontend(app)
