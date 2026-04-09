from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.agent import handle_chat
from app.database import fetch_patients, check_supabase_health
from app.gemini import check_gemini_health
from datetime import datetime, timezone

import uvicorn

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=10000)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    supabase_health = check_supabase_health()
    gemini_health = check_gemini_health()

    services = {
        "backend": {"status": "up"},
        "supabase": supabase_health,
        "gemini": gemini_health,
    }

    overall_status = (
        "up"
        if all(service.get("status") == "up" for service in services.values())
        else "degraded"
    )

    return {
        "status": overall_status,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "services": services,
    }

@app.get("/patients")
def get_patients():
    return fetch_patients()

class ChatRequest(BaseModel):
    session_id: str
    message: str

@app.post("/chat")
def chat(req: ChatRequest):
    try:
        return handle_chat(req.session_id, req.message)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Chat processing failed: {exc}")

@app.get("/analytics")
def get_analytics():
    data = fetch_patients()

    total = len(data)
    emergency = sum(1 for d in data if d.get("ward") == "Emergency")

    ward_counts = {}
    severity_counts = {"LOW": 0, "MEDIUM": 0, "HIGH": 0}
    for d in data:
        ward = d.get("ward") or "Unknown"
        ward_counts[ward] = ward_counts.get(ward, 0) + 1

        severity = (d.get("severity") or "MEDIUM").upper()
        if severity not in severity_counts:
            severity = "MEDIUM"
        severity_counts[severity] += 1

    return {
        "total": total,
        "emergency_rate": (emergency / total * 100) if total else 0,
        "ward_counts": ward_counts,
        "severity_counts": severity_counts
    }
