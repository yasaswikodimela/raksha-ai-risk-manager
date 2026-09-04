function Evaluation() {
  return (
    <div>
      <h2>MODEL PERFORMANCE</h2>

      <div>
        <h3>Precision</h3>
        <p>93.4%</p>
      </div>

      <div>
        <h3>Recall</h3>
        <p>87.8%</p>
      </div>

      <div>
        <h3>F1 Score</h3>
        <p>90.5%</p>
      </div>

      <div>
        <h3>False Positives</h3>
        <p>23</p>
      </div>

      <div>
        <h3>False Negatives</h3>
        <p>11</p>
      </div>

      <div>
        <h3>Estimated FP Cost</h3>
        <p>₹11,500</p>
      </div>

      <div>
        <h3>Estimated FN Cost</h3>
        <p>₹55,000</p>
      </div>

      <h2>CONFUSION MATRIX</h2>

      <table border="1">
        <thead>
          <tr>
            <th></th>
            <th>Predicted LOW</th>
            <th>Predicted HIGH</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <th>Actual LOW</th>
            <td>9200 (TN)</td>
            <td>23 (FP)</td>
          </tr>

          <tr>
            <th>Actual HIGH</th>
            <td>11 (FN)</td>
            <td>766 (TP)</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default Evaluation;