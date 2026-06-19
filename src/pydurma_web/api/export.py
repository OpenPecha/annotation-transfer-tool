from fastapi import APIRouter, HTTPException
from fastapi.responses import Response

from pydurma_web.core.exceptions import WitnessValidationError
from pydurma_web.schemas.collation import ExportRequest
from pydurma_web.services.collation import CollationService

router = APIRouter()
collation_service = CollationService()


@router.post("/export/{job_id}")
async def export_collation(job_id: str, body: ExportRequest) -> Response:
    try:
        result = collation_service.export(job_id, body)
    except WitnessValidationError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except OSError as exc:
        if "pandoc" in str(exc).lower():
            raise HTTPException(
                status_code=503,
                detail="DOCX export requires pandoc. Install it (e.g. brew install pandoc) or choose txt/md/csv.",
            ) from exc
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    if result is None:
        raise HTTPException(status_code=404, detail="Collation session not found")

    content, filename, media_type = result
    return Response(
        content=content,
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
