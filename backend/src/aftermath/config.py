from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    ENVIRONMENT: str = Field(default="development")
    PORT: int = Field(default=8000)
    HOST: str = Field(default="0.0.0.0")
    API_V1_PREFIX: str = Field(default="/api/v1")
    SECRET_KEY: str = Field(default="dev-secret-key-please-change-in-production")

    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://aftermath:aftermath_dev_secret@localhost:5432/aftermath"
    )
    REDIS_URL: str = Field(default="redis://localhost:6379/0")

    CORS_ORIGINS: str = Field(default="http://localhost:3000,http://127.0.0.1:3000")

    STORAGE_BACKEND: str = Field(default="local")
    STORAGE_LOCAL_PATH: str = Field(default="./data/vault")

    @property
    def cors_origin_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


settings = Settings()
