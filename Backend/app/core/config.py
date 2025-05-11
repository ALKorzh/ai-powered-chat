from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str 
    ACCESS_TOKEN_EXPIRE_MINUTES: int 

    # Frontend URL
    FRONTEND_URL: str 

    # Google OAuth2
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    GOOGLE_REDIRECT_URI: str
    GOOGLE_API_SCOPE: str
    GOOGLE_DISCOVERY_URL: str

    class Config:
        env_file = ".env" 

settings = Settings()