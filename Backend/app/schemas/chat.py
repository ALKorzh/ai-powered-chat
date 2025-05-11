from pydantic import BaseModel
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

class ChatMessageCreate(ChatMessageBase):
    pass

class ChatMessageResponse(ChatMessageBase):
    id: int
    user_id: int
    response: str
    corrections: Optional[List[Correction]] = None
    timestamp: datetime

    class Config:
        from_attributes = True

class VoiceMessageCreate(BaseModel):
    audio_data: bytes
    file_name: str 