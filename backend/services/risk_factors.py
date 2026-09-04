def get_risk_factors(transaction: dict):
    factors = []

    if transaction["risk_score"] >= 0.70:
        factors.append({
            "factor": "High risk score",
            "severity": "high",
            "description": "The ML risk score is above the high-risk threshold."
        })

    elif transaction["risk_score"] >= 0.40:
        factors.append({
            "factor": "Elevated risk score",
            "severity": "medium",
            "description": "The transaction has an elevated risk score."
        })

    else:
        factors.append({
            "factor": "Low risk score",
            "severity": "low",
            "description": "The transaction has a low predicted risk."
        })

    if transaction["amount"] >= 10000:
        factors.append({
            "factor": "Large transaction amount",
            "severity": "medium",
            "description": "The transaction amount is relatively high."
        })

    return factors