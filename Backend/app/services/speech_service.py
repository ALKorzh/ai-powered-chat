import whisper
import tempfile
import os
from typing import Optional

class SpeechService:
    def __init__(self):
        # Load the Whisper model
        self.model = whisper.load_model("base")
    
    async def transcribe_audio(self, audio_data: bytes, file_name: str) -> str:
        try:
            # Create a temporary file to store the audio
            with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file_name)[1]) as temp_file:
                temp_file.write(audio_data)
                temp_file_path = temp_file.name

            # Transcribe the audio file
            result = self.model.transcribe(temp_file_path)
            
            # Clean up the temporary file
            os.unlink(temp_file_path)
            
            return result["text"]
        except Exception as e:
            raise Exception(f"Error transcribing audio: {str(e)}") 