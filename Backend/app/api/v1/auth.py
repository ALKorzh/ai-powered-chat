from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.security import create_access_token
from app.dependencies import get_db, get_current_user
from app.schemas.auth import Token, UserCreate
from app.models.user import User
from app.services import auth_service
from app.core.config import settings
from fastapi.responses import RedirectResponse

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

# Google OAuth2 routes
@router.get("/login/google")
async def google_login(request: Request):
    oauth = request.app.state.oauth
    google = oauth.create_client('google')
    redirect_uri = str(request.url_for('auth'))
    return await google.authorize_redirect(request, redirect_uri)

@router.get("/auth")
async def auth(request: Request, db: Session = Depends(get_db)):
    oauth = request.app.state.oauth
    google = oauth.create_client('google')
    
    try:
        # Get token from Google
        token = await google.authorize_access_token(request)
        if not token:
            raise HTTPException(status_code=400, detail="Failed to get access token from Google")
            
        # Get user info directly from the token
        user_info = token.get('userinfo')
        if not user_info:
            raise HTTPException(status_code=400, detail="Failed to get user information")
            
        # Check if user exists with this email
        user = auth_service.get_user_by_email(db, user_info["email"])

        if not user:
            # If user not found, create new user
            try:
                new_user = User(
                    email=user_info["email"],
                    username=user_info.get("name", "Google User"),
                    hashed_password=None,  # Empty password for Google OAuth users
                )
                db.add(new_user)
                db.commit()
                db.refresh(new_user)
                user = new_user
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Error creating user: {str(e)}")

        # Create token for authenticated user
        access_token = create_access_token(data={"sub": user.email})
        
        # Redirect to frontend with token
        frontend_url = f"{settings.FRONTEND_URL}/auth/callback?token={access_token}"
        return RedirectResponse(url=frontend_url)
            
    except Exception as e:
        print(f"OAuth error: {str(e)}")
        frontend_url = f"{settings.FRONTEND_URL}/auth/error?error={str(e)}"
        return RedirectResponse(url=frontend_url)
