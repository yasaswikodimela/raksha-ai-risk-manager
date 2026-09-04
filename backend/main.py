from dotenv import load_dotenv
load_dotenv()

import json
from fastapi.middleware.cors import CORSMiddleware
import os
import hmac
import hashlib
import uuid

from fastapi import FastAPI, Request, HTTPException
from pydantic import BaseModel

from backend.database.database import (
    initialize_database,
    save_transaction,
    get_transactions,
    get_transaction,
    get_metrics,
    save_audit_log,
    get_audit_logs,
    webhook_event_exists,
    save_webhook_event
)

from backend.services.risk_factors import get_risk_factors
from backend.decision_engine import make_decision
from backend.services.ai_service import get_ai_investigation
from backend.services.ml_service import predict_risk


app = FastAPI(title="RAKSHA API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
initialize_database()

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

    # Build model input from API request
    model_input = {
        "TransactionAmt": request.amount,
        "TransactionDay": 0,
        "TransactionHour": 12,
        "ProductCD": "W",
        "card1": 0,
        "card2": 0,
        "card3": 0,
        "card4": request.payment_method,
        "card5": 0,
        "card6": request.payment_method,
        "addr1": 0,
        "addr2": 0,
        "P_emaildomain": "",
        "R_emaildomain": "",
        "DeviceType": "unknown",
        "DeviceInfo": "unknown"
    }

    # Actual ML fraud-risk prediction
    risk = predict_risk(model_input)

    risk_score = risk["risk_score"]
    risk_level = risk["risk_level"]

    # Decision engine uses ML risk score
    decision = make_decision(risk_score)

    transaction_id = str(uuid.uuid4())

    save_transaction(
        transaction_id=transaction_id,
        amount=request.amount,
        currency=request.currency,
        payment_method=request.payment_method,
        risk_score=risk_score,
        risk_level=risk_level,
        decision=decision["decision"]
    )

    save_audit_log(
        transaction_id=transaction_id,
        event_type="RISK_ANALYSIS",
        details=(
            f"ML risk score: {risk_score}, "
            f"risk level: {risk_level}, "
            f"decision: {decision['decision']}"
        )
    )

    return {
        "transaction_id": transaction_id,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "decision": decision["decision"]
    }


@app.get("/api/transactions")
def list_transactions():
    return get_transactions()


@app.get("/api/transactions/{transaction_id}")
def transaction_details(transaction_id: str):

    transaction = get_transaction(transaction_id)

    if transaction is None:
        return {"error": "Transaction not found"}

    transaction["risk_factors"] = get_risk_factors(transaction)

    return transaction


@app.get("/api/metrics")
def metrics():
    return get_metrics()


@app.post("/api/transactions/{transaction_id}/investigate")
def investigate_transaction(transaction_id: str):

    transaction = get_transaction(transaction_id)

    if transaction is None:
        return {"error": "Transaction not found"}

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


@app.get("/api/transactions/{transaction_id}/audit")
def transaction_audit(transaction_id: str):

    transaction = get_transaction(transaction_id)

    if transaction is None:
        return {"error": "Transaction not found"}

    return {
        "transaction_id": transaction_id,
        "audit_logs": get_audit_logs(transaction_id)
    }


@app.post("/webhooks/razorpay")
async def razorpay_webhook(request: Request):

    webhook_secret = os.getenv("RAZORPAY_WEBHOOK_SECRET")

    if not webhook_secret:
        raise HTTPException(
            status_code=500,
            detail="Razorpay webhook secret is not configured"
        )

    raw_body = await request.body()

    received_signature = request.headers.get("X-Razorpay-Signature")

    if not received_signature:
        raise HTTPException(
            status_code=400,
            detail="Missing Razorpay webhook signature"
        )

    expected_signature = hmac.new(
        webhook_secret.encode(),
        raw_body,
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(
        expected_signature,
        received_signature
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid Razorpay webhook signature"
        )

    event_id = request.headers.get("x-razorpay-event-id")

    if not event_id:
        raise HTTPException(
            status_code=400,
            detail="Missing Razorpay event ID"
        )

    if webhook_event_exists(event_id):
        return {
            "status": "duplicate",
            "message": "Webhook event already processed"
        }

    data = json.loads(raw_body)

    event_type = data.get("event", "unknown")

    payment = (
        data.get("payload", {})
        .get("payment", {})
        .get("entity", {})
    )

    amount = payment.get("amount", 0) / 100
    currency = payment.get("currency", "INR")
    payment_method = payment.get("method", "unknown")

    # Build ML model input from Razorpay payment
    model_input = {
        "TransactionAmt": amount,
        "TransactionDay": 0,
        "TransactionHour": 12,
        "ProductCD": "W",
        "card1": 0,
        "card2": 0,
        "card3": 0,
        "card4": payment_method,
        "card5": 0,
        "card6": payment_method,
        "addr1": 0,
        "addr2": 0,
        "P_emaildomain": "",
        "R_emaildomain": "",
        "DeviceType": "unknown",
        "DeviceInfo": "unknown"
    }

    # Actual ML fraud-risk prediction
    risk = predict_risk(model_input)

    risk_score = risk["risk_score"]
    risk_level = risk["risk_level"]

    decision = make_decision(risk_score)

    transaction_id = payment.get("id") or str(uuid.uuid4())

    save_transaction(
        transaction_id=transaction_id,
        amount=amount,
        currency=currency,
        payment_method=payment_method,
        risk_score=risk_score,
        risk_level=risk_level,
        decision=decision["decision"]
    )

    save_audit_log(
        transaction_id=transaction_id,
        event_type=event_type,
        details=(
            f"Razorpay webhook received. "
            f"ML risk score: {risk_score}, "
            f"risk level: {risk_level}, "
            f"decision: {decision['decision']}"
        )
    )

    save_webhook_event(event_id, event_type)

    return {
        "status": "processed",
        "transaction_id": transaction_id,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "decision": decision["decision"]
    }