from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv 
import google.generativeai as genai
import os
load_dotenv()


api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise ValueError("GOOGLE_API_KEY not found in environment variables")

genai.configure(api_key=api_key)

app = FastAPI()

class ChatRequest(BaseModel):
    message: str

@app.get("/")
async def helth_check():
    return "The helth check is ok"


@app.post("/api/v1/chat")
async def chat(request: ChatRequest):
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(request.message)
        return {"response": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
