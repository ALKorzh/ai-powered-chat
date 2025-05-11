from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.core.oauth import init_oauth
from starlette.middleware.sessions import SessionMiddleware
from app.core.config import settings

Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = [
    "http://localhost:5173",  # Добавьте домен вашего React приложения
    # "https://your-production-frontend.com", # Пример для продакшена
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add Session Middleware
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SECRET_KEY,
    session_cookie="session",
    max_age=1800,  # 30 minutes
    same_site="lax",
    https_only=False  # Set to True in production
)

# Initialize OAuth
oauth = init_oauth()
app.state.oauth = oauth

# Include routers
from app.api.v1 import auth, chat

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(chat.router, prefix="/api", tags=["chat"])
