from __future__ import annotations

import re
from pathlib import Path
from typing import Literal

from Pydurma.aligners.fdmp import FDMPaligner
from Pydurma.bo.normalizer_bo import TibetanNormalizer
from Pydurma.bo.tokenizer_bo import TibetanTokenizer
from Pydurma.encoder import Encoder
from Pydurma.gen.normalizer_gen import GenericNormalizer
from Pydurma.gen.tokenizer_gen import GenericTokenizer
from Pydurma.input_filters.pattern_filter import PatternInputFilter
from Pydurma.serializers.csv import CSVSerializer
from Pydurma.serializers.docx import DocxSerializer
from Pydurma.serializers.hfml import HFMLSerializer
from Pydurma.serializers.md import MdSerializer
from Pydurma.serializers.plain_text import PlainTextSerializer
from Pydurma.tokenizer import Tokenizer, TokenList
from Pydurma.weighers.matrix_weigher import TokenMatrixWeigher
from Pydurma.weighers.token_weigher_count import TokenCountWeigher

from pydurma_web.schemas.collation import OutputFormat

Language = Literal["bo", "generic"]

FORMAT_EXTENSIONS: dict[OutputFormat, str] = {
    "txt": "txt",
    "md": "md",
    "csv": "csv",
    "docx": "docx",
    "hfml": "txt",
}

FORMAT_MEDIA_TYPES: dict[OutputFormat, str] = {
    "txt": "text/plain; charset=utf-8",
    "md": "text/markdown; charset=utf-8",
    "csv": "text/csv; charset=utf-8",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "hfml": "text/plain; charset=utf-8",
}


def build_tokenizer(language: Language) -> Tokenizer:
    encoder = Encoder()
    if language == "bo":
        normalizer = TibetanNormalizer()
        return TibetanTokenizer(encoder, normalizer)
    normalizer = GenericNormalizer()
    return GenericTokenizer(encoder, normalizer)


def build_aligner() -> FDMPaligner:
    return FDMPaligner()


def build_weigher() -> TokenMatrixWeigher:
    weigher = TokenMatrixWeigher()
    weigher.add_weigher(TokenCountWeigher(), weigher_weight=1)
    return weigher


def tokenize_text(
    tokenizer: Tokenizer,
    text: str,
    filter_patterns: list[tuple[str, str]],
) -> tuple[str, TokenList]:
    version_text = text.replace("། ་", "། །")
    for pattern, replacement in filter_patterns:
        version_text = PatternInputFilter(
            version_text, re.compile(pattern), replacement
        ).get_string()

    result = tokenizer.tokenize(version_text)
    if isinstance(tokenizer, GenericTokenizer):
        token_list, token_string = result
    else:
        token_string, token_list = result
    return token_string, token_list


def serialize_matrix(
    output_format: OutputFormat,
    weighted_matrix,
    output_dir: Path,
    text_id: str,
    version_paths: list[Path],
    versions_to_serialize: dict[str, str],
) -> str:
    if output_format == "txt":
        serializer = PlainTextSerializer(weighted_matrix, output_dir, text_id)
        return serializer.serialize_matrix()
    if output_format == "md":
        serializer = MdSerializer(
            weighted_matrix,
            output_dir,
            text_id,
            version_paths,
            versions_to_serialize,
        )
        return serializer.serialize_matrix()
    if output_format == "csv":
        serializer = CSVSerializer(weighted_matrix, output_dir, text_id)
        rows = serializer.serialize_matrix()
        return "\n".join(",".join(row) for row in rows)
    if output_format == "docx":
        serializer = DocxSerializer(
            weighted_matrix,
            output_dir,
            text_id,
            version_paths,
            versions_to_serialize,
        )
        return serializer.serialize_matrix()
    if output_format == "hfml":
        serializer = HFMLSerializer(
            weighted_matrix,
            output_dir,
            text_id,
            version_paths,
            versions_to_serialize,
        )
        return serializer.serialize_matrix()
    raise ValueError(f"Unsupported output format: {output_format}")


def export_to_bytes(
    output_format: OutputFormat,
    weighted_matrix,
    output_dir: Path,
    text_id: str,
    version_paths: list[Path],
    versions_to_serialize: dict[str, str],
) -> tuple[bytes, str, str]:
    ext = FORMAT_EXTENSIONS[output_format]
    filename = f"{text_id}.{ext}"
    media_type = FORMAT_MEDIA_TYPES[output_format]

    if output_format == "docx":
        serializer = DocxSerializer(
            weighted_matrix,
            output_dir,
            text_id,
            version_paths,
            versions_to_serialize,
        )
        md_content = serializer.serialize_matrix()
        output_path = serializer.save_serialized_matrix(md_content)
        return output_path.read_bytes(), filename, media_type

    if output_format == "csv":
        serializer = CSVSerializer(weighted_matrix, output_dir, text_id)
        rows = serializer.serialize_matrix()
        output_path = serializer.save_serialized_matrix(rows)
        return output_path.read_bytes(), filename, media_type

    if output_format == "hfml":
        serializer = HFMLSerializer(
            weighted_matrix,
            output_dir,
            text_id,
            version_paths,
            versions_to_serialize,
        )
        content = serializer.serialize_matrix()
        output_path = serializer.save_serialized_matrix(content)
        return output_path.read_bytes(), filename, media_type

    if output_format == "md":
        serializer = MdSerializer(
            weighted_matrix,
            output_dir,
            text_id,
            version_paths,
            versions_to_serialize,
        )
        content = serializer.serialize_matrix()
        output_path = serializer.save_serialized_matrix(content)
        return output_path.read_bytes(), filename, media_type

    serializer = PlainTextSerializer(weighted_matrix, output_dir, text_id)
    content = serializer.serialize_matrix()
    output_path = serializer.save_serialized_matrix(content)
    return output_path.read_bytes(), filename, media_type


def build_vulgate(weighted_matrix, output_dir: Path, text_id: str) -> str:
    serializer = PlainTextSerializer(weighted_matrix, output_dir, text_id)
    return serializer.serialize_matrix()
