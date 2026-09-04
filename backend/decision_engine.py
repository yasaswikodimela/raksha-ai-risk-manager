def make_decision(risk_score: float):
    if risk_score < 0.40:
        return {
            "risk_level": "LOW",
            "decision": "ALLOW"
        }

    elif risk_score < 0.70:
        return {
            "risk_level": "MEDIUM",
            "decision": "VERIFY"
        }

    else:
        return {
            "risk_level": "HIGH",
            "decision": "REVIEW"
        }
