# RAKSHA — AI Risk Manager for Razorpay

RAKSHA is an intelligent, defensive transaction risk management system built for the Razorpay AI Builder Buildathon. It combines high-throughput machine learning inference on fraud patterns with automated decisioning, secure webhook processing, and an LLM-assisted investigation layer for merchant dashboards.

---

## Architecture Overview

```text
Razorpay Test Transaction / Client API
           │
           ▼
    FastAPI Backend
           │
 ┌─────────┴─────────┐
 │                   │
 ▼                   ▼
POST /api/risk/analyze   POST /webhooks/razorpay
                     │ (HMAC-SHA256 Signature Verification)
                     │ (Duplicate Event Idempotency Check)
                     ▼
           Transaction Normalization
                     │
                     ▼
       ML Preprocessing & Frequency Encoding
           (42 Final Features, Categorical Maps)
                     │
                     ▼
       HistGradientBoostingClassifier Model
           (Trained on IEEE-CIS Fraud Dataset)
                     │
                     ▼
              Fraud Risk Score
           (0.0 - 1.0 Relative Risk Score)
                     │
                     ▼
              Decision Engine
  ┌──────────────────┼──────────────────┐
  │ (< 0.40)         │ (0.40 - 0.69)    │ (>= 0.70)
  ▼                  ▼                  ▼
 LOW / ALLOW       MEDIUM / VERIFY    HIGH / REVIEW
  │                  │                  │
  └──────────────────┬──────────────────┘
                     │
                     ▼
        SQLite Database & Audit Log
                     │
                     ▼
       Featherless AI Investigation Layer
        (Defensive Evidence Explanation Only)
                     │
                     ▼
          Merchant Dashboard / API
```

---

## Machine Learning Fraud Risk Model

- **Model Type**: Scikit-learn `HistGradientBoostingClassifier`
- **Training Data**: IEEE-CIS Fraud Detection dataset (413,378 training transactions)
- **Artifacts**:
  - `models/raksha_fraud_model.pkl`: Serialized model pipeline
  - `models/raksha_config.json`: Feature definitions and operating thresholds
  - `models/raksha_frequency_maps.json`: Frequency encoding tables from training data
- **Features**: 42 numeric and frequency-encoded categorical features including transaction amount, time offsets, card attributes, email domains, address IDs, distance metrics, and Vesta engineered features.
- **Categorical Handling**: 13 categorical features (`ProductCD`, `card1`-`card6`, `addr1`, `addr2`, `P_emaildomain`, `R_emaildomain`, `DeviceType`, `DeviceInfo`) are mapped to frequency counts from training. Unknown categories safely map to frequency `0`.
- **Numeric Conversion**: All input features are safely coerced to numeric formats before inference. Missing values are represented as `NaN` (handled natively by the gradient boosting trees).
- **Risk Score vs. Probability**: Because the model was trained with `class_weight="balanced"` to handle severe class imbalance (~3.5% fraud in raw data), the model output (`predict_proba[:, 1]`) serves as a **relative fraud risk score** rather than a calibrated probability.

### Model Evaluation (Held-out IEEE-CIS Test Set)
Evaluation is derived strictly from the labeled held-out test partition (88,581 transactions, 3,083 fraudulent):

- **Overall Test Accuracy**: 90.34%
- **Legitimate Transactions (Class 0)**: Precision = 0.9855, Recall = 0.9133, F1 = 0.9480
- **Fraudulent Transactions (Class 1 at 0.65 threshold)**: Precision = 0.2069, Recall = 0.6270, F1 = 0.3111
- **Fraud Capture by Risk Tier**:
  - **LOW (< 0.30)**: 60,188 transactions, 0.70% fraud rate (captures 13.62% of fraud)
  - **MEDIUM (0.30 - 0.65)**: 19,050 transactions, 3.83% fraud rate (captures 23.68% of fraud)
  - **HIGH (>= 0.65)**: 9,343 transactions, 20.69% fraud rate (captures 62.70% of fraud)

> **Note on Live vs. Historical Data**: Live Razorpay test transactions demonstrate real-time inference, webhook verification, and product flow. They do not have ground-truth fraud labels. Precision and recall metrics are proven via historical held-out test evaluation.

---

## Decision Engine & Risk Tiers

The decision engine applies bounded business policies to the continuous ML risk score:

| Risk Score Range | Risk Level | Decision | Action |
| :--- | :--- | :--- | :--- |
| `score < 0.40` | `LOW` | `ALLOW` | Auto-approve frictionless checkout |
| `0.40 <= score < 0.70` | `MEDIUM` | `VERIFY` | Trigger stepped-up 2FA/OTP verification |
| `score >= 0.70` | `HIGH` | `REVIEW` | Route to fraud analyst queue / manual review |

---

## Webhook Integration (`POST /webhooks/razorpay`)

The webhook endpoint is designed specifically for Razorpay server-to-server payment notifications:
1. **HMAC-SHA256 Signature Verification**: Matches incoming `X-Razorpay-Signature` against `RAZORPAY_WEBHOOK_SECRET`. Unsigned or invalid webhooks are rejected with `400 Bad Request`.
2. **Idempotency & Duplicate Protection**: Tracks `x-razorpay-event-id` in SQLite. Duplicate events return status `duplicate` without re-processing or duplicate records.
3. **Payload Normalization**: Automatically converts amount from paise to rupees (`amount / 100`) and maps payment method attributes into the 42-feature model input format.
4. **Audit Logging**: Saves complete ML score, assigned risk level, and policy decision to the SQLite audit log.

---

## Featherless AI Investigation Layer

Featherless AI powers defensive, post-decision explanations on `/api/transactions/{id}/investigate`:
- **Strict Evidence Bounding**: Explains existing ML risk factors and transaction attributes.
- **No Score Override**: The LLM cannot alter risk scores, change decisions, or approve/reject payments.
- **Graceful Degradation**: If `FEATHERLESS_API_KEY` or `FEATHERLESS_MODEL` is missing or the external API is unreachable, the endpoint returns an `unavailable` status cleanly without crashing the service.

---

## Getting Started

### 1. Prerequisites & Environment Setup
Ensure Python 3.11+ is installed.

```bash
# Create virtual environment (if not already present)
python -m venv .venv

# Activate virtual environment
# Windows (cmd/powershell):
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Environment Variables
Create a `.env` file in the project root:

```env
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
FEATHERLESS_API_KEY=your_featherless_api_key
FEATHERLESS_MODEL=meta-llama/Meta-Llama-3.1-8B-Instruct
```

### 3. Start the Backend Server

```bash
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

---

## API Reference & Testing

### Health Check
```bash
curl -s http://127.0.0.1:8000/health
```

### Analyze Risk (ML Inference)
```bash
curl -X POST http://127.0.0.1:8000/api/risk/analyze \
  -H "Content-Type: application/json" \
  -d '{"amount": 15000, "currency": "INR", "payment_method": "card"}'
```

Sample Response:
```json
{
  "transaction_id": "5de6e171-4127-464a-a690-4213b7d26e4c",
  "risk_score": 0.07820426342945679,
  "risk_level": "LOW",
  "decision": "ALLOW"
}
```

### Get Transactions
```bash
curl -s http://127.0.0.1:8000/api/transactions
```

### Get Risk Metrics
```bash
curl -s http://127.0.0.1:8000/api/metrics
```

### Investigate Transaction
```bash
curl -X POST http://127.0.0.1:8000/api/transactions/{transaction_id}/investigate
```
