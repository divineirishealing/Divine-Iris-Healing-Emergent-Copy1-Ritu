from fastapi import APIRouter, HTTPException
from models import Program, ProgramCreate
from typing import List
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

router = APIRouter(prefix="/api/programs", tags=["Programs"])

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

@router.get("", response_model=List[Program])
async def get_programs():
    programs = await db.programs.find().sort("created_at", -1).to_list(100)
    return [Program(**program) for program in programs]

@router.get("/{program_id}", response_model=Program)
async def get_program(program_id: str):
    program = await db.programs.find_one({"id": program_id})
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
    return Program(**program)

@router.post("", response_model=Program)
async def create_program(program: ProgramCreate):
    program_obj = Program(**program.dict())
    await db.programs.insert_one(program_obj.dict())
    return program_obj

@router.put("/{program_id}", response_model=Program)
async def update_program(program_id: str, program: ProgramCreate):
    existing = await db.programs.find_one({"id": program_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Program not found")
    
    updated_program = Program(**{**existing, **program.dict()})
    await db.programs.update_one(
        {"id": program_id},
        {"$set": updated_program.dict()}
    )
    return updated_program

@router.delete("/{program_id}")
async def delete_program(program_id: str):
    result = await db.programs.delete_one({"id": program_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Program not found")
    return {"message": "Program deleted successfully"}
