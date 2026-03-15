from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import os
import uuid
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

router = APIRouter(prefix="/api/clients", tags=["Clients"])

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Label hierarchy (garden journey)
LABELS = ["Dew", "Seed", "Root", "Bloom", "Iris", "Purple Bees", "Iris Bees"]
LABEL_DESCRIPTIONS = {
    "Dew": "Inquired or expressed interest",
    "Seed": "Joined a workshop",
    "Root": "Converted to a flagship program",
    "Bloom": "Enrolled in multiple programs or repeat client",
    "Iris": "Annual Program Subscriber",
    "Purple Bees": "Soulful referral partner",
    "Iris Bees": "Brand Ambassador",
}


def normalize_email(email: str) -> str:
    return (email or "").strip().lower()


def normalize_phone(phone: str) -> str:
    return (phone or "").strip().replace(" ", "").replace("-", "")


async def compute_label(client_doc: dict) -> str:
    """Auto-compute label based on activity. Manual overrides take precedence."""
    if client_doc.get("label_manual"):
        return client_doc["label_manual"]

    conversions = client_doc.get("conversions", [])
    if not conversions:
        return "Dew"

    flagship_count = sum(1 for c in conversions if c.get("is_flagship"))
    workshop_count = sum(1 for c in conversions if not c.get("is_flagship"))
    total = len(conversions)

    # Check for annual subscription (Iris) - any program with "annual" in tier
    has_annual = any(
        "annual" in (c.get("tier_label", "") or "").lower()
        or (c.get("duration_unit", "") == "year")
        for c in conversions
    )
    if has_annual:
        return "Iris"
    if total >= 3 or (flagship_count >= 1 and workshop_count >= 1):
        return "Bloom"
    if flagship_count >= 1:
        return "Root"
    if workshop_count >= 1 or total >= 1:
        return "Seed"
    return "Dew"


# ========== SYNC / BACKFILL ==========

@router.post("/sync")
async def sync_clients():
    """Backfill/sync all client data from contacts, interests, questions, enrollments."""
    stats = {"new_clients": 0, "updated": 0, "total_sources_scanned": 0}

    # Helper to upsert a client
    async def upsert_client(email: str, phone: str = "", name: str = "", source: str = "", source_detail: str = "", source_date: str = ""):
        email = normalize_email(email)
        phone = normalize_phone(phone)
        if not email and not phone:
            return

        # Find existing by email or phone
        query = []
        if email:
            query.append({"email": email})
        if phone:
            query.append({"phone": phone})
        existing = await db.clients.find_one({"$or": query}) if query else None

        now = datetime.now(timezone.utc).isoformat()
        timeline_entry = {
            "type": source,
            "detail": source_detail,
            "date": source_date or now,
        }

        if existing:
            update = {"$addToSet": {"timeline": timeline_entry, "sources": source}}
            if name and not existing.get("name"):
                update["$set"] = {"name": name}
            if phone and not existing.get("phone"):
                update.setdefault("$set", {})["phone"] = phone
            await db.clients.update_one({"id": existing["id"]}, update)
            stats["updated"] += 1
        else:
            client_doc = {
                "id": str(uuid.uuid4()),
                "email": email,
                "phone": phone,
                "name": name,
                "label": "Dew",
                "label_manual": "",
                "sources": [source],
                "conversions": [],
                "timeline": [timeline_entry],
                "notes": "",
                "created_at": now,
                "updated_at": now,
            }
            await db.clients.insert_one(client_doc)
            stats["new_clients"] += 1

    # 1. Contact form submissions
    contacts = await db.quote_requests.find({}, {"_id": 0}).to_list(2000)
    for c in contacts:
        await upsert_client(
            email=c.get("email", ""),
            phone=c.get("phone", ""),
            name=c.get("name", ""),
            source="Contact Form",
            source_detail=c.get("message", "")[:100],
            source_date=c.get("created_at", ""),
        )
    stats["total_sources_scanned"] += len(contacts)

    # 2. Express your interest
    interests = await db.notify_me.find({}, {"_id": 0}).to_list(2000)
    for i in interests:
        await upsert_client(
            email=i.get("email", ""),
            name=i.get("name", ""),
            source="Express Interest",
            source_detail=i.get("program_title", ""),
            source_date=i.get("created_at", ""),
        )
    stats["total_sources_scanned"] += len(interests)

    # 3. Questions
    questions = await db.session_questions.find({}, {"_id": 0}).to_list(2000)
    for q in questions:
        await upsert_client(
            email=q.get("email", ""),
            name=q.get("name", ""),
            source="Question",
            source_detail=q.get("question", "")[:100],
            source_date=q.get("created_at", ""),
        )
    stats["total_sources_scanned"] += len(questions)

    # 4. Enrollments + Payment Transactions (the conversion data)
    # First build a map of stripe_session_id -> transaction for item_title lookup
    transactions = await db.payment_transactions.find({}, {"_id": 0}).to_list(5000)
    tx_by_enrollment = {}
    for tx in transactions:
        eid = tx.get("enrollment_id", "")
        if eid:
            tx_by_enrollment.setdefault(eid, []).append(tx)

    enrollments = await db.enrollments.find({}, {"_id": 0}).to_list(2000)
    programs_cache = {}
    all_programs = await db.programs.find({}, {"_id": 0}).to_list(100)
    for p in all_programs:
        programs_cache[p["id"]] = p

    sessions_cache = {}
    all_sessions = await db.sessions.find({}, {"_id": 0}).to_list(100)
    for ss in all_sessions:
        sessions_cache[ss["id"]] = ss

    for e in enrollments:
        email = normalize_email(e.get("booker_email", ""))
        phone = normalize_phone(e.get("booker_phone", ""))
        if not email:
            continue

        program_id = e.get("program_id", "") or e.get("selected_program_id", "")
        session_id = e.get("session_id", "") or e.get("selected_session_id", "")
        program = programs_cache.get(program_id, {})

        # Try to get title from transaction data first
        program_title = ""
        enrollment_txs = tx_by_enrollment.get(e.get("id", ""), [])
        if enrollment_txs:
            program_title = enrollment_txs[0].get("item_title", "")
            if not program_id:
                program_id = enrollment_txs[0].get("item_id", "")
                program = programs_cache.get(program_id, {})

        if not program_title:
            program_title = e.get("program_title", "") or e.get("selected_program_title", "") or program.get("title", "")
        if not program_title and session_id:
            program_title = sessions_cache.get(session_id, {}).get("title", "")

        is_flagship = program.get("is_flagship", False)
        status = e.get("status", "")

        # Find or create client
        query = [{"email": email}]
        if phone:
            query.append({"phone": phone})
        existing = await db.clients.find_one({"$or": query})

        conversion_entry = {
            "enrollment_id": e.get("id", ""),
            "program_id": program_id,
            "program_title": program_title,
            "is_flagship": is_flagship,
            "status": status,
            "item_type": e.get("item_type", ""),
            "tier_label": e.get("tier_label", ""),
            "duration_unit": e.get("duration_unit", ""),
            "date": e.get("created_at", ""),
        }
        timeline_entry = {
            "type": "Enrollment",
            "detail": f"{program_title} ({status})",
            "date": e.get("created_at", ""),
        }

        if existing:
            # Check if this enrollment already tracked
            existing_enrollment_ids = [c.get("enrollment_id") for c in existing.get("conversions", [])]
            if e.get("id") not in existing_enrollment_ids:
                await db.clients.update_one(
                    {"id": existing["id"]},
                    {
                        "$push": {"conversions": conversion_entry, "timeline": timeline_entry},
                        "$addToSet": {"sources": "Enrollment"},
                    }
                )
            # Update name/phone if missing
            update_set = {}
            if e.get("booker_name") and not existing.get("name"):
                update_set["name"] = e["booker_name"]
            if phone and not existing.get("phone"):
                update_set["phone"] = phone
            if update_set:
                await db.clients.update_one({"id": existing["id"]}, {"$set": update_set})
        else:
            now = datetime.now(timezone.utc).isoformat()
            client_doc = {
                "id": str(uuid.uuid4()),
                "email": email,
                "phone": phone,
                "name": e.get("booker_name", ""),
                "label": "Dew",
                "label_manual": "",
                "sources": ["Enrollment"],
                "conversions": [conversion_entry],
                "timeline": [timeline_entry],
                "notes": "",
                "created_at": now,
                "updated_at": now,
            }
            await db.clients.insert_one(client_doc)
            stats["new_clients"] += 1

    stats["total_sources_scanned"] += len(enrollments)

    # 5. Now recompute labels for all clients
    all_clients = await db.clients.find({}, {"_id": 0}).to_list(5000)
    for cl in all_clients:
        new_label = await compute_label(cl)
        if new_label != cl.get("label"):
            await db.clients.update_one({"id": cl["id"]}, {"$set": {"label": new_label, "updated_at": datetime.now(timezone.utc).isoformat()}})
            stats["updated"] += 1

    return {"message": "Sync complete", "stats": stats}


# ========== LIST / SEARCH ==========

@router.get("")
async def list_clients(label: Optional[str] = None, search: Optional[str] = None):
    query = {}
    if label:
        query["label"] = label
    if search:
        search_regex = {"$regex": search, "$options": "i"}
        query["$or"] = [
            {"name": search_regex},
            {"email": search_regex},
            {"phone": search_regex},
        ]
    clients_list = await db.clients.find(query, {"_id": 0}).sort("updated_at", -1).to_list(1000)
    return clients_list


@router.get("/stats")
async def client_stats():
    pipeline = [
        {"$group": {"_id": "$label", "count": {"$sum": 1}}},
    ]
    results = await db.clients.aggregate(pipeline).to_list(20)
    label_counts = {r["_id"]: r["count"] for r in results}
    total = sum(label_counts.values())
    return {"total": total, "by_label": label_counts}


@router.get("/{client_id}")
async def get_client(client_id: str):
    cl = await db.clients.find_one({"id": client_id}, {"_id": 0})
    if not cl:
        raise HTTPException(status_code=404, detail="Client not found")
    return cl


# ========== UPDATE ==========

class ClientUpdate(BaseModel):
    label_manual: Optional[str] = None
    notes: Optional[str] = None
    name: Optional[str] = None
    phone: Optional[str] = None


@router.put("/{client_id}")
async def update_client(client_id: str, data: ClientUpdate):
    cl = await db.clients.find_one({"id": client_id})
    if not cl:
        raise HTTPException(status_code=404, detail="Client not found")

    update_fields = {"updated_at": datetime.now(timezone.utc).isoformat()}
    if data.label_manual is not None:
        update_fields["label_manual"] = data.label_manual
        if data.label_manual:
            update_fields["label"] = data.label_manual
    if data.notes is not None:
        update_fields["notes"] = data.notes
    if data.name is not None:
        update_fields["name"] = data.name
    if data.phone is not None:
        update_fields["phone"] = data.phone

    await db.clients.update_one({"id": client_id}, {"$set": update_fields})

    # Recompute label if manual override removed
    if data.label_manual == "":
        updated = await db.clients.find_one({"id": client_id}, {"_id": 0})
        new_label = await compute_label(updated)
        await db.clients.update_one({"id": client_id}, {"$set": {"label": new_label}})

    return {"message": "Updated"}


# ========== DELETE ==========

@router.delete("/{client_id}")
async def delete_client(client_id: str):
    result = await db.clients.delete_one({"id": client_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Client not found")
    return {"message": "Deleted"}


# ========== DOWNLOAD ==========

@router.get("/export/csv")
async def export_clients_csv():
    import csv
    import io
    from fastapi.responses import StreamingResponse

    clients_list = await db.clients.find({}, {"_id": 0}).sort("label", 1).to_list(5000)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Label", "Name", "Email", "Phone", "Sources",
        "Programs Enrolled", "Total Conversions",
        "First Contact", "Last Updated", "Notes"
    ])

    for cl in clients_list:
        programs = ", ".join(set(c.get("program_title", "") for c in cl.get("conversions", []) if c.get("program_title")))
        sources = ", ".join(set(cl.get("sources", [])))
        writer.writerow([
            cl.get("label", ""),
            cl.get("name", ""),
            cl.get("email", ""),
            cl.get("phone", ""),
            sources,
            programs,
            len(cl.get("conversions", [])),
            cl.get("created_at", ""),
            cl.get("updated_at", ""),
            cl.get("notes", ""),
        ])

    output.seek(0)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M")
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=divine_iris_clients_{timestamp}.csv"}
    )
