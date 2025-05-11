from typing import Optional

from jose import jwt
from passlib.hash import bcrypt
from sqlalchemy.orm import Session

from app.dao.user_dao import get_user_by_email, get_user_by_username, create_user
from app.models.user import User
from app.schemas.auth import UserCreate

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.verify(plain_password, hashed_password)

def get_user(db: Session, email: str) -> Optional[User]:
    return get_user_by_email(db, email=email)

def create_new_user(db: Session, user_in: UserCreate) -> User:
    db_user = get_user_by_email(db, email=user_in.email)
    if db_user:
        raise ValueError("User with this email already exists")
    
    db_user = get_user_by_username(db, username=user_in.username)
    if db_user:
        raise ValueError("User with this username already exists")
        
    hashed_password = bcrypt.hash(user_in.password)
    user = User(
        email=user_in.email,
        username=user_in.username,
        hashed_password=hashed_password
    )
    return create_user(db, user)