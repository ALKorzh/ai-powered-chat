from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Dict
import re
import json
import logging

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
logger = logging.getLogger(__name__)

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
    try:
        logger.info(f"Received voice message from user {current_user.id}")
        logger.info(f"Audio file details - filename: {audio_file.filename}, content_type: {audio_file.content_type}")
        
        # Read audio file
        audio_data = await audio_file.read()
        logger.info(f"Audio data size: {len(audio_data)} bytes")
        
        # Transcribe audio to text
        logger.info("Starting audio transcription...")
        transcribed_text = await speech_service.transcribe_audio(audio_data, audio_file.filename)
        logger.info(f"Audio transcribed successfully: {transcribed_text[:100]}...")
        
        # Get response from Gemini
        logger.info("Getting response from Gemini...")
        response = await gemini_service.get_response(transcribed_text)
        logger.info("Received response from Gemini")
        
        # Parse corrections and actual response
        actual_response, corrections = parse_corrections(response)
        
        # Create chat message in database
        db_message = ChatMessage(
            user_id=current_user.id,
            message_type=MessageType.VOICE,
            message=transcribed_text,
            response=actual_response,
            corrections=json.dumps(corrections) if corrections else None
        )
        db.add(db_message)
        db.commit()
        db.refresh(db_message)
        logger.info(f"Voice message processed and saved to database with id {db_message.id}")
        
        return db_message
    except Exception as e:
        logger.error(f"Error processing voice message: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error processing voice message: {str(e)}")

@router.get("/chat/history", response_model=List[ChatMessageResponse])
async def get_chat_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    messages = db.query(ChatMessage).filter(
        ChatMessage.user_id == current_user.id
    ).order_by(ChatMessage.timestamp.desc()).all()
    return messages 