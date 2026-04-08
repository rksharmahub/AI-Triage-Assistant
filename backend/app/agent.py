from datetime import datetime
from app.gemini import generate_reply
from app.database import save_patient

sessions = {}

VALID_SEVERITIES = {"LOW", "MEDIUM", "HIGH"}
VALID_WARDS = {"Emergency", "General", "Mental Health"}


def new_session():
    return {
        "name": None,
        "age": None,
        "query": None,
        "ward": None,
        "severity": None,
        "explanation": None
    }


# 🔥 Severity using Gemini
def classify_severity(query):
    prompt = f"""
    Classify severity of this patient case:
    LOW, MEDIUM, HIGH

    Query: {query}
    Only return one word.
    """
    severity = generate_reply(prompt).strip().upper()
    if severity not in VALID_SEVERITIES:
        return "MEDIUM"
    return severity


# 🔥 Ward classification
def classify_ward(query):
    prompt = f"""
    Classify this into:
    Emergency, General, Mental Health

    Query: {query}
    Only return category.
    """
    ward = generate_reply(prompt).strip()
    if ward not in VALID_WARDS:
        return "General"
    return ward


# 🔥 AI Explanation
def generate_explanation(query, ward, severity):
    prompt = f"""
    Explain in 1 line why this patient is classified as {ward} with {severity} risk.

    Query: {query}
    """
    explanation = generate_reply(prompt).strip()
    if explanation:
        return explanation
    return f"Assigned to {ward} with {severity} risk based on reported symptoms."


def handle_chat(session_id, message):
    if session_id not in sessions:
        sessions[session_id] = new_session()

    session = sessions[session_id]

    # If an intake is complete and a new message arrives, restart intake.
    if session["query"] and session["name"] and session["age"]:
        sessions[session_id] = new_session()
        session = sessions[session_id]
        session["query"] = message
        return {"reply": "Starting a new intake. May I know your name?"}

    # Step 1: Query
    if not session["query"]:
        session["query"] = message
        return {"reply": "May I know your name?"}

    # Step 2: Name
    if not session["name"]:
        session["name"] = message
        return {"reply": "Please tell your age"}

    # Step 3: Age + AI Decisions
    if not session["age"]:
        session["age"] = message

        session["ward"] = classify_ward(session["query"])
        session["severity"] = classify_severity(session["query"])
        session["explanation"] = generate_explanation(
            session["query"],
            session["ward"],
            session["severity"]
        )

        data = {
            "patient_name": session["name"],
            "patient_age": session["age"],
            "patient_query": session["query"],
            "ward": session["ward"],
            "severity": session["severity"],
            "explanation": session["explanation"],
            "timestamp": datetime.now().isoformat()
        }

        save_patient(data)

        return {
            "reply": f"{session['ward']} ward assigned ({session['severity']} risk)",
            "data": data
        }

    return {"reply": "May I know your name?"}
