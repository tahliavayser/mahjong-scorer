import { useState } from 'react';
import './ManualTileSelector.css';

const ManualTileSelector = ({ onTilesSelected, initialTiles = [] }) => {
  const [selectedTiles, setSelectedTiles] = useState(initialTiles);

  const tileOptions = {
    dots: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    sticks: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    man: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    winds: ['east', 'south', 'west', 'north'],
    dragons: ['red', 'green', 'white'],
    flowers: ['plum', 'orchid', 'mum', 'bamboo'],
    seasons: ['spring', 'summer', 'autumn', 'winter']
  };

  const addTile = (type, value) => {
    if (selectedTiles.length >= 22) { // Max 14 regular + 8 bonus
      alert('Maximum tiles reached (14 regular + 8 bonus)');
      return;
    }
    
    const newTile = { type, value, concealed: true };
    setSelectedTiles([...selectedTiles, newTile]);
  };

  const removeTile = (index) => {
    setSelectedTiles(selectedTiles.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setSelectedTiles([]);
  };

  const handleSubmit = () => {
    if (selectedTiles.length < 13) {
      alert('Need at least 13 tiles for a valid hand');
      return;
    }
    onTilesSelected(selectedTiles);
  };

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
        red: { icon: '🀄', label: 'Red Dragon' },
        green: { icon: '🀅', label: 'Green Dragon' },
        white: { icon: '🀆', label: 'White Dragon' }
      };
      return dragonMap[tile.value] || { icon: '🀄', label: tile.value };
    }
    // Flowers
    if (tile.type === 'flowers') {
      const flowerMap = { 
        plum: { icon: '🀢', label: '1 Plum' },
        orchid: { icon: '🀣', label: '2 Orchid' },
        mum: { icon: '🀤', label: '3 Mum' },
        bamboo: { icon: '🀥', label: '4 Bamboo' }
      };
      return flowerMap[tile.value] || { icon: '🀢', label: tile.value };
    }
    // Seasons
    if (tile.type === 'seasons') {
      const seasonMap = { 
        spring: { icon: '🀦', label: '1 Spring' },
        summer: { icon: '🀧', label: '2 Summer' },
        autumn: { icon: '🀨', label: '3 Autumn' },
        winter: { icon: '🀩', label: '4 Winter' }
      };
      return seasonMap[tile.value] || { icon: '🀦', label: tile.value };
    }
    return { icon: tile.value, label: tile.type };
  };

  return (
    <div className="manual-tile-selector">
      <h2>Manual Tile Selection</h2>
      
      <div className="selected-tiles-section">
        <h3>Selected Tiles ({selectedTiles.length})</h3>
        <div className="selected-tiles">
          {selectedTiles.length === 0 ? (
            <p className="no-tiles">No tiles selected yet</p>
          ) : (
            selectedTiles.map((tile, index) => {
              const display = getTileDisplay(tile);
              return (
                <div key={index} className="selected-tile" onClick={() => removeTile(index)}>
                  <span className="tile-display">
                    <span className="selected-icon">{display.icon}</span>
                    <span className="selected-label">{display.label}</span>
                  </span>
                  <span className="remove-icon">×</span>
                </div>
              );
            })
          )}
        </div>
        <div className="tile-actions">
          <button className="btn btn-clear" onClick={clearAll} disabled={selectedTiles.length === 0}>
            Clear All
          </button>
          <button 
            className="btn btn-submit" 
            onClick={handleSubmit}
            disabled={selectedTiles.length < 13}
          >
            Calculate Score
          </button>
        </div>
      </div>

      <div className="tile-picker">
        <div className="tile-category">
          <h4>Dots (筒子)</h4>
          <div className="tile-buttons">
            {tileOptions.dots.map(value => {
              const dotMap = {
                1: '🀙', 2: '🀚', 3: '🀛', 4: '🀜', 5: '🀝', 6: '🀞', 7: '🀟', 8: '🀠', 9: '🀡'
              };
              return (
                <button key={value} onClick={() => addTile('dots', value)} className="tile-btn">
                  <div className="tile-content">
                    <span className="tile-icon">{dotMap[value]}</span>
                    <span className="tile-label">{value}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="tile-category">
          <h4>Bams (索子)</h4>
          <div className="tile-buttons">
            {tileOptions.sticks.map(value => {
              const stickMap = {
                1: '🀐', 2: '🀑', 3: '🀒', 4: '🀓', 5: '🀔', 6: '🀕', 7: '🀖', 8: '🀗', 9: '🀘'
              };
              return (
                <button key={value} onClick={() => addTile('sticks', value)} className="tile-btn">
                  <div className="tile-content">
                    <span className="tile-icon">{stickMap[value]}</span>
                    <span className="tile-label">{value}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="tile-category">
          <h4>Craks (萬子)</h4>
          <div className="tile-buttons">
            {tileOptions.man.map(value => {
              const manMap = {
                1: '🀇', 2: '🀈', 3: '🀉', 4: '🀊', 5: '🀋', 6: '🀌', 7: '🀍', 8: '🀎', 9: '🀏'
              };
              return (
                <button key={value} onClick={() => addTile('man', value)} className="tile-btn">
                  <div className="tile-content">
                    <span className="tile-icon">{manMap[value]}</span>
                    <span className="tile-label">{value}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="tile-category">
          <h4>Winds (風牌)</h4>
          <div className="tile-buttons">
            {tileOptions.winds.map(value => {
              const windMap = { 
                east: { icon: '🀀', label: 'East' },
                south: { icon: '🀁', label: 'South' },
                west: { icon: '🀂', label: 'West' },
                north: { icon: '🀃', label: 'North' }
              };
              return (
                <button key={value} onClick={() => addTile('winds', value)} className="tile-btn">
                  <div className="tile-content">
                    <span className="tile-icon">{windMap[value].icon}</span>
                    <span className="tile-label">{windMap[value].label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="tile-category">
          <h4>Dragons (三元牌)</h4>
          <div className="tile-buttons">
            {tileOptions.dragons.map(value => {
              const dragonMap = { 
                red: { icon: '🀄', label: 'Red' },
                green: { icon: '🀅', label: 'Green' },
                white: { icon: '🀆', label: 'White' }
              };
              return (
                <button key={value} onClick={() => addTile('dragons', value)} className="tile-btn">
                  <div className="tile-content">
                    <span className="tile-icon">{dragonMap[value].icon}</span>
                    <span className="tile-label">{dragonMap[value].label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="tile-category">
          <h4>Flowers (花牌)</h4>
          <div className="tile-buttons">
            {tileOptions.flowers.map(value => {
              const flowerMap = { 
                plum: { icon: '🀢', label: '1 Plum' },
                orchid: { icon: '🀣', label: '2 Orchid' },
                mum: { icon: '🀤', label: '3 Mum' },
                bamboo: { icon: '🀥', label: '4 Bamboo' }
              };
              return (
                <button key={value} onClick={() => addTile('flowers', value)} className="tile-btn">
                  <div className="tile-content">
                    <span className="tile-icon">{flowerMap[value].icon}</span>
                    <span className="tile-label">{flowerMap[value].label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="tile-category">
          <h4>Seasons (季牌)</h4>
          <div className="tile-buttons">
            {tileOptions.seasons.map(value => {
              const seasonMap = { 
                spring: { icon: '🀦', label: '1 Spring' },
                summer: { icon: '🀧', label: '2 Summer' },
                autumn: { icon: '🀨', label: '3 Autumn' },
                winter: { icon: '🀩', label: '4 Winter' }
              };
              return (
                <button key={value} onClick={() => addTile('seasons', value)} className="tile-btn">
                  <div className="tile-content">
                    <span className="tile-icon">{seasonMap[value].icon}</span>
                    <span className="tile-label">{seasonMap[value].label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualTileSelector;

