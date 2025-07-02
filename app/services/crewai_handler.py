from crewai import Agent, Task, Crew, LLM
from crewai.tools import BaseTool
from typing import Type
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class TranscriptToolInput(BaseModel):
    """Input schema for TranscriptTool."""
    query: str = Field(..., description="The question or query about the transcript content")

class TranscriptTool(BaseTool):
    name: str = "Transcript Access Tool"
    description: str = "Access the YouTube transcript content"
    args_schema: Type[BaseModel] = TranscriptToolInput

    # Define transcript as a proper Pydantic field to bypass the Pydantic error
    transcript: str = Field(default="No transcript available", description="The video transcript content")

    def __init__(self, transcript: str = "No transcript available"):
        super().__init__()
        if transcript:
            self.transcript = transcript

    def _run(self, query: str) -> str:
        """Use the tool to access transcript content"""
        return self.transcript

class CrewAIHandler:
    def __init__(self):
        llm = LLM(model="gemini/gemini-2.0-flash")

        # Initialize with empty transcript
        self.transcript = "No transcript available"
        self.transcript_tool = TranscriptTool(self.transcript)
        
        # Agent 1: YouTube Transcript Expert
        self.transcript_reader = Agent(
            role='YouTube Transcript Expert',
            goal='Provide accurate information from YouTube transcripts',
            backstory='Expert in analyzing and interpreting video transcripts',
            tools=[self.transcript_tool],
            verbose=True,
            llm=llm,
            allow_delegation=False
        )

        # Agent 2: Humanizer Agent
        self.humanizer_agent = Agent(
            role='Humanizer Agent',
            goal='Make the assistant responses more polite, friendly, and cheerful',
            backstory='A communication expert with a knack for positive and engaging language',
            verbose=True,
            allow_delegation=False,
            llm=llm
        )

    def set_transcript(self, transcript: str):
        """Set the transcript content for subsequent queries"""
        self.transcript = transcript
        self.transcript_tool.transcript = transcript

    def get_response(self, question: str) -> str:

        # Task 1: Get raw response from transcript expert
        task_transcript_reading = Task(
                                    description=f"""
                                                Analyze the YouTube transcript and answer this question:
                                                Question: {question}
                                                
                                                Use the Transcript Access Tool to get the full transcript.
                                                Then provide a detailed answer based on the transcript content.
                                                If the tool doesn't work, use the following data as transcript: {self.transcript}
                                                """,
                                    agent=self.transcript_reader,
                                    expected_output="A detailed answer based on the video transcript content along with the question asked by the user",
                                    tools=[self.transcript_tool],
                                    # context=[{"source": "transcript", "content": self.transcript}]
                                    context=[
                                                {
                                                    "description": "Transcript of the YouTube video.",
                                                    "expected_output": self.transcript
                                                }
                                            ]
                            
                                )
        # Task 2: Humanize the output
        task_humanize = Task(
                            description="""
                                Take the previous response from the YouTube Transcript Expert and the user's original question:.
                                Rewrite the answer in a polite, and friendly tone.
                                Make sure the rephrased answer sounds human, empathetic, and helpful. However, keep the answer short and succinct.
                                In general, keep the answer below 100 words. Expand the answer only if the user specifically asks for an 'in detail' answer.
                            """,
                            agent=self.humanizer_agent,
                            expected_output="A rephrased, polite and cheerful version of the original answer."
                        )
        

        
        # Crew with sequential process
        crew = Crew(
            agents=[self.transcript_reader, self.humanizer_agent],
            tasks=[task_transcript_reading, task_humanize],
            verbose=True,
            process='sequential'
        )
        
        try:
            result = crew.kickoff(inputs={"question": question})
            return result
        except Exception as e:
            # Return the error message as a string
            return f"An error occurred during processing: {str(e)}"