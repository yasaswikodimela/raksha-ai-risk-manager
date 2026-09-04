def make_decision(risk_score: float):
    if risk_score < 0.40:
        return {
            "risk_level": "low",
            "decision": "allow"
        }

    elif risk_score < 0.70:
        return {
            "risk_level": "medium",
            "decision": "verify"
        }

    else:
        return {
            "risk_level": "high",
            "decision": "review"
        }