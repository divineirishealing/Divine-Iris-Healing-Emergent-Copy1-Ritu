from fastapi import APIRouter, HTTPException
from models import Testimonial, TestimonialCreate
from typing import List
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

router = APIRouter(prefix="/api/testimonials", tags=["Testimonials"])

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

@router.get("", response_model=List[Testimonial])
async def get_testimonials():
    testimonials = await db.testimonials.find().sort("created_at", -1).to_list(100)
    return [Testimonial(**testimonial) for testimonial in testimonials]

@router.post("", response_model=Testimonial)
async def create_testimonial(testimonial: TestimonialCreate):
    # Auto-generate thumbnail from YouTube video ID
    if not testimonial.thumbnail:
        testimonial.thumbnail = f"https://img.youtube.com/vi/{testimonial.videoId}/maxresdefault.jpg"
    
    testimonial_obj = Testimonial(**testimonial.dict())
    await db.testimonials.insert_one(testimonial_obj.dict())
    return testimonial_obj

@router.delete("/{testimonial_id}")
async def delete_testimonial(testimonial_id: str):
    result = await db.testimonials.delete_one({"id": testimonial_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    return {"message": "Testimonial deleted successfully"}
