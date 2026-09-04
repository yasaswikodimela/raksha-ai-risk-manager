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
        const transactionList = Array.isArray(data)
          ? data
          : data.transactions || [];

        setTransactions(transactionList);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setError("Unable to load transactions");
        setLoading(false);
      });
  }, []);

  const handleTransactionClick = async (transaction) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/transactions/${transaction.transaction_id}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch transaction details");
      }

      const data = await response.json();

      onSelectTransaction(data);
    } catch (error) {
      console.error("Transaction details error:", error);

      // Still show the basic transaction if the detail request fails
      onSelectTransaction(transaction);
    }
  };

  if (loading) {
    return <p>Loading live activity...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h2>LIVE ACTIVITY</h2>

      {transactions.length === 0 ? (
        <p>No transactions available.</p>
      ) : (
        transactions.map((transaction) => (
          <div
            key={transaction.transaction_id}
            onClick={() => handleTransactionClick(transaction)}
            style={{ cursor: "pointer" }}
          >
            <span>{transaction.transaction_id} </span>

            <span>₹{transaction.amount} </span>

            <span>{transaction.risk_level} </span>

            <span>{transaction.decision}</span>
          </div>
        ))
      )}
    </div>
  );
}

export default LiveActivity;