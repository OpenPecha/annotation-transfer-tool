from pydantic import BaseModel


class UploadResponse(BaseModel):
    content: str
    filename: str
