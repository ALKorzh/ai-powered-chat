from sqlalchemy.orm import Session
from app.models.user import User

# DB sql operations for users table
def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def create_user(db: Session, user):
    db_user = User(
        email=user.email,
        username=user.username,
        hashed_password=user.hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user