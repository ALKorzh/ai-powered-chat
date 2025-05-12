from pydantic import BaseModel, validator
from datetime import datetime
from typing import Optional, List, Dict, Any
from app.models.chat import MessageType

class Correction(BaseModel):
    original: str
    corrected: str
    explanation: str

class ChatMessageBase(BaseModel):
    message: str
    message_type: MessageType = MessageType.TEXT

    @validator('message_type', pre=True)
    def validate_message_type(cls, v):
        if isinstance(v, str):
            try:
                return MessageType(v.upper())
            except ValueError:
                raise ValueError(f"Invalid message type. Must be one of: {[e.value for e in MessageType]}")
        return v

class ChatMessageCreate(ChatMessageBase):
    pass

class ChatMessageResponse(ChatMessageBase):
    id: int
    user_id: int
    response: str
    corrections: Optional[List[Correction]] = None
    is_corrected: bool = False
    timestamp: datetime

    class Config:
        from_attributes = True

class VoiceMessageCreate(BaseModel):
    audio_data: bytes
    file_name: str 