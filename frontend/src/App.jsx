import { useState } from "react";
import LiveActivity from "./components/LiveActivity";
import MetricCard from "./components/MetricCard";
import TransactionDetails from "./components/TransactionDetails";
import Evaluation from "./components/Evaluation";

function App() {
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  return (
    <div>
      <h1>RAKSHA</h1>
      <p>AI Transaction Risk Manager</p>

      <MetricCard
        title="Transactions"
        value="12,540"
      />

      <MetricCard
        title="High Risk"
        value="384"
      />

      <MetricCard
        title="Medium Risk"
        value="1,214"
      />

      <MetricCard
        title="Low Risk"
        value="10,942"
      />

      <MetricCard
        title="Precision"
        value="93.4%"
      />

      <MetricCard
        title="Recall"
        value="87.8%"
      />

      <MetricCard
        title="F1 Score"
        value="90.5%"
      />

      <LiveActivity
        onSelectTransaction={setSelectedTransaction}
      />

      <TransactionDetails
        transaction={selectedTransaction}
      />

      <Evaluation />
    </div>
  );
}

export default App;