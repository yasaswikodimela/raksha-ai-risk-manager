from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="RAKSHA API")


# Request data coming from frontend
class RiskRequest(BaseModel):
    amount: float
    currency: str
    payment_method: str


# Response sent back to frontend
class RiskResponse(BaseModel):
    risk_score: float
    risk_level: str
    decision: str


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "raksha-backend"
    }


@app.post("/api/risk/analyze", response_model=RiskResponse)
def analyze_risk(request: RiskRequest):

    # Temporary logic.
    # Person 1's ML model will replace this later.
    if request.amount >= 10000:
        risk_score = 0.85
        risk_level = "high"
        decision = "review"
    elif request.amount >= 5000:
        risk_score = 0.55
        risk_level = "medium"
        decision = "verify"
    else:
        risk_score = 0.10
        risk_level = "low"
        decision = "allow"

    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "decision": decision
    }