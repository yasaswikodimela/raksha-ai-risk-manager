from pathlib import Path
import json
import joblib
import numpy as np
import pandas as pd


BASE_DIR = Path(__file__).resolve().parents[2]

MODEL_PATH = BASE_DIR / "models" / "raksha_fraud_model.pkl"
CONFIG_PATH = BASE_DIR / "models" / "raksha_config.json"
FREQUENCY_PATH = BASE_DIR / "models" / "raksha_frequency_maps.json"

# Validate artifact existence with clear error messages
if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"RAKSHA ML model file not found at: {MODEL_PATH}. "
        "Please ensure raksha_fraud_model.pkl exists in the models directory."
    )

if not CONFIG_PATH.exists():
    raise FileNotFoundError(
        f"RAKSHA config file not found at: {CONFIG_PATH}. "
        "Please ensure raksha_config.json exists in the models directory."
    )

if not FREQUENCY_PATH.exists():
    raise FileNotFoundError(
        f"RAKSHA frequency maps file not found at: {FREQUENCY_PATH}. "
        "Please ensure raksha_frequency_maps.json exists in the models directory."
    )

# Load ML artifacts once when the backend starts / module is imported
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
        if col in row and row[col] is not None and not (isinstance(row[col], float) and np.isnan(row[col])):
            value = str(row[col])
            # Categorical unknown values become frequency 0
            row[col] = frequency_maps.get(col, {}).get(value, 0)

    # Keep exactly the features and order expected by the model
    # Missing values become np.nan
    processed = {
        feature: row.get(feature, np.nan)
        for feature in FEATURE_COLS
    }

    df = pd.DataFrame([processed], columns=FEATURE_COLS)

    # Ensure every model feature is numeric before prediction using safe numeric conversion
    # Missing/unconvertible values become NaN rather than object dtype
    for col in FEATURE_COLS:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    return df


def predict_risk(transaction: dict) -> dict:
    X = preprocess_transaction(transaction)

    risk_score = float(model.predict_proba(X)[0, 1])

    return {
        "risk_score": risk_score,
        "risk_level": get_risk_level(risk_score)
    }
