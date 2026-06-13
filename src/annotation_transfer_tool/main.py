from fastapi import FastAPI

from annotation_transfer_tool.api.router import api_router

app = FastAPI()
app.include_router(api_router, prefix="/api")
