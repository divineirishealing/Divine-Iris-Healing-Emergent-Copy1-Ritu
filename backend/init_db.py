import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Mock data
programs_data = [
    {
        "id": "1",
        "title": "Atomic Weight Release Program (AWRP)",
        "category": "Foundation",
        "description": "The Atomic Weight Release Program is a deep, multi-layered healing journey that works at the atomic, subconscious, emotional level to address weight retention patterns.",
        "image": "https://images.unsplash.com/photo-1545389336-cf090694435e?w=600&h=400&fit=crop",
        "link": "/program/awrp"
    },
    {
        "id": "2",
        "title": "Atomic Musculoskeletal Regeneration Program",
        "category": "Body-Based",
        "description": "This program focuses on the musculoskeletal system — bones, joints, muscles, fascia, posture, and spine — understanding the body's natural regeneration capacity.",
        "image": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop",
        "link": "/program/amrp"
    },
    {
        "id": "3",
        "title": "SoulSync Neuro-Harmonics",
        "category": "Nervous System",
        "description": "SoulSync Neuro-Harmonics focuses on nervous system regulation and brain coherence. Chronic stress, trauma, and emotional patterns are addressed at their root.",
        "image": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=400&fit=crop",
        "link": "/program/soulsync"
    },
    {
        "id": "4",
        "title": "Money Magic Multiplier",
        "category": "Abundance",
        "description": "Money Magic Multiplier works on the emotional, subconscious, and ancestral relationship with money. For many, money is deeply tied to worthiness and safety.",
        "image": "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&h=400&fit=crop",
        "link": "/program/money-magic"
    },
    {
        "id": "5",
        "title": "Quad Layer Healing",
        "category": "Healing",
        "description": "Quad Layer Healing works simultaneously on the conscious mind, subconscious mind, emotional body, and energetic memory (chakras) for complete transformation.",
        "image": "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=600&h=400&fit=crop",
        "link": "/program/quad-layer"
    },
    {
        "id": "6",
        "title": "Divinity of Twinity",
        "category": "Relationships",
        "description": "Divinity of Twinity works on relationship imprints, attachment wounds, emotional dependency, and soul-level contracts for deeper connection and harmony.",
        "image": "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&h=400&fit=crop",
        "link": "/program/divinity-twinity"
    }
]

sessions_data = [
    {
        "id": "1",
        "title": "Akashic Record Reading & Healing",
        "description": "Akashic Record Reading is a sacred insight session that accesses the energetic archive of your soul's journey across lifetimes. The Akashic Records are understood as a vibrational field of information containing your karmic imprints, soul contracts, ancestral influences.",
        "image": "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&h=300&fit=crop"
    },
    {
        "id": "2",
        "title": "Ancestral Healing",
        "description": "Ancestral Healing is the sacred process of identifying and transforming inherited emotional, spiritual, and behavioral patterns passed through family lineages. It gently addresses intergenerational imprints.",
        "image": "https://images.unsplash.com/photo-1470290378698-263fa7ca60ab?w=400&h=300&fit=crop"
    },
    {
        "id": "3",
        "title": "Chakra Healing",
        "description": "Chakra Healing is a deep energetic alignment process that restores balance across the body's seven primary energy centers. When chakras are blocked or overactive, they can manifest as emotional instability.",
        "image": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop"
    },
    {
        "id": "4",
        "title": "Inner Child Healing",
        "description": "Inner Child Healing is a deep restorative process that addresses unresolved emotional wounds formed during early life experiences. Childhood memories of rejection, neglect, criticism shape adult behaviors.",
        "image": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop"
    },
    {
        "id": "5",
        "title": "Soul Retrieval",
        "description": "Soul Retrieval is a deep restorative process that focuses on reclaiming fragmented parts of your energy that may have split away during trauma, shock, or betrayal.",
        "image": "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=300&fit=crop"
    },
    {
        "id": "6",
        "title": "Tarot Reading",
        "description": "Tarot Reading is an intuitive guidance session that offers clarity during uncertainty, transition, or important life decisions. The cards act as a reflective tool.",
        "image": "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=300&fit=crop"
    }
]

testimonials_data = [
    {"id": "1", "videoId": "i3UJ6t6xYwQ", "thumbnail": "https://img.youtube.com/vi/i3UJ6t6xYwQ/maxresdefault.jpg"},
    {"id": "2", "videoId": "GF5pkxAVfNc", "thumbnail": "https://img.youtube.com/vi/GF5pkxAVfNc/maxresdefault.jpg"},
    {"id": "3", "videoId": "gBKFr8pnSKM", "thumbnail": "https://img.youtube.com/vi/gBKFr8pnSKM/maxresdefault.jpg"},
    {"id": "4", "videoId": "yECblik4mHc", "thumbnail": "https://img.youtube.com/vi/yECblik4mHc/maxresdefault.jpg"},
    {"id": "5", "videoId": "FVgxpMEMnoc", "thumbnail": "https://img.youtube.com/vi/FVgxpMEMnoc/maxresdefault.jpg"},
    {"id": "6", "videoId": "UIO3eyGOt6o", "thumbnail": "https://img.youtube.com/vi/UIO3eyGOt6o/maxresdefault.jpg"}
]

stats_data = [
    {"id": "1", "value": "11k+", "label": "HAPPY SOULS", "order": 0},
    {"id": "2", "value": "9+", "label": "Years Experience", "order": 1},
    {"id": "3", "value": "11k+", "label": "Transformations", "order": 2},
    {"id": "4", "value": "12+", "label": "Awards Won", "order": 3}
]

async def init_database():
    print("Initializing database with mock data...")
    
    # Clear existing data
    await db.programs.delete_many({})
    await db.sessions.delete_many({})
    await db.testimonials.delete_many({})
    await db.stats.delete_many({})
    
    # Insert programs
    if programs_data:
        await db.programs.insert_many(programs_data)
        print(f"✓ Inserted {len(programs_data)} programs")
    
    # Insert sessions
    if sessions_data:
        await db.sessions.insert_many(sessions_data)
        print(f"✓ Inserted {len(sessions_data)} sessions")
    
    # Insert testimonials
    if testimonials_data:
        await db.testimonials.insert_many(testimonials_data)
        print(f"✓ Inserted {len(testimonials_data)} testimonials")
    
    # Insert stats
    if stats_data:
        await db.stats.insert_many(stats_data)
        print(f"✓ Inserted {len(stats_data)} stats")
    
    print("\n✓ Database initialized successfully!")
    print("You can now use the admin panel to manage content.")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(init_database())
