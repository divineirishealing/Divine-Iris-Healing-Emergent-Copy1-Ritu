import re
from motor.motor_asyncio import AsyncIOMotorDatabase


def get_program_initials(title: str) -> str:
    """Extract initials from a program title. E.g. 'Atomic Weight Release Program' -> 'AWRP'"""
    words = re.sub(r'[^a-zA-Z\s]', '', title).split()
    # Filter out small words like 'of', 'the', 'and', etc.
    skip = {'of', 'the', 'and', 'a', 'an', 'in', 'on', 'for', 'to', 'with', 'by'}
    initials = ''.join(w[0].upper() for w in words if w.lower() not in skip and len(w) > 1)
    return initials[:6] if initials else 'PRG'


def get_person_initials(name: str) -> str:
    """Extract initials from a person's name. E.g. 'John Doe' -> 'JD'"""
    parts = name.strip().split()
    if not parts:
        return 'XX'
    initials = ''.join(p[0].upper() for p in parts if p)
    return initials[:3] if initials else 'XX'


async def generate_uid(db: AsyncIOMotorDatabase, program_title: str, participant_name: str) -> str:
    """Generate a unique ID: DIH-{PROGRAM_INITIALS}-{NAME_INITIALS}-{SEQ}
    
    Format: DIH-AWRP-JD-0042
    - DIH = Divine Iris Healing (brand)
    - AWRP = Program title initials
    - JD = Participant name initials
    - 0042 = Auto-incrementing sequence number
    """
    program_code = get_program_initials(program_title)
    person_code = get_person_initials(participant_name)
    
    # Get next sequence number from a counter collection
    counter = await db.uid_counters.find_one_and_update(
        {"_id": "enrollment_uid"},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=True,
    )
    seq = counter.get("seq", 1)
    
    uid = f"DIH-{program_code}-{person_code}-{seq:04d}"
    return uid
