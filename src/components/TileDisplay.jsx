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
    // Dots (DOTS) - circles
    if (tile.type === 'dots') {
      const dotMap = {
        1: '🀙', 2: '🀚', 3: '🀛', 4: '🀜', 5: '🀝', 6: '🀞', 7: '🀟', 8: '🀠', 9: '🀡'
      };
      return dotMap[tile.value] || `○ ${tile.value}`;
    }
    // Sticks (BAMS) - bamboo
    if (tile.type === 'sticks') {
      const stickMap = {
        1: '🀐', 2: '🀑', 3: '🀒', 4: '🀓', 5: '🀔', 6: '🀕', 7: '🀖', 8: '🀗', 9: '🀘'
      };
      return stickMap[tile.value] || `🎋 ${tile.value}`;
    }
    // Man (CRAKS) - characters/萬
    if (tile.type === 'man') {
      const manMap = {
        1: '🀇', 2: '🀈', 3: '🀉', 4: '🀊', 5: '🀋', 6: '🀌', 7: '🀍', 8: '🀎', 9: '🀏'
      };
      return manMap[tile.value] || `萬 ${tile.value}`;
    }
    // Winds
    if (tile.type === 'winds') {
      const windMap = { 
        east: '🀀 東', 
        south: '🀁 南', 
        west: '🀂 西', 
        north: '🀃 北' 
      };
      return windMap[tile.value] || tile.value;
    }
    // Dragons
    if (tile.type === 'dragons') {
      const dragonMap = { 
        red: '🀄 中', 
        green: '🀅 發', 
        white: '🀆 白' 
      };
      return dragonMap[tile.value] || tile.value;
    }
    // Flowers
    if (tile.type === 'flowers') {
      const flowerMap = { 
        plum: '🀢 梅', 
        orchid: '🀣 蘭', 
        mum: '🀤 菊', 
        bamboo: '🀥 竹' 
      };
      return flowerMap[tile.value] || tile.value;
    }
    // Seasons
    if (tile.type === 'seasons') {
      const seasonMap = { 
        spring: '🀦 春', 
        summer: '🀧 夏', 
        autumn: '🀨 秋', 
        winter: '🀩 冬' 
      };
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

