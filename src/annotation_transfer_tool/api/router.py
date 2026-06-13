from fastapi import APIRouter

from annotation_transfer_tool.api.routes import health

api_router = APIRouter()
api_router.include_router(health.router)
