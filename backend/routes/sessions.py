from fastapi import APIRouter, HTTPException
from models import Session, SessionCreate
from typing import List
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

router = APIRouter(prefix="/api/sessions", tags=["Sessions"])

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

@router.get("", response_model=List[Session])
async def get_sessions():
    sessions = await db.sessions.find().sort("created_at", -1).to_list(100)
    return [Session(**session) for session in sessions]

@router.get("/{session_id}", response_model=Session)
async def get_session(session_id: str):
    session = await db.sessions.find_one({"id": session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return Session(**session)

@router.post("", response_model=Session)
async def create_session(session: SessionCreate):
    session_obj = Session(**session.dict())
    await db.sessions.insert_one(session_obj.dict())
    return session_obj

@router.put("/{session_id}", response_model=Session)
async def update_session(session_id: str, session: SessionCreate):
    existing = await db.sessions.find_one({"id": session_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Session not found")
    
    updated_session = Session(**{**existing, **session.dict()})
    await db.sessions.update_one(
        {"id": session_id},
        {"$set": updated_session.dict()}
    )
    return updated_session

@router.delete("/{session_id}")
async def delete_session(session_id: str):
    result = await db.sessions.delete_one({"id": session_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"message": "Session deleted successfully"}
