# YouTube Transcript Bot

## Product Requirements Document (PRD)

### Purpose
The YouTube Transcript Bot is a web application that enables users to extract transcripts from YouTube videos, generate downloadable PDF versions of those transcripts, and interact with an AI-powered assistant to ask questions about the video content. The assistant provides detailed, humanized answers based on the transcript, making video content more accessible and interactive for users.

---

### Features

- **YouTube Transcript Extraction**
  - Accepts a YouTube video URL and fetches the full transcript using the YouTube Transcript API.
  - Validates URLs and handles errors gracefully.

- **PDF Generation**
  - Converts the transcript into a downloadable PDF using ReportLab.
  - Ensures PDFs are stored securely and served via the web interface.

- **Conversational AI (CrewAI Integration)**
  - Users can ask questions about the video content.
  - The system uses CrewAI with two agents:
    - **YouTube Transcript Expert:** Analyzes the transcript and generates a detailed answer.
    - **Humanizer Agent:** Rewrites the answer in a polite, friendly, and helpful tone.
  - Returns user-friendly, context-aware responses.

- **REST API**
  - `/api/transcript` (POST): Accepts a YouTube URL, returns the transcript and PDF URL.
  - `/api/chat` (POST): Accepts a question and transcript, returns an AI-generated answer.

- **Frontend**
  - Web interface built with Jinja2 templates.
  - Allows users to submit URLs, download PDFs, and chat with the AI assistant.

---

### Architecture

- **Backend:** FastAPI
- **Services:**
  - `youtube.py`: Handles transcript extraction and PDF generation.
  - `crewai_handler.py`: Manages CrewAI agents and orchestrates the Q&A process.
- **Routers:**
  - `transcript.py`: Transcript extraction endpoint.
  - `chat.py`: Chat endpoint for AI interaction.
- **Static Files:** CSS, JS, and generated PDFs.
- **Templates:** Jinja2 for rendering the main web page.

---

### Security Considerations

- All user inputs (YouTube URLs, questions) are validated and sanitized.
- No sensitive data (API keys, PII) is logged or exposed.
- Environment variables are used for all secrets and API keys (managed via `.env`).
- Error handling ensures no internal details are leaked to users.
- Principle of least privilege is applied throughout the codebase.

---

### Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd youtube_transcript_bot
   ```
2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
3. **Set up environment variables:**
   - Create a `.env` file in the root directory with required API keys and configuration.
4. **Run the application:**
   ```bash
   uvicorn app.main:app --reload
   ```
5. **Access the web interface:**
   - Open your browser and go to `http://localhost:8000`

---

### Logging & Error Handling
- All significant operations are logged with appropriate log levels.
- No sensitive data is ever logged.
- Errors are handled gracefully and user-friendly messages are returned.

---

### Assumptions & Limitations
- Only public YouTube videos with available transcripts are supported.
- The AI assistant's responses are limited by the quality of the transcript and the capabilities of the underlying CrewAI model.

---

### Contact & Support
For questions, issues, or feature requests, please open an issue in the repository.
