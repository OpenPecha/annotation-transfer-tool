from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
def health_check() -> dict:
    pydurma_available = False
    try:
        import Pydurma  # noqa: F401

        pydurma_available = True
    except ImportError:
        pydurma_available = False

    return {"status": "ok", "pydurma_available": pydurma_available}
