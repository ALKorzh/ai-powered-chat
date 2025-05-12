from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Dict
import re
import json

from app.dependencies import get_db
from app.services.gemini_service import GeminiService
from app.services.speech_service import SpeechService
from app.schemas.chat import ChatMessageCreate, ChatMessageResponse, VoiceMessageCreate, Correction
from app.models.chat import ChatMessage, MessageType
from app.dependencies import get_current_user
from app.models.user import User

router = APIRouter()
gemini_service = GeminiService()
speech_service = SpeechService()

def parse_corrections(response: str) -> tuple[str, List[Dict]]:
    """Parse the response to extract corrections and the actual response."""
    corrections = []
    actual_response = response
    
    # Check if there are corrections in the response
    if "[Correction]" in response:
        # Split the response into correction and actual response parts
        parts = response.split("[", 1)
        if len(parts) > 1:
            correction_part = parts[1].split("]", 1)[0]
            actual_response = parts[1].split("]", 1)[1].strip()
            
            # Parse corrections
            correction_lines = correction_part.split("\n")
            for line in correction_lines:
                if line.strip().startswith("-"):
                    # Extract original and corrected text
                    match = re.search(r'"([^"]+)"\s+should be\s+"([^"]+)"\s+\(([^)]+)\)', line)
                    if match:
                        original, corrected, explanation = match.groups()
                        corrections.append({
                            "original": original,
                            "corrected": corrected,
                            "explanation": explanation
                        })
    
    return actual_response, corrections

@router.post("/chat", response_model=ChatMessageResponse)
async def create_chat_message(
    message: ChatMessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get response from Gemini
    response = await gemini_service.get_response(message.message)
    
    # Parse corrections and actual response
    actual_response, corrections = parse_corrections(response)
    
    # Create chat message in database
    db_message = ChatMessage(
        user_id=current_user.id,
        message_type=message.message_type.value,  # Use the enum value directly
        message=message.message,
        response=actual_response,
        corrections=json.dumps(corrections) if corrections else None
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    
    return db_message

@router.post("/chat/voice", response_model=ChatMessageResponse)
async def create_voice_message(
    audio_file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Read audio file
    audio_data = await audio_file.read()
    
    # Transcribe audio to text
    transcribed_text = await speech_service.transcribe_audio(audio_data, audio_file.filename)
    
    # Get response from Gemini
    response = await gemini_service.get_response(transcribed_text)
    
    # Parse corrections and actual response
    actual_response, corrections = parse_corrections(response)
    
    # Create chat message in database
    db_message = ChatMessage(
        user_id=current_user.id,
        message_type=MessageType.VOICE,  # The enum instance has the correct lowercase value
        message=transcribed_text,
        response=actual_response,
        corrections=json.dumps(corrections) if corrections else None
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    
    return db_message

@router.get("/chat/history", response_model=List[ChatMessageResponse])
async def get_chat_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    messages = db.query(ChatMessage).filter(
        ChatMessage.user_id == current_user.id
    ).order_by(ChatMessage.timestamp.desc()).all()
    return messages 