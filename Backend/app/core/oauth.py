from authlib.integrations.starlette_client import OAuth
from app.core.config import settings
from fastapi import HTTPException

oauth = OAuth()

def init_oauth():
    try:
        if not all([
            settings.GOOGLE_CLIENT_ID,
            settings.GOOGLE_CLIENT_SECRET,
            settings.GOOGLE_DISCOVERY_URL,
            settings.GOOGLE_API_SCOPE
        ]):
            raise ValueError("Missing required Google OAuth settings")

        oauth.register(
            name='google',
            client_id=settings.GOOGLE_CLIENT_ID,
            client_secret=settings.GOOGLE_CLIENT_SECRET,
            server_metadata_url=settings.GOOGLE_DISCOVERY_URL,
            client_kwargs={'scope': settings.GOOGLE_API_SCOPE}
        )
        return oauth
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to initialize OAuth: {str(e)}"
        ) 