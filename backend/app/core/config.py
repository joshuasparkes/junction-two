import os
from typing import Any, Dict, List, Optional, Union

from pydantic import AnyHttpUrl, PostgresDsn, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "development_secret_key")
    # 60 minutes * 24 hours * 8 days = 8 days
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8

    # CORS Configuration
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # Database Configuration
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "postgres")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "Junction Two")
    SQLALCHEMY_DATABASE_URI: Optional[PostgresDsn] = None

    @field_validator("SQLALCHEMY_DATABASE_URI", mode="before")
    def assemble_db_connection(cls, v: Optional[str], info) -> Any:
        if isinstance(v, str):
            return v

        # Get values from the model being validated
        values = info.data if hasattr(info, "data") else {}

        return PostgresDsn.build(
            scheme="postgresql",
            username=values.get("POSTGRES_USER")
            or os.getenv("POSTGRES_USER", "postgres"),
            password=values.get("POSTGRES_PASSWORD")
            or os.getenv("POSTGRES_PASSWORD", "postgres"),
            host=values.get("POSTGRES_SERVER")
            or os.getenv("POSTGRES_SERVER", "localhost"),
            path=f"{values.get('POSTGRES_DB') or os.getenv('POSTGRES_DB', 'Junction Two')}",
        )

    # Redis Configuration
    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", "6379"))

    # Celery Configuration
    CELERY_BROKER_URL: str = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
    CELERY_RESULT_BACKEND: str = os.getenv(
        "CELERY_RESULT_BACKEND", "redis://localhost:6379/0"
    )

    # Project Configuration
    PROJECT_NAME: str = "Junction Two"

    model_config = SettingsConfigDict(case_sensitive=True)


settings = Settings()
