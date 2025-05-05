from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm

from sqlalchemy.orm import Session

from app.core.security import create_access_token
from app.dependencies import get_db, get_current_user
from app.schemas.auth import Token, UserCreate
from app.models.user import User
from app.services import auth_service

router = APIRouter()

@router.post("/register/", response_model=None)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    try:
        auth_service.create_new_user(db, user_in)
        return {"message": "User registered successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = auth_service.get_user(db, form_data.username)
    if not user or not auth_service.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/users/me/", response_model=None)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return {"email": current_user.email}