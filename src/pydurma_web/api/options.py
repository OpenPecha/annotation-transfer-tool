from fastapi import APIRouter

from pydurma_web.schemas.collation import OptionItem, OptionsResponse

router = APIRouter()

_LANGUAGES = [
    OptionItem(id="bo", label="Tibetan"),
    OptionItem(id="generic", label="Generic / English"),
]

_EXPORT_FORMATS = [
    OptionItem(id="txt", label="Plain text"),
    OptionItem(id="md", label="Markdown"),
    OptionItem(id="csv", label="CSV"),
    OptionItem(id="docx", label="DOCX"),
    OptionItem(id="hfml", label="HFML"),
]


@router.get("/options", response_model=OptionsResponse)
async def get_options() -> OptionsResponse:
    return OptionsResponse(
        languages=_LANGUAGES,
        export_formats=_EXPORT_FORMATS,
    )
