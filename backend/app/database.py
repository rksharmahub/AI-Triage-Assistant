from supabase import create_client
import os
from dotenv import load_dotenv
from datetime import datetime, timezone

load_dotenv()

SUPABASE_URL = (os.getenv("SUPABASE_URL") or "").strip()
SUPABASE_KEY = (os.getenv("SUPABASE_KEY") or "").strip()

supabase = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception:
        supabase = None

def fetch_patients():
    if not supabase:
        return []

    try:
        data = supabase.table("patients").select("*").execute()
        return data.data or []
    except Exception:
        return []

def save_patient(data):
    if not supabase:
        return False

    try:
        supabase.table("patients").insert(data).execute()
        return True
    except Exception:
        return False


def check_supabase_health():
    if not supabase:
        return {
            "status": "down",
            "reason": "Supabase client is not configured."
        }

    started_at = datetime.now(timezone.utc)
    try:
        supabase.table("patients").select("id", count="exact").limit(1).execute()
        latency_ms = int((datetime.now(timezone.utc) - started_at).total_seconds() * 1000)
        return {
            "status": "up",
            "latency_ms": latency_ms
        }
    except Exception as exc:
        return {
            "status": "down",
            "reason": str(exc)
        }
