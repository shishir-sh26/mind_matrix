import os
import re
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, Field, create_engine, Session, select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from google import genai
from dotenv import load_dotenv

load_dotenv()

# --- DATABASE CONFIGURATION ---
raw_url = os.getenv("DATABASE_URL")
# Convert to asyncpg driver for non-blocking database calls
DATABASE_URL = re.sub(r'^postgresql:', 'postgresql+asyncpg:', raw_url)
engine = create_async_engine(DATABASE_URL, echo=False)

# --- GEMINI AI CONFIGURATION ---
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI(title="Smart Toolkit Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MODELS ---
class UserState(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    shake_force: float
    detected_mood: str
    intervention_type: str

# --- ROUTES ---

@app.post("/admin/login")
async def dummy_login():
    """
    Hackathon Bypass: Always returns success to allow dashboard access.
   
    """
    return {"status": "success", "token": "hackathon_bypass_token", "user": "admin"}

@app.post("/analyze-stress")
async def analyze_stress(shake_force: float):
    """
    The Functional Loop Logic Layer
    """
    status = "high_stress" if shake_force > 2.5 else "normal"
    
    prompt = f"""
    The user is experiencing {status} with a physical shake force of {shake_force}. 
    Suggest a 30-second micro-intervention. 
    Return ONLY a JSON object: {{"type": "exercise_name", "instruction": "short text"}}
    """
    
    try:
        response = client.models.generate_content(model="gemini-2.0-flash", contents=prompt)
        
        # Save to Neon
        async with AsyncSession(engine) as session:
            new_entry = UserState(
                shake_force=shake_force, 
                detected_mood=status, 
                intervention_type=response.text
            )
            session.add(new_entry)
            await session.commit()
            
        return {"status": status, "intervention": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history")
async def get_history():
    """Fetches history for the Next.js dashboard"""
    async with AsyncSession(engine) as session:
        statement = select(UserState)
        result = await session.execute(statement)
        return result.scalars().all()

@app.get("/")
def read_root():
    return {"message": "Hackathon Backend Running"}