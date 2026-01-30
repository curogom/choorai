from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """애플리케이션 설정"""

    model_config = SettingsConfigDict(env_file=".env")

    app_name: str = "B2C Todo API"
    version: str = "0.1.0"
    environment: str = "development"
    allowed_origins: list[str] = ["http://localhost:5174"]


settings = Settings()
