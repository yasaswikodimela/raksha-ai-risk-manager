import RiskFactors from "./RiskFactors";
import AIInvestigation from "./AIInvestigation";

function TransactionDetails({ transaction }) {
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

      <h3>{transaction.id}</h3>

      <p>
        <strong>Amount:</strong> {transaction.amount}
      </p>

      <p>
        <strong>Risk Score:</strong> {transaction.riskScore}%
      </p>

      <p>
        <strong>Risk Level:</strong> {transaction.risk}
      </p>

      <p>
        <strong>Decision:</strong> {transaction.decision}
      </p>

      <RiskFactors factors={transaction.riskFactors} />

      <AIInvestigation transaction={transaction} />
    </div>
  );
}

export default TransactionDetails;