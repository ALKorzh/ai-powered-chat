import google.generativeai as genai
from typing import Optional, Dict
import os
from dotenv import load_dotenv
from app.core.config import settings

load_dotenv()

class GeminiService:
    def __init__(self):
        api_key = settings.GEMINI_API_KEY
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is not set")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.0-flash')
        self.chat = self.model.start_chat(history=[])
        self.system_prompt = """You are an English language tutor and conversation partner. Your role is to:
1. Maintain conversations only in English
2. If the user writes in any other language, politely ask them to write in English
3. Correct any grammar mistakes, improper word usage, or sentence structure issues
4. Explain your corrections in a friendly and educational way
5. Keep the conversation focused on the topic chosen by the user

Format your responses as follows:
- If there are no corrections needed: Just provide your response
- If there are corrections needed: First show the corrected version, then explain the corrections, and finally continue the conversation

Remember to be encouraging and supportive while helping users improve their English."""

    async def get_response(self, message: str) -> str:
        """
        Get response from Gemini model with English language tutoring
        
        Args:
            message (str): The input message to send to the model
            
        Returns:
            str: The model's response text with corrections if needed
            
        Raises:
            Exception: If there's an error communicating with the Gemini API
        """
        try:
            # Initialize chat with system prompt if it's the first message
            if not self.chat.history:
                self.chat.send_message(self.system_prompt)
            
            response = self.chat.send_message(message)
            return response.text
        except Exception as e:
            error_msg = f"Error getting response from Gemini: {str(e)}"
            print(error_msg)
            raise Exception(error_msg) 