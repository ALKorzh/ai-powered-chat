from typing import Optional
from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import declarative_base, relationship
from passlib.hash import bcrypt


Base = declarative_base()

# Exact DB users models implementation in python 
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String)
    hashed_password = Column(String, nullable=True)

    # Relationship with ChatMessage
    messages = relationship("ChatMessage", back_populates="user")


