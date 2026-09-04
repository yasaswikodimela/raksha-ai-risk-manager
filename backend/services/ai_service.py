import os

from openai import OpenAI


def get_ai_investigation(transaction: dict, risk_factors: list):
    api_key = os.getenv("FEATHERLESS_API_KEY")

    if not api_key:
        return {
            "status": "unavailable",
            "message": "Featherless API key is not configured."
        }

    client = OpenAI(
        base_url="https://api.featherless.ai/v1",
        api_key=api_key
    )

    model = os.getenv("FEATHERLESS_MODEL")

    if not model:
        return {
            "status": "unavailable",
            "message": "Featherless model is not configured."
        }

    prompt = f"""
You are RAKSHA, a defensive transaction-risk investigation assistant.

Your job is to explain the evidence already provided by the risk system.
Do not invent facts.
Do not change the risk score.
Do not approve, reject, or execute any financial transaction.

Transaction:
{transaction}

Risk factors:
{risk_factors}

Provide:
1. A short explanation of why this transaction received its risk level.
2. The important evidence.
3. A recommended review action.

Keep the response concise and suitable for a merchant dashboard.
"""

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens=300
        )

        return {
            "status": "success",
            "explanation": response.choices[0].message.content
        }
    except Exception as e:
        return {
            "status": "unavailable",
            "message": f"Featherless investigation unavailable: {str(e)}"
        }
