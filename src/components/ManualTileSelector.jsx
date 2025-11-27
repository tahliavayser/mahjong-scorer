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
      return windMap[tile.value];
    }
    // Dragons
    if (tile.type === 'dragons') {
      const dragonMap = { 
        red: '🀄 中', 
        green: '🀅 發', 
        white: '🀆 白' 
      };
      return dragonMap[tile.value];
    }
    // Flowers
    if (tile.type === 'flowers') {
      const flowerMap = { 
        plum: '🀢 梅', 
        orchid: '🀣 蘭', 
        mum: '🀤 菊', 
        bamboo: '🀥 竹' 
      };
      return flowerMap[tile.value];
    }
    // Seasons
    if (tile.type === 'seasons') {
      const seasonMap = { 
        spring: '🀦 春', 
        summer: '🀧 夏', 
        autumn: '🀨 秋', 
        winter: '🀩 冬' 
      };
      return seasonMap[tile.value];
    }
    return `${tile.value}`;
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
            selectedTiles.map((tile, index) => (
              <div key={index} className="selected-tile" onClick={() => removeTile(index)}>
                <span className="tile-display">{getTileDisplay(tile)}</span>
                <span className="remove-icon">×</span>
              </div>
            ))
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
                  {dotMap[value]}
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
                  {stickMap[value]}
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
                  {manMap[value]}
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
                east: '🀀 東', 
                south: '🀁 南', 
                west: '🀂 西', 
                north: '🀃 北' 
              };
              return (
                <button key={value} onClick={() => addTile('winds', value)} className="tile-btn">
                  {windMap[value]}
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
                red: '🀄 中', 
                green: '🀅 發', 
                white: '🀆 白' 
              };
              return (
                <button key={value} onClick={() => addTile('dragons', value)} className="tile-btn">
                  {dragonMap[value]}
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
                plum: '🀢 梅', 
                orchid: '🀣 蘭', 
                mum: '🀤 菊', 
                bamboo: '🀥 竹' 
              };
              return (
                <button key={value} onClick={() => addTile('flowers', value)} className="tile-btn">
                  {flowerMap[value]}
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
                spring: '🀦 春', 
                summer: '🀧 夏', 
                autumn: '🀨 秋', 
                winter: '🀩 冬' 
              };
              return (
                <button key={value} onClick={() => addTile('seasons', value)} className="tile-btn">
                  {seasonMap[value]}
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

