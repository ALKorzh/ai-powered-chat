import os
import sys
import tempfile
from typing import Optional
import logging

# Add FFmpeg path to system PATH
ffmpeg_path = "C:\\ffmpeg\\bin"  # Standard installation path
if os.path.exists(ffmpeg_path):
    os.environ["PATH"] = ffmpeg_path + os.pathsep + os.environ["PATH"]
    sys.path.append(ffmpeg_path)

import whisper

logger = logging.getLogger(__name__)

class SpeechService:
    def __init__(self):
        try:
            # Load the Whisper model
            self.model = whisper.load_model("small")
            logger.info("Whisper model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load Whisper model: {str(e)}")
            raise Exception("Failed to initialize speech recognition service. Please check if FFmpeg is installed and Whisper model is available.")
    
    async def transcribe_audio(self, audio_data: bytes, file_name: str) -> str:
        if not audio_data:
            raise ValueError("No audio data provided")
            
        try:
            # Create a temporary file to store the audio
            with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file_name)[1]) as temp_file:
                temp_file.write(audio_data)
                temp_file_path = temp_file.name

            # Transcribe the audio file
            result = self.model.transcribe(temp_file_path)
            
            # Clean up the temporary file
            os.unlink(temp_file_path)
            
            if not result or "text" not in result:
                raise Exception("Transcription failed - no text was generated")
                
            return result["text"].strip()
            
        except Exception as e:
            logger.error(f"Error transcribing audio: {str(e)}")
            raise Exception(f"Error transcribing audio: {str(e)}") 