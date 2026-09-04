import { useEffect, useState } from "react";
import LiveActivity from "./components/LiveActivity";
import MetricCard from "./components/MetricCard";
import TransactionDetails from "./components/TransactionDetails";
import RiskFactors from "./components/RiskFactors";
import Evaluation from "./components/Evaluation";

function App() {
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/metrics")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch metrics");
        }
        return response.json();
      })
      .then((data) => {
        setMetrics(data);
      })
      .catch((error) => {
        console.error("Metrics error:", error);
      });
  }, []);

  return (
    <div>
      <h1>RAKSHA</h1>
      <p>AI Transaction Risk Manager</p>

      <MetricCard
        title="Transactions"
        value={metrics?.total_transactions ?? "Loading..."}
      />

      <MetricCard
        title="High Risk"
        value={metrics?.high_risk ?? "Loading..."}
      />

      <MetricCard
        title="Medium Risk"
        value={metrics?.medium_risk ?? "Loading..."}
      />

      <MetricCard
        title="Low Risk"
        value={metrics?.low_risk ?? "Loading..."}
      />

      <MetricCard title="Precision" value="93.4%" />
      <MetricCard title="Recall" value="87.8%" />
      <MetricCard title="F1 Score" value="90.5%" />

      <LiveActivity
        onSelectTransaction={setSelectedTransaction}
      />

      <TransactionDetails
        transaction={selectedTransaction}
      />

      <RiskFactors
        factors={
          selectedTransaction
            ? [
                "4.8× normal transaction amount",
                "Unusual transaction velocity",
                "Multiple recent failed attempts",
              ]
            : []
        }
      />

      <Evaluation />
    </div>
  );
}

export default App;