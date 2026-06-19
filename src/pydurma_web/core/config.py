from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    max_upload_mb: int = 10
    min_witnesses: int = 2
    default_language: str = "bo"
    default_output_format: str = "md"
    temp_dir: str | None = None
    max_witness_name_length: int = 100


settings = Settings()
