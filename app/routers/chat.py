from fastapi import APIRouter
from pydantic import BaseModel
from app.services.crewai_handler import CrewAIHandler
import logging

logger = logging.getLogger(__name__)
router = APIRouter()
crewai_handler = CrewAIHandler()

class ChatRequest(BaseModel):
    question: str
    transcript: str

@router.post("/api/chat")
async def chat_with_ai(request: ChatRequest):
    try:
        crewai_handler.set_transcript(request.transcript)
        response = crewai_handler.get_response(request.question)
        
        if not response or response == "undefined":
            response = "I couldn't generate a response. Please try again."
        
        return {"response": response}
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        return {
            "error": "Failed to process request",
            "details": str(e)
        }