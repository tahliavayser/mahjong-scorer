import { useState } from 'react';
import './TileDisplay.css';

const TileDisplay = ({ tiles, onTilesUpdate, onRecalculate }) => {
  const [editingIndex, setEditingIndex] = useState(null);

  if (!tiles || tiles.length === 0) {
    return (
      <div className="tile-display">
        <p className="no-tiles">No tiles detected yet</p>
      </div>
    );
  }

  const allTileOptions = [
    // Dots
    { type: 'dots', value: 1, label: '1 Dot', icon: '🀙' },
    { type: 'dots', value: 2, label: '2 Dot', icon: '🀚' },
    { type: 'dots', value: 3, label: '3 Dot', icon: '🀛' },
    { type: 'dots', value: 4, label: '4 Dot', icon: '🀜' },
    { type: 'dots', value: 5, label: '5 Dot', icon: '🀝' },
    { type: 'dots', value: 6, label: '6 Dot', icon: '🀞' },
    { type: 'dots', value: 7, label: '7 Dot', icon: '🀟' },
    { type: 'dots', value: 8, label: '8 Dot', icon: '🀠' },
    { type: 'dots', value: 9, label: '9 Dot', icon: '🀡' },
    // Bams
    { type: 'sticks', value: 1, label: '1 Bam', icon: '🀐' },
    { type: 'sticks', value: 2, label: '2 Bam', icon: '🀑' },
    { type: 'sticks', value: 3, label: '3 Bam', icon: '🀒' },
    { type: 'sticks', value: 4, label: '4 Bam', icon: '🀓' },
    { type: 'sticks', value: 5, label: '5 Bam', icon: '🀔' },
    { type: 'sticks', value: 6, label: '6 Bam', icon: '🀕' },
    { type: 'sticks', value: 7, label: '7 Bam', icon: '🀖' },
    { type: 'sticks', value: 8, label: '8 Bam', icon: '🀗' },
    { type: 'sticks', value: 9, label: '9 Bam', icon: '🀘' },
    // Craks
    { type: 'man', value: 1, label: '1 Crak', icon: '🀇' },
    { type: 'man', value: 2, label: '2 Crak', icon: '🀈' },
    { type: 'man', value: 3, label: '3 Crak', icon: '🀉' },
    { type: 'man', value: 4, label: '4 Crak', icon: '🀊' },
    { type: 'man', value: 5, label: '5 Crak', icon: '🀋' },
    { type: 'man', value: 6, label: '6 Crak', icon: '🀌' },
    { type: 'man', value: 7, label: '7 Crak', icon: '🀍' },
    { type: 'man', value: 8, label: '8 Crak', icon: '🀎' },
    { type: 'man', value: 9, label: '9 Crak', icon: '🀏' },
    // Winds
    { type: 'winds', value: 'east', label: 'East', icon: '🀀' },
    { type: 'winds', value: 'south', label: 'South', icon: '🀁' },
    { type: 'winds', value: 'west', label: 'West', icon: '🀂' },
    { type: 'winds', value: 'north', label: 'North', icon: '🀃' },
    // Dragons
    { type: 'dragons', value: 'red', label: 'Red Dragon', icon: '🀄' },
    { type: 'dragons', value: 'green', label: 'Green Dragon', icon: '🀅' },
    { type: 'dragons', value: 'white', label: 'White Dragon', icon: '🀆' },
  ];

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

  const handleTileClick = (index) => {
    setEditingIndex(editingIndex === index ? null : index);
  };

  const handleTileChange = (index, newTile) => {
    if (onTilesUpdate) {
      const newTiles = [...tiles];
      newTiles[index] = { ...newTile, concealed: true };
      onTilesUpdate(newTiles);
    }
    setEditingIndex(null);
  };

  const handleDeleteTile = (index) => {
    if (onTilesUpdate) {
      const newTiles = tiles.filter((_, i) => i !== index);
      onTilesUpdate(newTiles);
    }
    setEditingIndex(null);
  };

  const handleAddTile = (newTile) => {
    if (onTilesUpdate) {
      const newTiles = [...tiles, { ...newTile, concealed: true }];
      onTilesUpdate(newTiles);
    }
    setEditingIndex(null);
  };

  return (
    <div className="tile-display">
      <h3>Detected Tiles ({tiles.length})</h3>
      <p className="edit-hint">Click any tile to edit it</p>
      <div className="tiles-grid">
        {tiles.map((tile, index) => {
          const display = getTileDisplay(tile);
          const isEditing = editingIndex === index;
          
          return (
            <div key={index} className={`tile-card ${isEditing ? 'editing' : ''}`}>
              <div 
                className="tile-content clickable" 
                onClick={() => handleTileClick(index)}
                title="Click to edit"
              >
                {display.icon}
              </div>
              <div className="tile-info">
                {display.label}
              </div>
              
              {isEditing && (
                <div className="tile-edit-dropdown">
                  <div className="dropdown-header">
                    <span>Change to:</span>
                    <button 
                      className="delete-btn" 
                      onClick={() => handleDeleteTile(index)}
                      title="Remove tile"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="tile-options">
                    {allTileOptions.map((option, optIdx) => (
                      <button
                        key={optIdx}
                        className="tile-option"
                        onClick={() => handleTileChange(index, option)}
                        title={option.label}
                      >
                        <span className="option-icon">{option.icon}</span>
                        <span className="option-label">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        
        {/* Add tile button */}
        {tiles.length < 18 && (
          <div className="tile-card add-tile-card">
            <div 
              className="tile-content clickable add-tile" 
              onClick={() => setEditingIndex('add')}
              title="Add a tile"
            >
              +
            </div>
            <div className="tile-info">Add Tile</div>
            
            {editingIndex === 'add' && (
              <div className="tile-edit-dropdown">
                <div className="dropdown-header">
                  <span>Add tile:</span>
                  <button 
                    className="cancel-btn" 
                    onClick={() => setEditingIndex(null)}
                  >
                    Cancel
                  </button>
                </div>
                <div className="tile-options">
                  {allTileOptions.map((option, optIdx) => (
                    <button
                      key={optIdx}
                      className="tile-option"
                      onClick={() => handleAddTile(option)}
                      title={option.label}
                    >
                      <span className="option-icon">{option.icon}</span>
                      <span className="option-label">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {onRecalculate && (
        <div className="tile-actions">
          <button className="btn btn-primary" onClick={onRecalculate}>
            Calculate Score
          </button>
        </div>
      )}
    </div>
  );
};

export default TileDisplay;
