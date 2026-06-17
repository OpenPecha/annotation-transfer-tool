from typing import List, Literal, Union

from pydantic import BaseModel, Field


class TransferRequest(BaseModel):
    source: str = Field(..., description="Annotated source text")
    target: str = Field(..., description="Target text to receive transferred annotations")
    patterns: List[List[str]] = Field(
        ...,
        description="Annotation patterns as [label, regex] pairs",
    )
    output: Literal["txt", "yaml", "diff"] = "txt"


class TransferResponse(BaseModel):
    result: Union[str, List]
    output_format: str
