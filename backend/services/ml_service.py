from pathlib import Path
import json
import joblib
import pandas as pd


BASE_DIR = Path(__file__).resolve().parents[2]

MODEL_PATH = BASE_DIR / "models" / "raksha_fraud_model.pkl"
CONFIG_PATH = BASE_DIR / "models" / "raksha_config.json"
FREQUENCY_PATH = BASE_DIR / "models" / "raksha_frequency_maps.json"


# Load ML artifacts once when the backend starts
model = joblib.load(MODEL_PATH)

with open(CONFIG_PATH, "r") as f:
    config = json.load(f)

with open(FREQUENCY_PATH, "r") as f:
    frequency_maps = json.load(f)


FEATURE_COLS = config["feature_cols"]
MEDIUM_THRESHOLD = config["medium_risk_threshold"]
HIGH_THRESHOLD = config["high_risk_threshold"]

CATEGORICAL_COLS = [
    "ProductCD",
    "card1",
    "card2",
    "card3",
    "card4",
    "card5",
    "card6",
    "addr1",
    "addr2",
    "P_emaildomain",
    "R_emaildomain",
    "DeviceType",
    "DeviceInfo",
]


def get_risk_level(risk_score: float) -> str:
    if risk_score < MEDIUM_THRESHOLD:
        return "LOW"
    elif risk_score < HIGH_THRESHOLD:
        return "MEDIUM"
    return "HIGH"


def preprocess_transaction(transaction: dict) -> pd.DataFrame:
    row = dict(transaction)

    # Reproduce training-time frequency encoding
    for col in CATEGORICAL_COLS:
        if col in row:
            value = str(row[col])
            row[col] = frequency_maps[col].get(value, 0)

    # Keep exactly the features and order expected by the model
    processed = {
        feature: row.get(feature)
        for feature in FEATURE_COLS
    }

    return pd.DataFrame([processed], columns=FEATURE_COLS)


def predict_risk(transaction: dict) -> dict:
    X = preprocess_transaction(transaction)

    risk_score = float(model.predict_proba(X)[0, 1])

    return {
        "risk_score": risk_score,
        "risk_level": get_risk_level(risk_score)
    }