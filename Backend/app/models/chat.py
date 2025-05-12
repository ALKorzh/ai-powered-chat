from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum, JSON, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from .user import Base

class MessageType(enum.Enum):
    TEXT = "TEXT"
    VOICE = "VOICE"

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    message_type = Column(Enum(MessageType, name='message_type', create_constraint=True, validate_strings=True), default=MessageType.TEXT)
    message = Column(String)
    response = Column(String)
    corrections = Column(JSON, nullable=True)  # Store corrections as JSON
    is_corrected = Column(Boolean, default=False)  # Flag indicating if corrections were made
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationship with User
    user = relationship("User", back_populates="messages") 