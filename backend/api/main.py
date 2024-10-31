from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
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
    allow_origins=["https://aichatbot-onsurmeqo-swarnendu-ghoshs-projects.vercel.app/"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

@app.get("/")
async def helth_check():
    return "The helth check is ok"


@app.post("/api/v1/chat")
async def chat(request: ChatRequest):
    logger.info(f"Received message: {request.message}")
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(request.message, )
        logger.info(f"Generated response: {response.text}")
        return {"response": response.text}
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
