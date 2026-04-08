# Hospital AI Agent

A full-stack hospital intake assistant with:
- Conversational patient intake flow
- AI-based ward classification
- Severity scoring and AI explanation
- Admin dashboard with charts and live system health

## Tech Stack

- Frontend: React + Vite + Tailwind CSS + Chart.js
- Backend: FastAPI
- Database: Supabase (`patients` table)
- AI: Google Gemini (`google-genai`)

## Project Structure

- `backend/` FastAPI app and AI/data logic
- `frontend/` React app (patient chat + admin dashboard)

## Features

- Patient chat flow:
1. Patient query
2. Patient name
3. Patient age
4. Ward assignment + severity + explanation

- Session handling:
- Uses session IDs from frontend
- If a session is already complete, backend starts a fresh intake automatically

- Admin dashboard:
- Total patients
- Emergency rate
- Active wards
- Ward bar chart
- Emergency pie chart
- Severity and explanation in records table
- Health badge + dropdown service status

- Health endpoint (`/health`):
- Backend status
- Supabase status/latency
- Gemini status/latency

## API Endpoints

- `GET /patients`
- Returns patient records list

- `POST /chat`
- Request body:
```json
{
  "session_id": "string",
  "message": "string"
}
```
- Returns assistant reply and optional `data` object once intake completes

- `GET /analytics`
- Returns:
```json
{
  "total": 0,
  "emergency_rate": 0,
  "ward_counts": {},
  "severity_counts": { "LOW": 0, "MEDIUM": 0, "HIGH": 0 }
}
```

- `GET /health`
- Returns overall + per-service health status

## Environment Variables

Create `backend/.env`:

```env
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

## Local Setup

### 1) Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://127.0.0.1:5173` (or `http://localhost:5173`).

## Data Contract

A patient record may contain:

```json
{
  "patient_name": "Rohit",
  "patient_age": "26",
  "patient_query": "I have fever",
  "ward": "General",
  "severity": "MEDIUM",
  "explanation": "Assigned to General with MEDIUM risk based on reported symptoms.",
  "timestamp": "2026-04-09T02:39:49.447813"
}
```

## Fallback Behavior (Important)

If Gemini or Supabase is unavailable:
- App does not crash
- `/health` reports degraded status
- Ward defaults to `General` when AI response is invalid/unavailable
- Severity defaults to `MEDIUM` when AI response is invalid/unavailable
- Explanation falls back to a safe template sentence
- `/patients` and `/analytics` still return valid JSON structures

This is why you may still see severity/explanation even when Gemini quota is exhausted.

## Troubleshooting

- Chat says `trouble connecting`:
- Verify backend is running on `127.0.0.1:8000`

- Dashboard analytics fails:
- Open `GET /health` and check `supabase` and `gemini` status

- Styling missing:
- Ensure frontend CSS uses Tailwind v4 import (`@import "tailwindcss";`)
- Restart Vite and hard refresh browser

## Notes

- CORS is enabled for:
- `http://localhost:5173`
- `http://127.0.0.1:5173`

- Python 3.9 works but is legacy; upgrading Python is recommended for long-term compatibility.
