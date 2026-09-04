function RiskFactors({ factors }) {
  if (!factors || factors.length === 0) {
    return null;
  }

  return (
    <div>
      <h2>WHY FLAGGED?</h2>

      {factors.map((factor, index) => (
        <p key={index}>
          ⚠ {factor}
        </p>
      ))}
    </div>
  );
}

export default RiskFactors;