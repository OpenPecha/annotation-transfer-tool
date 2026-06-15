from fastapi import APIRouter

from annotation_transfer_tool.api.routes import health, transfer, upload

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(transfer.router)
api_router.include_router(upload.router)
