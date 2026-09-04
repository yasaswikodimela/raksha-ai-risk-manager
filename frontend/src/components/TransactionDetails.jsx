import { useEffect, useState } from "react";

function TransactionDetails({ transaction }) {
  const [investigation, setInvestigation] = useState(null);

  useEffect(() => {
    if (!transaction) {
      setInvestigation(null);
      return;
    }

    console.log("Selected transaction:", transaction);
  }, [transaction]);

  if (!transaction) {
    return (
      <div>
        <h2>TRANSACTION INVESTIGATION</h2>
        <p>Select a transaction from Live Activity.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>TRANSACTION INVESTIGATION</h2>

      <p>
        <strong>Transaction ID:</strong>{" "}
        {transaction.transaction_id}
      </p>

      <p>
        <strong>Amount:</strong> ₹{transaction.amount}
      </p>

      <p>
        <strong>Currency:</strong> {transaction.currency}
      </p>

      <p>
        <strong>Payment Method:</strong>{" "}
        {transaction.payment_method}
      </p>

      <p>
        <strong>Risk Score:</strong> {transaction.risk_score}
      </p>

      <p>
        <strong>Risk Level:</strong>{" "}
        {transaction.risk_level}
      </p>

      <p>
        <strong>Decision:</strong>{" "}
        {transaction.decision}
      </p>
    </div>
  );
}

export default TransactionDetails;