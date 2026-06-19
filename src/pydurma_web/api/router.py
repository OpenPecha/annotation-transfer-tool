from fastapi import APIRouter

from pydurma_web.api import collation, export, health, options

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(options.router, tags=["options"])
api_router.include_router(collation.router, tags=["collation"])
api_router.include_router(export.router, tags=["export"])
