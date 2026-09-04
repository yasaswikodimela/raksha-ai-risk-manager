# RAKSHA API Contract

## Base URL

Local Development:

http://127.0.0.1:8000

---

## 1. GET /health

### Purpose
Check whether the RAKSHA backend is running.

### Request

GET /health

### Response

```json
{
  "status": "ok",
  "service": "raksha-backend"
}
2. POST /api/risk/analyze
Purpose

Analyze a transaction during development/testing.

Request

POST /api/risk/analyze

Content-Type: application/json

Request Body
{
  "amount": 45000,
  "currency": "INR",
  "payment_method": "card"
}
Response
{
  "transaction_id": "TXN_TEST_001",
  "amount": 45000,
  "currency": "INR",
  "risk_score": 0.91,
  "risk_level": "HIGH",
  "decision": "REVIEW",
  "risk_factors": [
    "High transaction amount",
    "Unusual transaction pattern"
  ],
  "ai_explanation": null
}

The values above are examples only. Actual risk values will come from the ML model.

3. GET /api/transactions
Purpose

Get recent transactions for the merchant dashboard.

Request

GET /api/transactions

Response
{
  "transactions": [
    {
      "transaction_id": "TXN001",
      "amount": 45000,
      "currency": "INR",
      "risk_score": 0.91,
      "risk_level": "HIGH",
      "decision": "REVIEW"
    },
    {
      "transaction_id": "TXN002",
      "amount": 1200,
      "currency": "INR",
      "risk_score": 0.12,
      "risk_level": "LOW",
      "decision": "ALLOW"
    }
  ]
}
4. GET /api/transactions/{transaction_id}
Purpose

Get detailed information about one transaction.

Example Request

GET /api/transactions/TXN001

Response
{
  "transaction_id": "TXN001",
  "amount": 45000,
  "currency": "INR",
  "risk_score": 0.91,
  "risk_level": "HIGH",
  "decision": "REVIEW",
  "risk_factors": [
    "High transaction amount",
    "Unusual transaction velocity"
  ],
  "ai_explanation": "The transaction shows elevated risk based on the available transaction evidence."
}
5. GET /api/metrics
Purpose

Provide metrics for the merchant dashboard.

Request

GET /api/metrics

Response
{
  "transactions_analyzed": 12540,
  "high_risk": 384,
  "medium_risk": 1214,
  "low_risk": 10942,
  "precision": 0.87,
  "recall": 0.82,
  "f1": 0.84,
  "false_positives": 120,
  "false_negatives": 80
}

The metrics above are examples only. Actual metrics must come from the held-out test set.

6. POST /webhooks/razorpay
Purpose

Receive payment events from Razorpay Test Mode.

Request

POST /webhooks/razorpay

Content-Type: application/json

Flow
Razorpay
   ↓
Webhook Event
   ↓
Signature Verification
   ↓
Normalization
   ↓
Feature Engine
   ↓
ML Risk Model
   ↓
Decision Engine
   ↓
Database
   ↓
AI Investigation
   ↓
Dashboard
Important

This endpoint is called by Razorpay, not by the frontend.

The frontend must never call this endpoint directly.

7. Webhook Security

Every Razorpay webhook must be verified before processing.

Incoming Webhook
       ↓
Signature Verification
       ↓
     Valid?
    /     \
   NO      YES
   ↓        ↓
REJECT    PROCESS

The webhook secret must:

Stay on the backend
Never be sent to the frontend
Never be committed to GitHub
Be stored in environment variables
8. Transaction Normalization

Razorpay's event format is converted into the RAKSHA internal format.

Razorpay Event
      ↓
Normalizer
      ↓
RAKSHA Transaction
Example
{
  "transaction_id": "pay_xxxxx",
  "amount": 45000,
  "currency": "INR",
  "payment_method": "card",
  "status": "authorized",
  "timestamp": "..."
}

Only data genuinely available from the Razorpay event/API should be used.

RAKSHA must not invent unavailable fields.

9. Behavioural Features

RAKSHA may derive behavioural features from its own transaction history.

Examples:

transactions_last_10min
transactions_last_1hr
average_amount
amount_deviation
transaction_frequency
failed_attempt_count
Flow
Incoming Payment
       ↓
RAKSHA Database
       ↓
Historical Transaction Data
       ↓
Feature Engine
       ↓
ML Model

Only calculate features when the required data actually exists.

10. Risk Score

The ML model produces a risk probability between:

0.0 → 1.0

Example:

0.12 = lower predicted risk
0.91 = higher predicted risk

The risk score does not automatically mean that a transaction is fraudulent.

11. Risk Levels

RAKSHA uses:

LOW
MEDIUM
HIGH

The final thresholds will be selected using model evaluation.

12. Decisions
LOW
 ↓
ALLOW

MEDIUM
 ↓
VERIFY / MONITOR

HIGH
 ↓
REVIEW / ALERT

The exact thresholds will be based on:

Precision
Recall
F1
False positives
False negatives
Assumed business costs

RAKSHA should avoid blindly blocking legitimate customers.

13. AI Investigation

The AI receives structured evidence from the RAKSHA backend.

Example Input
{
  "risk_score": 0.91,
  "risk_level": "HIGH",
  "decision": "REVIEW",
  "risk_factors": [
    "High transaction velocity",
    "Amount deviation"
  ]
}
Example Output
This transaction was flagged because the amount
is significantly above the customer's recent
transaction pattern and the transaction occurred
during an unusual burst of activity.
AI CAN:
Explain risk factors
Summarize evidence
Investigate supplied information
Generate an investigation summary
AI CANNOT:
Independently determine fraud
Override the ML model
Override the Decision Engine
Execute payments
Modify financial records
Bypass authentication
14. Database

The backend stores transaction information such as:

transaction_id
timestamp
amount
currency
payment_method
risk_score
risk_level
decision
model_version
ai_explanation

This allows the merchant dashboard to display transaction history.

15. Error Handling
Invalid Transaction
{
  "error": "Invalid transaction amount"
}
AI Failure
{
  "risk_score": 0.91,
  "risk_level": "HIGH",
  "decision": "REVIEW",
  "ai_explanation": null,
  "ai_status": "unavailable"
}

If Featherless is unavailable, the core ML risk decision should still work.

16. HTTP Status Codes
Status	Meaning
200	Successful request
201	Resource created
400	Invalid request
401	Unauthorized
403	Invalid webhook/signature
404	Resource not found
422	Validation error
500	Internal server error
17. Development / Evaluation Environment
PaySim / IEEE-CIS
       ↓
Data Cleaning
       ↓
Feature Engineering
       ↓
Train
       ↓
Validation
       ↓
Held-out Test
       ↓
Precision
Recall
F1
False Positives
False Negatives
Cost
       ↓
Threshold Selection

This environment proves the ML model's performance.

18. Live Demo Environment
Razorpay Test Mode
       ↓
Test Payment
       ↓
Webhook
       ↓
RAKSHA Backend
       ↓
Verification
       ↓
Normalization
       ↓
Feature Engineering
       ↓
Same Trained ML Model
       ↓
Risk Score
       ↓
Decision Engine
       ↓
Database
       ↓
AI Investigation
       ↓
Merchant Dashboard

This environment proves the end-to-end product integration.

19. Frontend Responsibilities

The frontend may call:

GET /api/transactions
GET /api/transactions/{transaction_id}
GET /api/metrics
POST /api/risk/analyze

The frontend must NOT call:

POST /webhooks/razorpay
20. Secrets

The following must never be exposed to the frontend:

FEATHERLESS_API_KEY
RAZORPAY_WEBHOOK_SECRET
Other backend secrets

Store secrets in environment variables.

Example:

FEATHERLESS_API_KEY=...
RAZORPAY_WEBHOOK_SECRET=...

Never commit .env to GitHub.

21. Core Design Principle
ML MODEL
   ↓
Detects / scores risk

DECISION ENGINE
   ↓
Controls bounded action

AI INVESTIGATOR
   ↓
Explains supplied evidence

DATABASE
   ↓
Maintains transaction history

DASHBOARD
   ↓
Merchant monitoring

The AI does not directly control financial actions.

22. API Contract Rules
Do not change field names without informing the frontend developer.
Do not change response structures without informing the frontend developer.
Do not expose API keys or secrets.
Do not fabricate risk scores or evaluation metrics.
Do not invent unavailable transaction features.
The webhook endpoint is backend-only.
The ML model determines risk probability.
The Decision Engine determines the bounded action.
The AI Investigator explains evidence but does not control financial actions.
Example values in this document are placeholders only.