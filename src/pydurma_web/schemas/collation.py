from typing import Dict, List, Literal, Optional, Tuple

from pydantic import BaseModel, Field


class WitnessInfo(BaseModel):
    name: str
    index: int


class AlignmentCell(BaseModel):
    name: str
    token: str
    weight: int = 0


class VariantSelection(BaseModel):
    kind: Literal["preset"] = "preset"
    witness_name: str


class RowSelectionState(BaseModel):
    selection: VariantSelection
    confirmed: bool = False


class AlignmentRow(BaseModel):
    index: int
    is_variant: bool
    cells: List[AlignmentCell]
    options: List[str] = Field(default_factory=list)
    suggested_token: str
    selection: Optional[VariantSelection] = None
    confirmed: bool = False


class CollationMetadata(BaseModel):
    base_witness: str
    witness_count: int
    language: str


class CollationResponse(BaseModel):
    job_id: str
    witnesses: List[WitnessInfo]
    rows: List[AlignmentRow]
    suggested_vulgate: str
    variant_count: int
    unresolved_count: int
    metadata: CollationMetadata


class ExportRequest(BaseModel):
    format: "OutputFormat"
    selections: Optional[Dict[str, RowSelectionState]] = None


class SelectionsUpdateRequest(BaseModel):
    selections: Dict[str, RowSelectionState]


class OptionItem(BaseModel):
    id: str
    label: str


class OptionsResponse(BaseModel):
    languages: List[OptionItem]
    export_formats: List[OptionItem]


Language = Literal["bo", "generic"]
OutputFormat = Literal["txt", "md", "csv", "docx", "hfml"]


class CollationConfig(BaseModel):
    language: Language = "bo"
    base_witness_name: Optional[str] = None
    filter_patterns: List[Tuple[str, str]] = Field(default_factory=list)


def validate_witness_names(names: List[str], max_length: int = 100) -> List[str]:
    cleaned = [name.strip() for name in names]
    if any(not name for name in cleaned):
        raise ValueError("Witness names cannot be empty")
    if any(len(name) > max_length for name in cleaned):
        raise ValueError(f"Witness names cannot exceed {max_length} characters")
    lowered = [name.lower() for name in cleaned]
    if len(set(lowered)) != len(cleaned):
        raise ValueError("Witness names must be unique")
    return cleaned


ExportRequest.model_rebuild()
