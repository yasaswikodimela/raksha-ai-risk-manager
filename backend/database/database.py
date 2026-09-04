import sqlite3
from pathlib import Path


DATABASE_PATH = Path(__file__).resolve().parent / "raksha.db"


def get_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
    connection = get_connection()

    connection.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            transaction_id TEXT UNIQUE NOT NULL,
            amount REAL NOT NULL,
            currency TEXT NOT NULL,
            payment_method TEXT NOT NULL,
            risk_score REAL NOT NULL,
            risk_level TEXT NOT NULL,
            decision TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    connection.execute("""
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            transaction_id TEXT NOT NULL,
            event_type TEXT NOT NULL,
            details TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    connection.execute("""
        CREATE TABLE IF NOT EXISTS webhook_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_id TEXT UNIQUE NOT NULL,
            event_type TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    connection.commit()
    connection.close()


def save_transaction(
    transaction_id: str,
    amount: float,
    currency: str,
    payment_method: str,
    risk_score: float,
    risk_level: str,
    decision: str
):
    connection = get_connection()

    connection.execute(
        """
        INSERT INTO transactions (
            transaction_id,
            amount,
            currency,
            payment_method,
            risk_score,
            risk_level,
            decision
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            transaction_id,
            amount,
            currency,
            payment_method,
            risk_score,
            risk_level,
            decision
        )
    )

    connection.commit()
    connection.close()

def get_transactions():
    connection = get_connection()

    rows = connection.execute(
        """
        SELECT
            transaction_id,
            amount,
            currency,
            payment_method,
            risk_score,
            risk_level,
            decision,
            created_at
        FROM transactions
        ORDER BY created_at DESC
        """
    ).fetchall()

    connection.close()

    return [dict(row) for row in rows]
def get_transaction(transaction_id: str):
    connection = get_connection()

    row = connection.execute(
        """
        SELECT
            transaction_id,
            amount,
            currency,
            payment_method,
            risk_score,
            risk_level,
            decision,
            created_at
        FROM transactions
        WHERE transaction_id = ?
        """,
        (transaction_id,)
    ).fetchone()

    connection.close()

    if row is None:
        return None

    return dict(row)
def get_metrics():
    connection = get_connection()

    total = connection.execute(
        "SELECT COUNT(*) FROM transactions"
    ).fetchone()[0]

    high_risk = connection.execute(
        "SELECT COUNT(*) FROM transactions WHERE LOWER(risk_level) = 'high'"
    ).fetchone()[0]

    medium_risk = connection.execute(
        "SELECT COUNT(*) FROM transactions WHERE LOWER(risk_level) = 'medium'"
    ).fetchone()[0]

    low_risk = connection.execute(
        "SELECT COUNT(*) FROM transactions WHERE LOWER(risk_level) = 'low'"
    ).fetchone()[0]

    connection.close()

    return {
        "total_transactions": total,
        "high_risk": high_risk,
        "medium_risk": medium_risk,
        "low_risk": low_risk
    }
def save_audit_log(
    transaction_id: str,
    event_type: str,
    details: str
):
    connection = get_connection()

    connection.execute(
        """
        INSERT INTO audit_logs (
            transaction_id,
            event_type,
            details
        )
        VALUES (?, ?, ?)
        """,
        (
            transaction_id,
            event_type,
            details
        )
    )

    connection.commit()
    connection.close()
def get_audit_logs(transaction_id: str):
    connection = get_connection()

    rows = connection.execute(
        """
        SELECT
            event_type,
            details,
            created_at
        FROM audit_logs
        WHERE transaction_id = ?
        ORDER BY created_at ASC
        """,
        (transaction_id,)
    ).fetchall()

    connection.close()

    return [dict(row) for row in rows]
def webhook_event_exists(event_id: str):
    connection = get_connection()

    row = connection.execute(
        "SELECT 1 FROM webhook_events WHERE event_id = ?",
        (event_id,)
    ).fetchone()

    connection.close()

    return row is not None


def save_webhook_event(event_id: str, event_type: str):
    connection = get_connection()

    connection.execute(
        """
        INSERT INTO webhook_events (event_id, event_type)
        VALUES (?, ?)
        """,
        (event_id, event_type)
    )

    connection.commit()
    connection.close()