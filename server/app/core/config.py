import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    API_KEY: str = os.getenv("API_KEY", "your-secret-key")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./data/sql_app.db")
    
    # Power measurement defaults (in Watts)
    # Default for Intel NUC is around 5.0W idle, 15.0W peak.
    # Default for mini-PCs is around 5.0W - 15.0W.
    # Users can override these via environment variables.
    POWER_BASE_W: float = float(os.getenv("POWER_BASE_W", "5.0"))
    POWER_MAX_W: float = float(os.getenv("POWER_MAX_W", "15.0"))
    
    # Cron interval in seconds (default is 1 hour = 3600 seconds)
    COLLECTION_INTERVAL_SECONDS: int = int(os.getenv("COLLECTION_INTERVAL_SECONDS", "3600"))

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
