import os
import re
from youtube_transcript_api import YouTubeTranscriptApi
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.lib.styles import getSampleStyleSheet

def extract_video_id(url: str) -> str:
    regex = r"(?:v=|\/)([0-9A-Za-z_-]{11}).*"
    match = re.search(regex, url)
    if not match:
        raise ValueError("Invalid YouTube URL")
    return match.group(1)

def get_youtube_transcript(url: str) -> str:
    video_id = extract_video_id(url)
    transcript = YouTubeTranscriptApi.get_transcript(video_id)
    return " ".join([t['text'] for t in transcript])

def generate_pdf(text: str) -> str:
    os.makedirs("static/pdfs", exist_ok=True)
    
    pdf_path = "static/pdfs/transcript.pdf"
    doc = SimpleDocTemplate(pdf_path, pagesize=letter)
    styles = getSampleStyleSheet()
    story = [Paragraph(text, styles["Normal"])]
    doc.build(story)
    return f"/{pdf_path}"