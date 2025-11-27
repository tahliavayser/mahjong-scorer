import { useState, useEffect } from 'react';
import ImageCapture from './components/ImageCapture';
import TileDisplay from './components/TileDisplay';
import ScoreBreakdown from './components/ScoreBreakdown';
import ManualTileSelector from './components/ManualTileSelector';
import GameContextForm from './components/GameContextForm';
import { initializeTileDetection, detectTilesFromImage } from './utils/tileDetection';
import { parseHand } from './utils/handValidator';
import { calculateScore, formatScoreBreakdown } from './utils/scoringEngine';
import './App.css';

function App() {
  const [mode, setMode] = useState('image'); // 'image' or 'manual'
  const [detectedTiles, setDetectedTiles] = useState(null);
  const [scoreResult, setScoreResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [showContextForm, setShowContextForm] = useState(false);
  const [pendingHandData, setPendingHandData] = useState(null);

  useEffect(() => {
    // Initialize TensorFlow.js on component mount
    const init = async () => {
      await initializeTileDetection();
      setModelReady(true);
    };
    init();
  }, []);

  const handleImageCapture = async (imageBlob, imageUrl) => {
    setIsProcessing(true);
    setScoreResult(null);
    
    try {
      // Load the image
      const img = new Image();
      img.src = imageUrl;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Detect tiles from the image
      const tiles = await detectTilesFromImage(imageBlob, img);
      setDetectedTiles(tiles);

      // Show context form before scoring
      prepareForScoring(tiles);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Error processing image. Please try again or use manual tile selection.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualTilesSelected = (tiles) => {
    setDetectedTiles(tiles);
    prepareForScoring(tiles);
  };

  const prepareForScoring = (tiles) => {
    try {
      // Parse the hand to validate and identify sets
      const handData = parseHand(tiles);
      
      if (!handData) {
        setScoreResult({
          error: 'Invalid hand structure. Please ensure you have a valid winning hand (4 sets + 1 pair, or special hand pattern).'
        });
        return;
      }

      // Store the hand data and show context form
      setPendingHandData(handData);
      setShowContextForm(true);
    } catch (error) {
      console.error('Error parsing hand:', error);
      setScoreResult({
        error: 'Error parsing hand. Please check your tiles and try again.'
      });
    }
  };

  const handleContextSubmit = (gameContext) => {
    if (pendingHandData) {
      scoreHandWithContext(pendingHandData, gameContext);
    }
    setShowContextForm(false);
  };

  const handleContextSkip = () => {
    // Use default context
    const defaultContext = {
      winType: 'selfPick',
      seatWind: 'east',
      roundWind: 'east',
      seatNumber: 1,
      isDealer: false
    };
    
    if (pendingHandData) {
      scoreHandWithContext(pendingHandData, defaultContext);
    }
    setShowContextForm(false);
  };

  const scoreHandWithContext = (handData, gameContext) => {
    try {
      const score = calculateScore(handData, gameContext);
      const formattedScore = formatScoreBreakdown(score);
      setScoreResult(formattedScore);
    } catch (error) {
      console.error('Error scoring hand:', error);
      setScoreResult({
        error: 'Error calculating score. Please check your tiles and try again.'
      });
    }
  };


  const resetApp = () => {
    setDetectedTiles(null);
    setScoreResult(null);
    setShowContextForm(false);
    setPendingHandData(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1 onClick={resetApp} style={{ cursor: 'pointer' }}>🀄 Mahjong Hand Scorer</h1>
        <p className="subtitle">Hong Kong Scoring System</p>
      </header>

      <div className="mode-selector">
        <button 
          className={`mode-btn ${mode === 'image' ? 'active' : ''}`}
          onClick={() => setMode('image')}
        >
          📷 Image Detection
        </button>
        <button 
          className={`mode-btn ${mode === 'manual' ? 'active' : ''}`}
          onClick={() => setMode('manual')}
        >
          ✋ Manual Selection
        </button>
      </div>

      <main className="app-main">
        {showContextForm ? (
          <GameContextForm 
            onSubmit={handleContextSubmit}
            onSkip={handleContextSkip}
          />
        ) : (
          <>
            {mode === 'image' ? (
              <>
                {!detectedTiles && (
                  <ImageCapture onImageCapture={handleImageCapture} />
                )}
                
                {isProcessing && (
                  <div className="processing">
                    <div className="spinner"></div>
                    <p>Analyzing tiles...</p>
                  </div>
                )}
              </>
            ) : (
              <ManualTileSelector 
                onTilesSelected={handleManualTilesSelected}
                initialTiles={detectedTiles || []}
              />
            )}

            {detectedTiles && !isProcessing && (
              <>
                <TileDisplay tiles={detectedTiles} />
                {scoreResult && <ScoreBreakdown scoreResult={scoreResult} />}
                <div className="action-buttons">
                  <button className="btn btn-reset" onClick={resetApp}>
                    🔄 New Hand
                  </button>
                </div>
              </>
            )}
          </>
        )}

      </main>

      <footer className="app-footer">
        <p>Built with React + TensorFlow.js</p>
      </footer>
    </div>
  );
}

export default App;
