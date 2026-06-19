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

    fast_antx_available = False
    try:
        import fast_antx  # noqa: F401

        fast_antx_available = True
    except ImportError:
        fast_antx_available = False

    return {
        "status": "ok",
        "fast_antx": fast_antx_available,
        "pydurma_available": pydurma_available,
    }
