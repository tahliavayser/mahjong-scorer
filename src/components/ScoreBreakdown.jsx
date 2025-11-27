import './ScoreBreakdown.css';

const ScoreBreakdown = ({ scoreResult }) => {
  if (!scoreResult) return null;

  const { totalFan, payment, meetsMinimum, minimumRequired, patterns, message, error } = scoreResult;

  if (error) {
    return (
      <div className="score-breakdown error">
        <h3>Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="score-breakdown">
      <div className={`total-score ${meetsMinimum ? 'winning' : 'not-winning'}`}>
        <h2>{totalFan} Fan</h2>
        <p className="payment">Payment: {payment} points</p>
        <p className={`status ${meetsMinimum ? 'success' : 'warning'}`}>
          {message}
        </p>
      </div>

      {patterns && patterns.length > 0 && (
        <div className="patterns-list">
          <h3>Scoring Breakdown</h3>
          <div className="patterns">
            {patterns.map((pattern, index) => (
              <div key={index} className="pattern-item">
                <div className="pattern-header">
                  <span className="pattern-name">{pattern.name}</span>
                  <span className="pattern-fan">{pattern.fan} Fan</span>
                </div>
                <p className="pattern-description">{pattern.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {patterns && patterns.length === 0 && (
        <div className="no-patterns">
          <p>No scoring patterns detected. This hand may not be a valid winning hand.</p>
        </div>
      )}
    </div>
  );
};

export default ScoreBreakdown;

