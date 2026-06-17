from fastapi import APIRouter

from annotation_transfer_tool.schemas.transfer import TransferRequest, TransferResponse
from annotation_transfer_tool.services.transfer import run_transfer

router = APIRouter()


@router.post("/transfer", response_model=TransferResponse)
def transfer_annotations(request: TransferRequest) -> TransferResponse:
    return run_transfer(request)
