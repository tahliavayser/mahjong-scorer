import './TileDisplay.css';

const TileDisplay = ({ tiles, onTileChange }) => {
  if (!tiles || tiles.length === 0) {
    return (
      <div className="tile-display">
        <p className="no-tiles">No tiles detected yet</p>
      </div>
    );
  }

  const getTileDisplay = (tile) => {
    if (tile.type === 'dots') return `🔵 ${tile.value}`;
    if (tile.type === 'sticks') return `🎋 ${tile.value}`;
    if (tile.type === 'man') return `🀄 ${tile.value}`;
    if (tile.type === 'winds') {
      const windMap = { east: '東', south: '南', west: '西', north: '北' };
      return windMap[tile.value] || tile.value;
    }
    if (tile.type === 'dragons') {
      const dragonMap = { red: '中', green: '發', white: '白' };
      return dragonMap[tile.value] || tile.value;
    }
    if (tile.type === 'flowers') {
      const flowerMap = { plum: '梅', orchid: '蘭', mum: '菊', bamboo: '竹' };
      return flowerMap[tile.value] || tile.value;
    }
    if (tile.type === 'seasons') {
      const seasonMap = { spring: '春', summer: '夏', autumn: '秋', winter: '冬' };
      return seasonMap[tile.value] || tile.value;
    }
    return `${tile.type} ${tile.value}`;
  };

  return (
    <div className="tile-display">
      <h3>Detected Tiles ({tiles.length})</h3>
      <div className="tiles-grid">
        {tiles.map((tile, index) => (
          <div key={index} className="tile-card">
            <div className="tile-content">
              {getTileDisplay(tile)}
            </div>
            <div className="tile-info">
              {tile.type}
            </div>
          </div>
        ))}
      </div>
      {onTileChange && (
        <div className="tile-actions">
          <button className="btn btn-secondary" onClick={onTileChange}>
            ✏️ Edit Tiles
          </button>
        </div>
      )}
    </div>
  );
};

export default TileDisplay;

