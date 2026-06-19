from fastapi import APIRouter

from annotation_transfer_tool.api.routes import transfer
from pydurma_web.api import collation, export, options
from webuddhsit_tools.api import health

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(transfer.router, tags=["transfer"])
api_router.include_router(options.router, tags=["options"])
api_router.include_router(collation.router, tags=["collation"])
api_router.include_router(export.router, tags=["export"])
