from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile

from annotation_transfer_tool.schemas.upload import UploadResponse

router = APIRouter()

ALLOWED_EXTENSIONS = {".txt", ".json", ".csv", ".xml", ".md", ".yaml", ".yml"}


@router.post("/upload", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)) -> UploadResponse:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename is required")

    suffix = Path(file.filename).suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {suffix or 'unknown'}",
        )

    raw = await file.read()
    try:
        content = raw.decode("utf-8")
    except UnicodeDecodeError as exc:
        raise HTTPException(
            status_code=400,
            detail="File must be UTF-8 text",
        ) from exc

    return UploadResponse(content=content, filename=file.filename)
