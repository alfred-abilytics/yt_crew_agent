from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.youtube import get_youtube_transcript, generate_pdf
from app.services.crewai_handler import CrewAIHandler

router = APIRouter()
crewai_handler = CrewAIHandler()

class YouTubeRequest(BaseModel):
    url: str

@router.post("/api/transcript")
async def get_transcript(request: YouTubeRequest):
    try:
        transcript = get_youtube_transcript(request.url)
        crewai_handler.set_transcript(transcript)
        pdf_path = generate_pdf(transcript)
        return {"pdf_url": pdf_path, "transcript": transcript}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    