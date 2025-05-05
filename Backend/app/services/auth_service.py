from datetime import datetime, timedelta
from typing import Optional

from jose import jwt
from passlib.hash import bcrypt
from sqlalchemy.orm import Session

from app.core.config import settings  
from app.dao.user_dao import get_user_by_email, create_user
from app.models.user import User
from app.schemas.auth import UserCreate

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta if expires_delta else timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.verify(plain_password, hashed_password)

def get_user(db: Session, email: str) -> Optional[User]:
    return get_user_by_email(db, email=email)

def create_new_user(db: Session, user_in: UserCreate) -> User:
    db_user = get_user_by_email(db, email=user_in.email)
    if db_user:
        raise ValueError("User with this email already exists")
    hashed_password = bcrypt.hash(user_in.password)
    user = User(email=user_in.email, hashed_password=hashed_password)
    return create_user(db, user)