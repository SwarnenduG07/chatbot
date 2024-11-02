from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv 
import google.generativeai as genai
import os
import logging
import json
from fastapi import StreamingResponse

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(_name_)

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
    chat_history: list

@app.get("/")
async def helth_check():
    return "The helth check is fine"


@app.post("/api/v1/chat")
async def chat(request: ChatRequest):
    logger.info(f"Received message: {request.message}")
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Convert chat history to the format expected by Gemini
        formatted_history = []
        for msg in request.chat_history:
            role = "user" if msg["role"] == "user" else "model"
            formatted_history.append({
                "role": role,
                "parts": [msg["content"]]  # Wrap content in a list
            })
        
        # Start chat with history
        chat = model.start_chat(history=formatted_history)
        
        # Generate streaming response
        response = chat.send_message(request.message, stream=True)
        
        async def generate():
            full_response = ""
            for chunk in response:
                if chunk.text:
                    full_response += chunk.text
                    yield f"data: {json.dumps({'content': chunk.text})}\n\n"
            
            # Add final response to chat history
            formatted_history.append({
                "role": "user",
                "parts": [request.message]
            })
            formatted_history.append({
                "role": "model",
                "parts": [full_response]
            })
            
            logger.info(f"Generated full response: {full_response}")
           
            yield f"data: {json.dumps({'content': full_response, 'history': formatted_history})}\n\n"
        
        return StreamingResponse(generate(), media_type="text/event-stream")
        
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))