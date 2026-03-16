from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

router = APIRouter(prefix="/api/fraud", tags=["Fraud"])

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]


@router.get("/alerts")
async def list_fraud_alerts(status: Optional[str] = None):
    """List all fraud alerts, optionally filtered by status."""
    query = {}
    if status:
        query["status"] = status
    alerts = await db.fraud_alerts.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    return alerts


@router.get("/stats")
async def fraud_stats():
    """Get fraud detection summary stats."""
    total = await db.fraud_alerts.count_documents({})
    new_count = await db.fraud_alerts.count_documents({"status": "new"})
    reviewed = await db.fraud_alerts.count_documents({"status": "reviewed"})
    confirmed = await db.fraud_alerts.count_documents({"status": "confirmed_fraud"})
    legitimate = await db.fraud_alerts.count_documents({"status": "legitimate"})
    blocked_emails = await db.fraud_blocklist.count_documents({})

    # Severity breakdown
    critical = await db.fraud_alerts.count_documents({"severity": "critical"})
    high = await db.fraud_alerts.count_documents({"severity": "high"})
    medium = await db.fraud_alerts.count_documents({"severity": "medium"})
    low = await db.fraud_alerts.count_documents({"severity": "low"})

    return {
        "total_alerts": total,
        "new": new_count,
        "reviewed": reviewed,
        "confirmed_fraud": confirmed,
        "legitimate": legitimate,
        "blocked_emails": blocked_emails,
        "by_severity": {
            "critical": critical,
            "high": high,
            "medium": medium,
            "low": low,
        },
    }


class ReviewRequest(BaseModel):
    status: str  # reviewed, confirmed_fraud, legitimate
    admin_notes: str = ""


@router.patch("/alerts/{alert_id}")
async def review_fraud_alert(alert_id: str, data: ReviewRequest):
    """Admin reviews a fraud alert — mark as reviewed, confirmed fraud, or legitimate."""
    if data.status not in ("reviewed", "confirmed_fraud", "legitimate"):
        raise HTTPException(status_code=400, detail="Status must be: reviewed, confirmed_fraud, or legitimate")

    alert = await db.fraud_alerts.find_one({"id": alert_id}, {"_id": 0})
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    await db.fraud_alerts.update_one(
        {"id": alert_id},
        {"$set": {
            "status": data.status,
            "admin_notes": data.admin_notes,
            "reviewed_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }}
    )

    enrollment_id = alert.get("enrollment_id")

    # If confirmed fraud, add email to blocklist
    if data.status == "confirmed_fraud":
        email = alert.get("booker_email", "").lower()
        if email:
            await db.fraud_blocklist.update_one(
                {"email": email},
                {"$set": {
                    "email": email,
                    "reason": f"Confirmed fraud on enrollment {enrollment_id}",
                    "enrollment_id": enrollment_id,
                    "blocked_at": datetime.now(timezone.utc).isoformat(),
                }},
                upsert=True,
            )
        if enrollment_id:
            await db.enrollments.update_one(
                {"id": enrollment_id},
                {"$set": {"fraud_status": "confirmed_fraud"}}
            )
        return {"message": f"Alert marked as confirmed fraud. {email} blocked from INR pricing."}

    # If legitimate, remove from blocklist and clear fraud flag
    if data.status == "legitimate":
        email = alert.get("booker_email", "").lower()
        if email:
            await db.fraud_blocklist.delete_one({"email": email})
        if enrollment_id:
            await db.enrollments.update_one(
                {"id": enrollment_id},
                {"$set": {"fraud_status": "legitimate"}}
            )
        return {"message": "Alert marked as legitimate. Email unblocked."}

    return {"message": "Alert updated."}


@router.get("/blocklist")
async def list_blocked_emails():
    """List all emails blocked from INR pricing."""
    blocked = await db.fraud_blocklist.find({}, {"_id": 0}).sort("blocked_at", -1).to_list(500)
    return blocked


@router.delete("/blocklist/{email}")
async def unblock_email(email: str):
    """Remove an email from the fraud blocklist."""
    result = await db.fraud_blocklist.delete_one({"email": email.lower()})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Email not in blocklist")
    return {"message": f"{email} removed from blocklist."}
