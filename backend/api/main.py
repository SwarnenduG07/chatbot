from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai
import os
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise ValueError("GOOGLE_API_KEY not found in environment variables")

genai.configure(api_key=api_key)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

@app.get("/")
async def health_check():
    return "The health check is fine"

@app.post("/api/v1/chat")
async def chat(request: ChatRequest):
    logger.info(f"Received message: {request.message}")
    
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(request.message, stream=True)
        
        async def text_stream():
            for chunk in response:
                chunk_text = chunk.text
                yield chunk_text + "\n" 
                logger.info(f"Streamed chunk: {chunk_text}")

        return StreamingResponse(text_stream(), media_type="text/plain")
    
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
