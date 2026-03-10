from fastapi import APIRouter, HTTPException
from models import Newsletter, NewsletterCreate
from typing import List
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

router = APIRouter(prefix="/api/newsletter", tags=["Newsletter"])

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

@router.post("", response_model=Newsletter)
async def subscribe(newsletter: NewsletterCreate):
    # Check if email already exists
    existing = await db.newsletter.find_one({"email": newsletter.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already subscribed")
    
    newsletter_obj = Newsletter(**newsletter.dict())
    await db.newsletter.insert_one(newsletter_obj.dict())
    return newsletter_obj

@router.get("", response_model=List[Newsletter])
async def get_subscribers():
    subscribers = await db.newsletter.find().sort("subscribed_at", -1).to_list(1000)
    return [Newsletter(**subscriber) for subscriber in subscribers]

@router.delete("/{email}")
async def unsubscribe(email: str):
    result = await db.newsletter.delete_one({"email": email})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Email not found")
    return {"message": "Unsubscribed successfully"}
