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
      return { icon: dotMap[tile.value] || '○', label: `${tile.value} Dot` };
    }
    // Sticks (BAMS) - bamboo
    if (tile.type === 'sticks') {
      const stickMap = {
        1: '🀐', 2: '🀑', 3: '🀒', 4: '🀓', 5: '🀔', 6: '🀕', 7: '🀖', 8: '🀗', 9: '🀘'
      };
      return { icon: stickMap[tile.value] || '🎋', label: `${tile.value} Bam` };
    }
    // Man (CRAKS) - characters/萬
    if (tile.type === 'man') {
      const manMap = {
        1: '🀇', 2: '🀈', 3: '🀉', 4: '🀊', 5: '🀋', 6: '🀌', 7: '🀍', 8: '🀎', 9: '🀏'
      };
      return { icon: manMap[tile.value] || '萬', label: `${tile.value} Crak` };
    }
    // Winds
    if (tile.type === 'winds') {
      const windMap = { 
        east: { icon: '🀀', label: 'East' },
        south: { icon: '🀁', label: 'South' },
        west: { icon: '🀂', label: 'West' },
        north: { icon: '🀃', label: 'North' }
      };
      return windMap[tile.value] || { icon: '🀀', label: tile.value };
    }
    // Dragons
    if (tile.type === 'dragons') {
      const dragonMap = { 
        red: { icon: '🀄', label: 'Red' },
        green: { icon: '🀅', label: 'Green' },
        white: { icon: '🀆', label: 'White' }
      };
      return dragonMap[tile.value] || { icon: '🀄', label: tile.value };
    }
    // Flowers
    if (tile.type === 'flowers') {
      const flowerMap = { 
        plum: { icon: '🀢', label: 'Plum' },
        orchid: { icon: '🀣', label: 'Orchid' },
        mum: { icon: '🀤', label: 'Mum' },
        bamboo: { icon: '🀥', label: 'Bamboo' }
      };
      return flowerMap[tile.value] || { icon: '🀢', label: tile.value };
    }
    // Seasons
    if (tile.type === 'seasons') {
      const seasonMap = { 
        spring: { icon: '🀦', label: 'Spring' },
        summer: { icon: '🀧', label: 'Summer' },
        autumn: { icon: '🀨', label: 'Autumn' },
        winter: { icon: '🀩', label: 'Winter' }
      };
      return seasonMap[tile.value] || { icon: '🀦', label: tile.value };
    }
    return { icon: tile.value, label: tile.type };
  };

  return (
    <div className="tile-display">
      <h3>Detected Tiles ({tiles.length})</h3>
      <div className="tiles-grid">
        {tiles.map((tile, index) => {
          const display = getTileDisplay(tile);
          return (
            <div key={index} className="tile-card">
              <div className="tile-content">
                {display.icon}
              </div>
              <div className="tile-info">
                {display.label}
              </div>
            </div>
          );
        })}
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

