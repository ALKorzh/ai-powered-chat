from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from .user import Base

class MessageType(enum.Enum):
    TEXT = "text"
    VOICE = "voice"

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    message_type = Column(Enum(MessageType), default=MessageType.TEXT)
    message = Column(String)
    response = Column(String)
    corrections = Column(JSON, nullable=True)  # Store corrections as JSON
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationship with User
    user = relationship("User", back_populates="messages") 