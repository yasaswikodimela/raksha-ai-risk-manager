function AIInvestigation({ transaction }) {
  if (!transaction) {
    return null;
  }

  return (
    <div>
      <h2>AI INVESTIGATION</h2>

      <p>Why was this transaction flagged?</p>

      <div>
        <h3>ML MODEL</h3>
        <p>Risk = {transaction.riskScore}%</p>
      </div>

      <div>
        <h3>↓</h3>
      </div>

      <div>
        <h3>DECISION ENGINE</h3>
        <p>{transaction.decision}</p>
      </div>

      <div>
        <h3>↓</h3>
      </div>

      <div>
        <h3>AI INVESTIGATOR</h3>

        <p>
          This transaction was classified as {transaction.risk} risk
          because the detected transaction patterns differ from the
          customer's normal behavior.
        </p>
      </div>
    </div>
  );
}

export default AIInvestigation;