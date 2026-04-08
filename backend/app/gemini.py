import os
from dotenv import load_dotenv
from google import genai
from datetime import datetime, timezone

load_dotenv()

GEMINI_API_KEY = (os.getenv("GEMINI_API_KEY") or "").strip()
MODEL_NAME = "gemini-2.5-flash"
client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

def generate_reply(prompt):
    if not client:
        return ""

    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=[prompt]
        )
    except Exception:
        return ""

    if not response.candidates:
        return ""

    candidate = response.candidates[0]
    if not candidate.content or not candidate.content.parts:
        return ""

    return "".join(
        part.text or "" for part in candidate.content.parts
    )


def check_gemini_health():
    if not client:
        return {
            "status": "down",
            "reason": "Gemini client is not configured."
        }

    started_at = datetime.now(timezone.utc)
    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=["Reply with exactly: OK"]
        )
        latency_ms = int((datetime.now(timezone.utc) - started_at).total_seconds() * 1000)
        if not response.candidates:
            return {
                "status": "down",
                "reason": "No response candidates returned."
            }
        return {
            "status": "up",
            "latency_ms": latency_ms
        }
    except Exception as exc:
        return {
            "status": "down",
            "reason": str(exc)
        }
