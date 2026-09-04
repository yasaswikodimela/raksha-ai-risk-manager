from dotenv import load_dotenv

load_dotenv()
from fastapi import FastAPI
from pydantic import BaseModel
import uuid
from backend.services.risk_factors import get_risk_factors
from backend.decision_engine import make_decision
from backend.database.database import (
    save_transaction,
    get_transactions,
    get_transaction,
    get_metrics
)
from backend.services.ai_service import get_ai_investigation
app = FastAPI(title="RAKSHA API")


class RiskRequest(BaseModel):
    amount: float
    currency: str
    payment_method: str


class RiskResponse(BaseModel):
    transaction_id: str
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

    # Temporary risk scoring.
    # This will later be replaced by Person 1's ML model.
    if request.amount >= 10000:
        risk_score = 0.85
    elif request.amount >= 5000:
        risk_score = 0.55
    else:
        risk_score = 0.10

    decision = make_decision(risk_score)

    transaction_id = str(uuid.uuid4())

    save_transaction(
        transaction_id=transaction_id,
        amount=request.amount,
        currency=request.currency,
        payment_method=request.payment_method,
        risk_score=risk_score,
        risk_level=decision["risk_level"],
        decision=decision["decision"]
    )

    return {
        "transaction_id": transaction_id,
        "risk_score": risk_score,
        "risk_level": decision["risk_level"],
        "decision": decision["decision"]
    }
@app.get("/api/transactions")
def list_transactions():
    return get_transactions()
@app.get("/api/transactions/{transaction_id}")
def transaction_details(transaction_id: str):
    transaction = get_transaction(transaction_id)

    if transaction is None:
        return {
            "error": "Transaction not found"
        }

    transaction["risk_factors"] = get_risk_factors(transaction)

    return transaction
@app.get("/api/metrics")
def metrics():
    return get_metrics()
@app.post("/api/transactions/{transaction_id}/investigate")
def investigate_transaction(transaction_id: str):
    transaction = get_transaction(transaction_id)

    if transaction is None:
        return {
            "error": "Transaction not found"
        }

    risk_factors = get_risk_factors(transaction)

    investigation = get_ai_investigation(
        transaction,
        risk_factors
    )

    return {
        "transaction_id": transaction_id,
        "risk_factors": risk_factors,
        "investigation": investigation
    }