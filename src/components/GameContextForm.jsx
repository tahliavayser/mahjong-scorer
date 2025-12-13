import { useState } from 'react';
import './GameContextForm.css';

const GameContextForm = ({ onSubmit, onSkip, showFlowersSeasons = true }) => {
  const [context, setContext] = useState({
    winType: 'selfPick',
    seatWind: 'east',
    roundWind: 'east',
    seatNumber: 1,
    isDealer: false,
    fullyConcealedHand: true,
    flowers: [], // 1, 2, 3, 4
    seasons: [], // 1, 2, 3, 4
    noFlowersSeasons: false
  });

  const flowerLabels = [
    { value: 1, icon: '🌸', name: 'Plum' },
    { value: 2, icon: '🌺', name: 'Orchid' },
    { value: 3, icon: '🌷', name: 'Chrysanthemum' },
    { value: 4, icon: '🎋', name: 'Bamboo' }
  ];

  const seasonLabels = [
    { value: 1, icon: '🌸', name: 'Spring' },
    { value: 2, icon: '☀️', name: 'Summer' },
    { value: 3, icon: '🍂', name: 'Autumn' },
    { value: 4, icon: '❄️', name: 'Winter' }
  ];

  const toggleFlower = (value) => {
    if (context.noFlowersSeasons) return;
    setContext(prev => ({
      ...prev,
      flowers: prev.flowers.includes(value)
        ? prev.flowers.filter(f => f !== value)
        : [...prev.flowers, value]
    }));
  };

  const toggleSeason = (value) => {
    if (context.noFlowersSeasons) return;
    setContext(prev => ({
      ...prev,
      seasons: prev.seasons.includes(value)
        ? prev.seasons.filter(s => s !== value)
        : [...prev.seasons, value]
    }));
  };

  const toggleNoFlowersSeasons = () => {
    setContext(prev => ({
      ...prev,
      noFlowersSeasons: !prev.noFlowersSeasons,
      flowers: !prev.noFlowersSeasons ? [] : prev.flowers,
      seasons: !prev.noFlowersSeasons ? [] : prev.seasons
    }));
  };

  const handleChange = (field, value) => {
    setContext(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(context);
  };

  return (
    <div className="game-context-form">
      <div className="form-card">
        <h2>Game Context</h2>
        <p className="form-description">
          Please provide details about how you won to calculate the accurate score.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>How did you win?</h3>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="winType"
                  value="selfPick"
                  checked={context.winType === 'selfPick'}
                  onChange={(e) => handleChange('winType', e.target.value)}
                />
                <div className="radio-content">
                  <strong>Self-Pick (自摸)</strong>
                  <span>Drew the winning tile from the wall</span>
                </div>
              </label>

              <label className="radio-option">
                <input
                  type="radio"
                  name="winType"
                  value="discard"
                  checked={context.winType === 'discard'}
                  onChange={(e) => handleChange('winType', e.target.value)}
                />
                <div className="radio-content">
                  <strong>From Discard</strong>
                  <span>Won from another player's discard</span>
                </div>
              </label>

              <label className="radio-option">
                <input
                  type="radio"
                  name="winType"
                  value="kongReplacement"
                  checked={context.winType === 'kongReplacement'}
                  onChange={(e) => handleChange('winType', e.target.value)}
                />
                <div className="radio-content">
                  <strong>Kong Replacement (槓上開花)</strong>
                  <span>Won on a replacement tile after declaring Kong</span>
                </div>
              </label>

              <label className="radio-option">
                <input
                  type="radio"
                  name="winType"
                  value="robbingKong"
                  checked={context.winType === 'robbingKong'}
                  onChange={(e) => handleChange('winType', e.target.value)}
                />
                <div className="radio-content">
                  <strong>Robbing the Kong (搶槓)</strong>
                  <span>Won by taking another player's Kong tile</span>
                </div>
              </label>

              <label className="radio-option">
                <input
                  type="radio"
                  name="winType"
                  value="moonUnderSea"
                  checked={context.winType === 'moonUnderSea'}
                  onChange={(e) => handleChange('winType', e.target.value)}
                />
                <div className="radio-content">
                  <strong>Moon Under The Sea (海底撈月)</strong>
                  <span>Won on the last tile from the wall</span>
                </div>
              </label>
            </div>
          </div>

          <div className="form-section">
            <h3>Hand Status</h3>
            <div className="form-row">
              <label className="checkbox-option">
                <input
                  type="checkbox"
                  checked={context.fullyConcealedHand}
                  onChange={(e) => handleChange('fullyConcealedHand', e.target.checked)}
                />
                <span>Fully concealed hand (did not call Pong/Chow/Kong from discards)</span>
              </label>
            </div>
          </div>

          <div className="form-section">
            <h3>Player Position</h3>
            <div className="form-row">
              <label className="checkbox-option">
                <input
                  type="checkbox"
                  checked={context.isDealer}
                  onChange={(e) => handleChange('isDealer', e.target.checked)}
                />
                <span>I am the dealer (East seat)</span>
              </label>
            </div>

            <div className="form-row">
              <label>
                <span className="label-text">Your Seat Number:</span>
                <select
                  value={context.seatNumber}
                  onChange={(e) => handleChange('seatNumber', parseInt(e.target.value))}
                  className="select-input"
                >
                  <option value={1}>Seat 1 (East)</option>
                  <option value={2}>Seat 2 (South)</option>
                  <option value={3}>Seat 3 (West)</option>
                  <option value={4}>Seat 4 (North)</option>
                </select>
              </label>
            </div>
          </div>

          <div className="form-section">
            <h3>Wind Information</h3>
            <div className="form-row">
              <label>
                <span className="label-text">Your Seat Wind:</span>
                <select
                  value={context.seatWind}
                  onChange={(e) => handleChange('seatWind', e.target.value)}
                  className="select-input"
                >
                  <option value="east">East (東)</option>
                  <option value="south">South (南)</option>
                  <option value="west">West (西)</option>
                  <option value="north">North (北)</option>
                </select>
              </label>
            </div>

            <div className="form-row">
              <label>
                <span className="label-text">Round Wind:</span>
                <select
                  value={context.roundWind}
                  onChange={(e) => handleChange('roundWind', e.target.value)}
                  className="select-input"
                >
                  <option value="east">East Round (東)</option>
                  <option value="south">South Round (南)</option>
                  <option value="west">West Round (西)</option>
                  <option value="north">North Round (北)</option>
                </select>
              </label>
            </div>
          </div>

          {showFlowersSeasons && (
            <div className="form-section">
              <h3>Bonus Tiles (Flowers & Seasons)</h3>
              <p className="section-description">
                Select any flowers or seasons you collected during the game.
              </p>
              
              <div className="form-row">
                <label className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={context.noFlowersSeasons}
                    onChange={toggleNoFlowersSeasons}
                  />
                  <span>No flowers or seasons</span>
                </label>
              </div>

              <div className={`bonus-tiles-section ${context.noFlowersSeasons ? 'disabled' : ''}`}>
                <div className="bonus-group">
                  <span className="bonus-label">Flowers:</span>
                  <div className="bonus-buttons">
                    {flowerLabels.map(flower => (
                      <button
                        key={`flower-${flower.value}`}
                        type="button"
                        className={`bonus-btn ${context.flowers.includes(flower.value) ? 'selected' : ''}`}
                        onClick={() => toggleFlower(flower.value)}
                        disabled={context.noFlowersSeasons}
                        title={flower.name}
                      >
                        {flower.icon} {flower.value}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bonus-group">
                  <span className="bonus-label">Seasons:</span>
                  <div className="bonus-buttons">
                    {seasonLabels.map(season => (
                      <button
                        key={`season-${season.value}`}
                        type="button"
                        className={`bonus-btn ${context.seasons.includes(season.value) ? 'selected' : ''}`}
                        onClick={() => toggleSeason(season.value)}
                        disabled={context.noFlowersSeasons}
                        title={season.name}
                      >
                        {season.icon} {season.value}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {(context.flowers.length > 0 || context.seasons.length > 0) && (
                <p className="bonus-summary">
                  Selected: {context.flowers.length + context.seasons.length} bonus tile(s)
                </p>
              )}
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn btn-skip" onClick={onSkip}>
              Skip (Use Defaults)
            </button>
            <button type="submit" className="btn btn-submit">
              Calculate Score
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GameContextForm;

