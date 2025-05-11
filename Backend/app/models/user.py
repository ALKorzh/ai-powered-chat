from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import declarative_base, relationship
from passlib.hash import bcrypt

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String)
    hashed_password = Column(String, nullable=True)
    
    # Relationship with ChatMessage
    messages = relationship("ChatMessage", back_populates="user")

    @hybrid_property
    def password(self):
        raise AttributeError("password is not a readable attribute")

    @password.setter
    def password(self, password):
        self.hashed_password = bcrypt.hash(password)

    def verify_password(self, password):
        return bcrypt.verify(password, self.hashed_password)