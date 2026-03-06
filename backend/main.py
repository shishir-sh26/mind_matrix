import os
import re
import json
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
from sqlmodel import Field, SQLModel, select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from google import genai
from google.genai import types

# 1. Database Configuration Updates
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///memory")
# Apply regex fix for psycopg async driver
ASYNC_DB_URL = re.sub(r'^postgresql:', 'postgresql+psycopg:', DATABASE_URL)

engine = create_async_engine(ASYNC_DB_URL, echo=True)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

# Recreate UserState to match strict constraints
class UserState(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    shake_force: float
    detected_mood: str
    intervention_type: str

class SensorData(BaseModel):
    shake_force: float
    sensor_data: List[Dict[str, float]] = []

# 2. Model & Table Initialization
@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    yield

app = FastAPI(lifespan=lifespan)

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

# 3. Route Logic Updates (Fully Asynchronous)
@app.post("/analyze-stress")
async def analyze_stress(data: SensorData):
    # Logic Continuity: Keep existing Gemini API logic and prompt structure
    try:
        prompt = f"A user is physically agitated with a shake force of {data.shake_force}. Based on this sensor data, provide a 30-second micro-intervention. Return ONLY a JSON: {{'type': 'CALM|BREATHE|FOCUS', 'instruction': 'short text'}}."

        api_key = os.getenv("GEMINI_API_KEY", "your_google_gemini_api_key_here")
        client = genai.Client(api_key=api_key)
        
        # Calling Gemini synchronously. High-traffic apps might wrap this in a threadpool (run_in_executor)
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            ),
        )

        decision = json.loads(response.text)
        detected_mood = "Agitated"
        intervention_type = decision.get("type", "BREATHE")
        
        # Create our new ORM model
        new_state = UserState(
            shake_force=data.shake_force,
            detected_mood=detected_mood,
            intervention_type=intervention_type
        )
        
        # Async Context Block for DB Insertion
        async with async_session() as session:
            session.add(new_state)
            await session.commit()
            await session.refresh(new_state)
            
        decision["id"] = new_state.id
        return decision

    except Exception as e:
        print(f"Error processing sensor data: {e}")
        return {"type": "BREATHE", "instruction": "Fallback instructions."}

@app.get("/history")
async def get_history():
    # Update to fully asynchronous history route
    async with async_session() as session:
        result = await session.execute(select(UserState))
        history = result.scalars().all()
        return history