from __future__ import annotations

import shutil
import tempfile
from pathlib import Path
from typing import List, Literal, Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from pydurma_web.core.config import settings
from pydurma_web.core.exceptions import CollationError, WitnessValidationError
from pydurma_web.schemas.collation import (
    CollationConfig,
    CollationResponse,
    SelectionsUpdateRequest,
    validate_witness_names,
)
from pydurma_web.services.collation import CollationService
from pydurma_web.services.matrix import Witness

router = APIRouter()
collation_service = CollationService()


@router.post("/collation", response_model=CollationResponse)
async def collate_texts(
    files: list[UploadFile] = File(...),
    names: list[str] = Form(...),
    base_witness_name: Optional[str] = Form(default=None),
    language: Literal["bo", "generic"] = Form(default="bo"),
) -> CollationResponse:
    witnesses = await _parse_witness_uploads(files, names)
    config = CollationConfig(
        language=language,
        base_witness_name=base_witness_name.strip()
        if base_witness_name and base_witness_name.strip()
        else None,
    )
    try:
        return collation_service.run_plain_text(witnesses, config)
    except WitnessValidationError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except CollationError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.put("/collation/{job_id}/selections")
async def update_selections(job_id: str, body: SelectionsUpdateRequest) -> dict:
    if not collation_service.update_selections(job_id, body.selections):
        raise HTTPException(status_code=404, detail="Collation session not found")
    return {"ok": True}


async def _parse_witness_uploads(
    files: List[UploadFile], names: List[str]
) -> list[Witness]:
    if len(files) < settings.min_witnesses:
        raise HTTPException(
            status_code=422,
            detail=f"At least {settings.min_witnesses} witness files are required",
        )
    if len(files) != len(names):
        raise HTTPException(
            status_code=422,
            detail="The number of files must match the number of witness names",
        )

    try:
        cleaned_names = validate_witness_names(
            names, max_length=settings.max_witness_name_length
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    max_bytes = settings.max_upload_mb * 1024 * 1024
    temp_dir = tempfile.mkdtemp(dir=settings.temp_dir)
    witnesses: list[Witness] = []

    try:
        for index, (upload, name) in enumerate(zip(files, cleaned_names)):
            if not upload.filename or not upload.filename.lower().endswith(".txt"):
                raise HTTPException(
                    status_code=422,
                    detail=f"Witness '{name}' must be a .txt file",
                )

            contents = await upload.read()
            if len(contents) > max_bytes:
                raise HTTPException(
                    status_code=422,
                    detail=f"Witness '{name}' exceeds the {settings.max_upload_mb}MB limit",
                )

            internal_path = Path(temp_dir) / f"witness_{index}.txt"
            internal_path.write_bytes(contents)
            witnesses.append(Witness(name=name, path=internal_path))
        return witnesses
    except HTTPException:
        shutil.rmtree(temp_dir, ignore_errors=True)
        raise
    except Exception:
        shutil.rmtree(temp_dir, ignore_errors=True)
        raise
