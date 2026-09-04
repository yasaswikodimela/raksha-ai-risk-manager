import { useEffect, useState } from "react";

function LiveActivity({ onSelectTransaction }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/transactions")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch transactions");
        }

        return response.json();
      })
      .then((data) => {
        setTransactions(data.transactions);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setError("Unable to load transactions");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p>Loading live activity...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h2>LIVE ACTIVITY</h2>

      {transactions.map((transaction) => (
        <div
          key={transaction.transaction_id}
          onClick={() => onSelectTransaction(transaction)}
          style={{ cursor: "pointer" }}
        >
          <span>{transaction.transaction_id} </span>

          <span>
            ₹{transaction.amount}{" "}
          </span>

          <span>
            {transaction.risk_level}{" "}
          </span>

          <span>{transaction.decision}</span>
        </div>
      ))}
    </div>
  );
}

export default LiveActivity;