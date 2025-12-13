// Hong Kong Mahjong Scoring Engine
import { SCORING_PATTERNS, getPayment, MINIMUM_FAN } from '../data/scoringRules.js';
import { isTerminal, isHonour, SET_TYPES } from './handValidator.js';

/**
 * Calculate the score for a mahjong hand
 * @param {Object} handData - Parsed hand data from handValidator
 * @param {Object} gameContext - Game context (seatWind, roundWind, winType, etc.)
 * @returns {Object} Score breakdown with total fan and matched patterns
 */
export const calculateScore = (handData, gameContext = {}) => {
  const matchedPatterns = [];
  let totalFan = 0;
  
  if (!handData) {
    return {
      totalFan: 0,
      matchedPatterns: [],
      payment: 0,
      meetsMinimum: false,
      error: 'Invalid hand'
    };
  }
  
  // Check for special hands first (these override other scoring)
  const specialHand = checkSpecialHands(handData, gameContext);
  if (specialHand) {
    return {
      totalFan: specialHand.fan,
      matchedPatterns: [specialHand],
      payment: getPayment(specialHand.fan),
      meetsMinimum: specialHand.fan >= MINIMUM_FAN,
      isSpecialHand: true
    };
  }
  
  // Check win actions
  const winActions = checkWinActions(handData, gameContext);
  matchedPatterns.push(...winActions);
  totalFan += winActions.reduce((sum, p) => sum + p.fan, 0);
  
  // Check single set type hands
  const singleSetType = checkSingleSetType(handData);
  if (singleSetType) {
    matchedPatterns.push(singleSetType);
    totalFan += singleSetType.fan;
  }
  
  // Check special tile hands
  const specialTileHands = checkSpecialTileHands(handData, gameContext);
  matchedPatterns.push(...specialTileHands);
  totalFan += specialTileHands.reduce((sum, p) => sum + p.fan, 0);
  
  // Check flowers and seasons
  const flowersSeasons = checkFlowersAndSeasons(handData, gameContext);
  matchedPatterns.push(...flowersSeasons);
  totalFan += flowersSeasons.reduce((sum, p) => sum + p.fan, 0);
  
  return {
    totalFan,
    matchedPatterns,
    payment: getPayment(totalFan),
    meetsMinimum: totalFan >= MINIMUM_FAN
  };
};

/**
 * Check for special hands (13 Fan hands and Seven Pairs)
 */
const checkSpecialHands = (handData, gameContext) => {
  const { sets, pair, sevenPairs, thirteenOrphans, bonusTiles } = handData;
  
  // Thirteen Orphans
  if (thirteenOrphans) {
    return { ...SCORING_PATTERNS.SPECIAL_HANDS.THIRTEEN_ORPHANS };
  }
  
  // Seven Pairs
  if (sevenPairs) {
    return { ...SCORING_PATTERNS.SPECIAL_HANDS.SEVEN_PAIRS };
  }
  
  // Blessing of Heaven (dealer wins on initial hand)
  if (gameContext.winType === 'heaven' && gameContext.isDealer) {
    return { ...SCORING_PATTERNS.SPECIAL_HANDS.BLESSING_OF_HEAVEN };
  }
  
  // Blessing of Earth (non-dealer wins on dealer's first discard)
  if (gameContext.winType === 'earth' && !gameContext.isDealer) {
    return { ...SCORING_PATTERNS.SPECIAL_HANDS.BLESSING_OF_EARTH };
  }
  
  // Blessing of Man (non-dealer wins on first self-pick)
  if (gameContext.winType === 'man' && !gameContext.isDealer) {
    return { ...SCORING_PATTERNS.SPECIAL_HANDS.BLESSING_OF_MAN };
  }
  
  // Nine Gates (1112345678999 + one more of same suit)
  if (isNineGates(handData)) {
    return { ...SCORING_PATTERNS.SPECIAL_HANDS.NINE_GATES };
  }
  
  // Eight Flowers (all 4 flowers + all 4 seasons)
  // Check both gameContext (image mode) and handData.bonusTiles (manual mode)
  let totalBonusTiles = (gameContext.flowers?.length || 0) + (gameContext.seasons?.length || 0);
  if (totalBonusTiles === 0 && bonusTiles) {
    totalBonusTiles = bonusTiles.length;
  }
  if (totalBonusTiles === 8) {
    return { 
      name: 'Eight Flowers',
      nameZh: '大花糊',
      fan: 8,
      description: 'Collected all 8 bonus tiles (4 flowers + 4 seasons)'
    };
  }
  
  // Seven Flowers
  if (totalBonusTiles === 7) {
    return { 
      name: 'Seven Flowers',
      nameZh: '花糊',
      fan: 3,
      description: 'Collected 7 bonus tiles'
    };
  }
  
  return null;
};

/**
 * Check if hand is Nine Gates pattern
 */
const isNineGates = (handData) => {
  const { sets, pair } = handData;
  if (!sets || !pair) return false;
  
  // Collect all tiles
  const allTiles = [];
  sets.forEach(set => allTiles.push(...set.tiles));
  allTiles.push(...pair);
  
  // Must be all one suit
  const suitedTypes = ['dots', 'sticks', 'man'];
  const suit = allTiles[0].type;
  if (!suitedTypes.includes(suit)) return false;
  if (!allTiles.every(t => t.type === suit)) return false;
  
  // Count each value
  const counts = {};
  for (let i = 1; i <= 9; i++) counts[i] = 0;
  allTiles.forEach(t => counts[t.value]++);
  
  // Check for 1112345678999 pattern (with one extra)
  if (counts[1] >= 3 && counts[9] >= 3 &&
      counts[2] >= 1 && counts[3] >= 1 && counts[4] >= 1 &&
      counts[5] >= 1 && counts[6] >= 1 && counts[7] >= 1 && counts[8] >= 1) {
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    return total === 14;
  }
  
  return false;
};

/**
 * Check win actions
 */
const checkWinActions = (handData, gameContext) => {
  const patterns = [];
  
  // Self-Pick
  if (gameContext.winType === 'selfPick') {
    patterns.push({ ...SCORING_PATTERNS.WIN_ACTIONS.SELF_PICK });
  }
  
  // Win by Kong Replacement
  if (gameContext.winType === 'kongReplacement') {
    patterns.push({ ...SCORING_PATTERNS.WIN_ACTIONS.WIN_BY_KONG_REPLACEMENT });
  }
  
  // Double Kong Replacement
  if (gameContext.winType === 'doubleKongReplacement') {
    patterns.push({ ...SCORING_PATTERNS.WIN_ACTIONS.DOUBLE_KONG_REPLACEMENT });
  }
  
  // Concealed Hand - only if fully concealed (no Pong/Chow/Kong from discards) and won from discard
  if (gameContext.fullyConcealedHand && gameContext.winType === 'discard') {
    patterns.push({ ...SCORING_PATTERNS.WIN_ACTIONS.CONCEALED_HAND });
  }
  
  // Robbing the Kong
  if (gameContext.winType === 'robbingKong') {
    patterns.push({ ...SCORING_PATTERNS.WIN_ACTIONS.ROBBING_THE_KONG });
  }
  
  // Moon Under The Sea
  if (gameContext.winType === 'moonUnderSea') {
    patterns.push({ ...SCORING_PATTERNS.WIN_ACTIONS.MOON_UNDER_THE_SEA });
  }
  
  return patterns;
};

/**
 * Check single set type hands
 */
const checkSingleSetType = (handData) => {
  const { sets } = handData;
  if (!sets || sets.length === 0) return null;
  
  // All Quadruplets
  if (sets.length === 4 && sets.every(s => s.type === SET_TYPES.QUADRUPLET)) {
    return { ...SCORING_PATTERNS.SINGLE_SET_TYPE.ALL_QUADRUPLETS };
  }
  
  // All Concealed Triplets - requires fully concealed hand
  const allTriplets = sets.every(s => s.type === SET_TYPES.TRIPLET);
  if (allTriplets && sets.length === 4) {
    return { ...SCORING_PATTERNS.SINGLE_SET_TYPE.ALL_CONCEALED_TRIPLETS };
  }
  
  // All Triplets
  if (allTriplets) {
    return { ...SCORING_PATTERNS.SINGLE_SET_TYPE.ALL_TRIPLETS };
  }
  
  // All Sequences
  if (sets.every(s => s.type === SET_TYPES.SEQUENCE)) {
    return { ...SCORING_PATTERNS.SINGLE_SET_TYPE.ALL_SEQUENCES };
  }
  
  return null;
};

/**
 * Check special tile hands
 */
const checkSpecialTileHands = (handData, gameContext) => {
  const patterns = [];
  const { sets, pair } = handData;
  if (!sets) return patterns;
  
  // Collect all tiles
  const allTiles = [];
  sets.forEach(set => allTiles.push(...set.tiles));
  if (pair) allTiles.push(...pair);
  
  // Count dragons
  const dragonTriplets = sets.filter(s => 
    (s.type === SET_TYPES.TRIPLET || s.type === SET_TYPES.QUADRUPLET) &&
    s.tiles[0].type === 'dragons'
  );
  
  const dragonPair = pair && pair[0].type === 'dragons';
  
  // Big Three Dragons
  if (dragonTriplets.length === 3) {
    patterns.push({ ...SCORING_PATTERNS.SPECIAL_TILE_HANDS.BIG_THREE_DRAGONS });
  }
  // Small Three Dragons
  else if (dragonTriplets.length === 2 && dragonPair) {
    patterns.push({ ...SCORING_PATTERNS.SPECIAL_TILE_HANDS.SMALL_THREE_DRAGONS });
  }
  // Individual Dragon triplets
  else if (dragonTriplets.length > 0) {
    dragonTriplets.forEach(() => {
      patterns.push({ ...SCORING_PATTERNS.SPECIAL_TILE_HANDS.DRAGON });
    });
  }
  
  // Count winds
  const windTriplets = sets.filter(s => 
    (s.type === SET_TYPES.TRIPLET || s.type === SET_TYPES.QUADRUPLET) &&
    s.tiles[0].type === 'winds'
  );
  
  const windPair = pair && pair[0].type === 'winds';
  
  // Big Four Winds
  if (windTriplets.length === 4) {
    patterns.push({ ...SCORING_PATTERNS.SPECIAL_TILE_HANDS.BIG_FOUR_WINDS });
  }
  // Small Four Winds
  else if (windTriplets.length === 3 && windPair) {
    patterns.push({ ...SCORING_PATTERNS.SPECIAL_TILE_HANDS.SMALL_FOUR_WINDS });
  }
  // Round Wind / Seat Wind
  else if (windTriplets.length > 0 && gameContext.seatWind && gameContext.roundWind) {
    windTriplets.forEach(set => {
      const windValue = set.tiles[0].value;
      if (windValue === gameContext.roundWind && windValue === gameContext.seatWind) {
        // Both round and seat wind - count twice
        patterns.push({ ...SCORING_PATTERNS.SPECIAL_TILE_HANDS.ROUND_WIND });
        patterns.push({ ...SCORING_PATTERNS.SPECIAL_TILE_HANDS.SEAT_WIND });
      } else if (windValue === gameContext.roundWind) {
        patterns.push({ ...SCORING_PATTERNS.SPECIAL_TILE_HANDS.ROUND_WIND });
      } else if (windValue === gameContext.seatWind) {
        patterns.push({ ...SCORING_PATTERNS.SPECIAL_TILE_HANDS.SEAT_WIND });
      }
    });
  }
  
  // Check suit patterns
  const suitedTypes = ['dots', 'sticks', 'man'];
  const suitCounts = {};
  suitedTypes.forEach(suit => {
    suitCounts[suit] = allTiles.filter(t => t.type === suit).length;
  });
  const honourCount = allTiles.filter(t => isHonour(t)).length;
  
  // All Honours
  if (honourCount === allTiles.length) {
    patterns.push({ ...SCORING_PATTERNS.SPECIAL_TILE_HANDS.ALL_HONOURS });
  }
  // Full Flush (one suit only, no honours)
  else if (Object.values(suitCounts).filter(c => c > 0).length === 1 && honourCount === 0) {
    patterns.push({ ...SCORING_PATTERNS.SPECIAL_TILE_HANDS.FULL_FLUSH });
  }
  // Mixed Flush (one suit + honours)
  else if (Object.values(suitCounts).filter(c => c > 0).length === 1 && honourCount > 0) {
    patterns.push({ ...SCORING_PATTERNS.SPECIAL_TILE_HANDS.MIXED_FLUSH });
  }
  
  // Check terminal patterns
  const allTerminalsOrHonours = allTiles.every(t => isTerminal(t) || isHonour(t));
  const allTerminalsOnly = allTiles.every(t => isTerminal(t));
  
  // All Terminals
  if (allTerminalsOnly) {
    patterns.push({ ...SCORING_PATTERNS.SPECIAL_TILE_HANDS.ALL_TERMINALS });
  }
  // Mixed Terminals
  else if (allTerminalsOrHonours && honourCount > 0) {
    patterns.push({ ...SCORING_PATTERNS.SPECIAL_TILE_HANDS.MIXED_TERMINALS });
  }
  
  return patterns;
};

/**
 * Check flowers and seasons scoring
 * Uses gameContext.flowers and gameContext.seasons (arrays of values 1-4) for image mode
 * Or extracts from handData.bonusTiles for manual mode
 */
const checkFlowersAndSeasons = (handData, gameContext) => {
  const patterns = [];
  
  // Get flowers and seasons - either from gameContext (image mode) or handData (manual mode)
  let flowers = gameContext.flowers || [];
  let seasons = gameContext.seasons || [];
  
  // If no flowers/seasons in context, check handData.bonusTiles (manual selection mode)
  if (flowers.length === 0 && seasons.length === 0 && handData.bonusTiles && handData.bonusTiles.length > 0) {
    flowers = handData.bonusTiles.filter(t => t.type === 'flowers').map(t => t.value);
    seasons = handData.bonusTiles.filter(t => t.type === 'seasons').map(t => t.value);
  }
  
  const totalBonus = flowers.length + seasons.length;
  
  // No Flowers or Seasons - 1 Fan bonus
  if (totalBonus === 0 || gameContext.noFlowersSeasons) {
    patterns.push({ ...SCORING_PATTERNS.FLOWERS_SEASONS.NO_FLOWERS_SEASONS });
    return patterns;
  }
  
  // Eight Flowers - instant 8 Fan win (handled in special hands)
  // Seven Flowers - instant 3 Fan win (handled in special hands)
  
  // Map string values to seat numbers for manual selection mode
  const flowerToSeatMap = { 'plum': 1, 'orchid': 2, 'mum': 3, 'bamboo': 4 };
  const seasonToSeatMap = { 'spring': 1, 'summer': 2, 'autumn': 3, 'winter': 4 };
  
  // Normalize to seat numbers for counting unique flowers/seasons
  const uniqueFlowers = new Set(flowers.map(f => typeof f === 'string' ? flowerToSeatMap[f] : f));
  const uniqueSeasons = new Set(seasons.map(s => typeof s === 'string' ? seasonToSeatMap[s] : s));
  
  // All Flowers (all 4) or All Seasons (all 4) - 2 Fan each
  if (uniqueFlowers.size === 4) {
    patterns.push({ 
      name: 'All Flowers',
      nameZh: '一檯花',
      fan: 2,
      description: 'Collected all 4 flowers'
    });
  }
  if (uniqueSeasons.size === 4) {
    patterns.push({ 
      name: 'All Seasons',
      nameZh: '一檯花',
      fan: 2,
      description: 'Collected all 4 seasons'
    });
  }
  
  // Seat Flower or Season - 1 Fan for each matching your seat number
  // Seat 1 (East) = Flower 1 (Plum) + Season 1 (Spring)
  // Seat 2 (South) = Flower 2 (Orchid) + Season 2 (Summer)
  // Seat 3 (West) = Flower 3 (Chrysanthemum) + Season 3 (Autumn)
  // Seat 4 (North) = Flower 4 (Bamboo) + Season 4 (Winter)
  const seatNumber = gameContext.seatNumber || 1;
  
  // Map string values to seat numbers for manual selection mode
  const flowerToSeat = { 'plum': 1, 'orchid': 2, 'mum': 3, 'bamboo': 4 };
  const seasonToSeat = { 'spring': 1, 'summer': 2, 'autumn': 3, 'winter': 4 };
  
  // Normalize flowers to seat numbers
  const flowerSeatNumbers = flowers.map(f => typeof f === 'string' ? flowerToSeat[f] : f);
  const seasonSeatNumbers = seasons.map(s => typeof s === 'string' ? seasonToSeat[s] : s);
  
  if (flowerSeatNumbers.includes(seatNumber)) {
    patterns.push({ 
      name: 'Seat Flower',
      nameZh: '正花',
      fan: 1,
      description: `Flower ${seatNumber} matches your seat`
    });
  }
  
  if (seasonSeatNumbers.includes(seatNumber)) {
    patterns.push({ 
      name: 'Seat Season',
      nameZh: '正花',
      fan: 1,
      description: `Season ${seatNumber} matches your seat`
    });
  }
  
  return patterns;
};

/**
 * Format score breakdown for display
 */
export const formatScoreBreakdown = (scoreResult) => {
  if (!scoreResult) return null;
  
  const { totalFan, matchedPatterns, payment, meetsMinimum, error } = scoreResult;
  
  if (error) {
    return { error };
  }
  
  return {
    totalFan,
    payment,
    meetsMinimum,
    minimumRequired: MINIMUM_FAN,
    patterns: matchedPatterns.map(p => ({
      name: p.name,
      fan: p.fan,
      description: p.description
    })),
    message: meetsMinimum 
      ? `${totalFan} Fan - Winning hand!` 
      : `${totalFan} Fan - Does not meet ${MINIMUM_FAN} Fan minimum`
  };
};

