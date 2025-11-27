// Validates mahjong hands and identifies sets

export const SET_TYPES = {
  SEQUENCE: 'sequence',
  TRIPLET: 'triplet',
  QUADRUPLET: 'quadruplet',
  PAIR: 'pair'
};

/**
 * Represents a tile in the hand
 * @typedef {Object} Tile
 * @property {string} type - Type of tile (dots, sticks, man, winds, dragons, flowers, seasons)
 * @property {number|string} value - Value (1-9 for suited, wind/dragon name for honours)
 * @property {boolean} concealed - Whether the tile is concealed
 */

/**
 * Represents a set (meld) in the hand
 * @typedef {Object} Set
 * @property {string} type - Type of set (sequence, triplet, quadruplet, pair)
 * @property {Tile[]} tiles - Tiles in the set
 * @property {boolean} concealed - Whether the set is concealed
 */

/**
 * Check if tiles form a sequence (3 consecutive suited tiles)
 */
export const isSequence = (tiles) => {
  if (tiles.length !== 3) return false;
  
  const suitedTypes = ['dots', 'sticks', 'man'];
  const type = tiles[0].type;
  
  if (!suitedTypes.includes(type)) return false;
  if (!tiles.every(t => t.type === type)) return false;
  
  const values = tiles.map(t => t.value).sort((a, b) => a - b);
  return values[1] === values[0] + 1 && values[2] === values[1] + 1;
};

/**
 * Check if tiles form a triplet (3 identical tiles)
 */
export const isTriplet = (tiles) => {
  if (tiles.length !== 3) return false;
  return tiles.every(t => t.type === tiles[0].type && t.value === tiles[0].value);
};

/**
 * Check if tiles form a quadruplet (4 identical tiles)
 */
export const isQuadruplet = (tiles) => {
  if (tiles.length !== 4) return false;
  return tiles.every(t => t.type === tiles[0].type && t.value === tiles[0].value);
};

/**
 * Check if tiles form a pair (2 identical tiles)
 */
export const isPair = (tiles) => {
  if (tiles.length !== 2) return false;
  return tiles[0].type === tiles[1].type && tiles[0].value === tiles[1].value;
};

/**
 * Check if a tile is a terminal (1 or 9 of a suit)
 */
export const isTerminal = (tile) => {
  const suitedTypes = ['dots', 'sticks', 'man'];
  return suitedTypes.includes(tile.type) && (tile.value === 1 || tile.value === 9);
};

/**
 * Check if a tile is an honour (wind or dragon)
 */
export const isHonour = (tile) => {
  return tile.type === 'winds' || tile.type === 'dragons';
};

/**
 * Check if a tile is a flower or season
 */
export const isBonus = (tile) => {
  return tile.type === 'flowers' || tile.type === 'seasons';
};

/**
 * Parse a hand into sets and validate it's a winning hand
 * Returns null if not a valid winning hand, otherwise returns the parsed structure
 */
export const parseHand = (tiles) => {
  // Separate bonus tiles (flowers/seasons) from regular tiles
  const bonusTiles = tiles.filter(isBonus);
  const regularTiles = tiles.filter(t => !isBonus(t));
  
  // A winning hand should have 14 regular tiles (or 13 + 1 winning tile)
  if (regularTiles.length !== 14 && regularTiles.length !== 13) {
    return null;
  }
  
  // Try to find a valid winning combination
  const result = findWinningCombination(regularTiles);
  
  if (result) {
    return {
      sets: result.sets,
      pair: result.pair,
      bonusTiles: bonusTiles,
      allConcealed: regularTiles.every(t => t.concealed)
    };
  }
  
  return null;
};

/**
 * Recursively find a valid winning combination
 * A winning hand consists of 4 sets + 1 pair (or special hands)
 */
const findWinningCombination = (tiles) => {
  // Try standard 4 sets + 1 pair pattern
  const standard = tryStandardPattern(tiles);
  if (standard) return standard;
  
  // Try seven pairs
  const sevenPairs = trySevenPairs(tiles);
  if (sevenPairs) return sevenPairs;
  
  // Try thirteen orphans
  const thirteenOrphans = tryThirteenOrphans(tiles);
  if (thirteenOrphans) return thirteenOrphans;
  
  return null;
};

/**
 * Try to match standard 4 sets + 1 pair pattern
 */
const tryStandardPattern = (tiles) => {
  if (tiles.length !== 14) return null;
  
  // Try each tile as the pair
  for (let i = 0; i < tiles.length - 1; i++) {
    for (let j = i + 1; j < tiles.length; j++) {
      if (tiles[i].type === tiles[j].type && tiles[i].value === tiles[j].value) {
        // Found a potential pair
        const pair = [tiles[i], tiles[j]];
        const remaining = tiles.filter((_, idx) => idx !== i && idx !== j);
        
        // Try to form 4 sets from remaining tiles
        const sets = trySetsRecursive(remaining, []);
        if (sets && sets.length === 4) {
          return { sets, pair };
        }
      }
    }
  }
  
  return null;
};

/**
 * Recursively try to form sets from tiles
 */
const trySetsRecursive = (tiles, currentSets) => {
  if (tiles.length === 0) {
    return currentSets;
  }
  
  if (tiles.length < 3) {
    return null;
  }
  
  // Try to form a sequence
  const sequence = tryFormSequence(tiles);
  if (sequence) {
    const remaining = removeUsedTiles(tiles, sequence);
    const result = trySetsRecursive(remaining, [...currentSets, { type: SET_TYPES.SEQUENCE, tiles: sequence }]);
    if (result) return result;
  }
  
  // Try to form a triplet
  const triplet = tryFormTriplet(tiles);
  if (triplet) {
    const remaining = removeUsedTiles(tiles, triplet);
    const result = trySetsRecursive(remaining, [...currentSets, { type: SET_TYPES.TRIPLET, tiles: triplet }]);
    if (result) return result;
  }
  
  // Try to form a quadruplet
  const quadruplet = tryFormQuadruplet(tiles);
  if (quadruplet) {
    const remaining = removeUsedTiles(tiles, quadruplet);
    const result = trySetsRecursive(remaining, [...currentSets, { type: SET_TYPES.QUADRUPLET, tiles: quadruplet }]);
    if (result) return result;
  }
  
  return null;
};

/**
 * Try to form a sequence starting with the first tile
 */
const tryFormSequence = (tiles) => {
  const suitedTypes = ['dots', 'sticks', 'man'];
  const first = tiles[0];
  
  if (!suitedTypes.includes(first.type) || first.value > 7) {
    return null;
  }
  
  const second = tiles.find(t => t.type === first.type && t.value === first.value + 1);
  if (!second) return null;
  
  const third = tiles.find(t => t.type === first.type && t.value === first.value + 2);
  if (!third) return null;
  
  return [first, second, third];
};

/**
 * Try to form a triplet starting with the first tile
 */
const tryFormTriplet = (tiles) => {
  const first = tiles[0];
  const matches = tiles.filter(t => t.type === first.type && t.value === first.value);
  
  if (matches.length >= 3) {
    return matches.slice(0, 3);
  }
  
  return null;
};

/**
 * Try to form a quadruplet starting with the first tile
 */
const tryFormQuadruplet = (tiles) => {
  const first = tiles[0];
  const matches = tiles.filter(t => t.type === first.type && t.value === first.value);
  
  if (matches.length >= 4) {
    return matches.slice(0, 4);
  }
  
  return null;
};

/**
 * Remove used tiles from the tile array
 */
const removeUsedTiles = (tiles, usedTiles) => {
  const result = [...tiles];
  for (const used of usedTiles) {
    const index = result.findIndex(t => t === used);
    if (index !== -1) {
      result.splice(index, 1);
    }
  }
  return result;
};

/**
 * Try seven pairs pattern
 */
const trySevenPairs = (tiles) => {
  if (tiles.length !== 14) return null;
  
  const sorted = [...tiles].sort((a, b) => {
    if (a.type !== b.type) return a.type.localeCompare(b.type);
    return String(a.value).localeCompare(String(b.value));
  });
  
  const pairs = [];
  for (let i = 0; i < sorted.length - 1; i += 2) {
    if (sorted[i].type === sorted[i + 1].type && sorted[i].value === sorted[i + 1].value) {
      pairs.push([sorted[i], sorted[i + 1]]);
    } else {
      return null;
    }
  }
  
  if (pairs.length === 7) {
    return { sets: [], pair: null, sevenPairs: pairs };
  }
  
  return null;
};

/**
 * Try thirteen orphans pattern
 * One of each: 1/9 dots, 1/9 sticks, 1/9 man, all winds, all dragons + one duplicate
 */
const tryThirteenOrphans = (tiles) => {
  if (tiles.length !== 14) return null;
  
  const required = [
    { type: 'dots', value: 1 },
    { type: 'dots', value: 9 },
    { type: 'sticks', value: 1 },
    { type: 'sticks', value: 9 },
    { type: 'man', value: 1 },
    { type: 'man', value: 9 },
    { type: 'winds', value: 'east' },
    { type: 'winds', value: 'south' },
    { type: 'winds', value: 'west' },
    { type: 'winds', value: 'north' },
    { type: 'dragons', value: 'red' },
    { type: 'dragons', value: 'green' },
    { type: 'dragons', value: 'white' }
  ];
  
  const tileCopy = [...tiles];
  const found = [];
  
  for (const req of required) {
    const index = tileCopy.findIndex(t => t.type === req.type && t.value === req.value);
    if (index === -1) return null;
    found.push(tileCopy[index]);
    tileCopy.splice(index, 1);
  }
  
  // Should have exactly one tile left, which must match one of the required
  if (tileCopy.length !== 1) return null;
  
  const duplicate = tileCopy[0];
  const hasDuplicate = required.some(req => req.type === duplicate.type && req.value === duplicate.value);
  
  if (hasDuplicate) {
    return { sets: [], pair: null, thirteenOrphans: [...found, duplicate] };
  }
  
  return null;
};

