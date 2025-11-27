// Hong Kong Mahjong Scoring Rules
// Based on the Hong Kong Mahjong Rule Sheet

export const TILE_TYPES = {
  DOTS: 'dots',
  STICKS: 'sticks',
  MAN: 'man',
  WINDS: 'winds',
  DRAGONS: 'dragons',
  FLOWERS: 'flowers',
  SEASONS: 'seasons'
};

export const WINDS = {
  EAST: 'east',
  SOUTH: 'south',
  WEST: 'west',
  NORTH: 'north'
};

export const DRAGONS = {
  RED: 'red',
  GREEN: 'green',
  WHITE: 'white'
};

export const FLOWERS = {
  PLUM: 'plum',
  ORCHID: 'orchid',
  MUM: 'mum',
  BAMBOO: 'bamboo'
};

export const SEASONS = {
  SPRING: 'spring',
  SUMMER: 'summer',
  AUTUMN: 'autumn',
  WINTER: 'winter'
};

// Scoring patterns with their Fan values
export const SCORING_PATTERNS = {
  // Win Actions
  WIN_ACTIONS: {
    SELF_PICK: { name: 'Self-Pick (自摸)', fan: 1, description: 'You select your winning tile from the wall' },
    WIN_BY_KONG_REPLACEMENT: { name: 'Win by Kong Replacement (槓上開花)', fan: 1, description: 'Win is a replacement tile due to calling a Kong' },
    DOUBLE_KONG_REPLACEMENT: { name: 'Double Kong Replacement (槓上槓)', fan: 9, description: 'If you call a kong, call a second kong using the replacement tile, then win on the second replacement' },
    CONCEALED_HAND: { name: 'Concealed Hand (門前清)', fan: 1, description: 'You did not take any tiles from other players in order to win' },
    ROBBING_THE_KONG: { name: 'Robbing the Kong (搶槓)', fan: 1, description: 'Win win by interrupting another player upgrading a pong to a kong using your winning tile' },
    MOON_UNDER_THE_SEA: { name: 'Moon Under The Sea (海底撈月)', fan: 1, description: 'Your winning tile was the last tile in the wall and you drew it' }
  },

  // Single Set Type Hands
  SINGLE_SET_TYPE: {
    ALL_SEQUENCES: { name: 'All Sequences (平糊)', fan: 1, description: 'All sets are sequences' },
    ALL_TRIPLETS: { name: 'All Triplets (對對糊)', fan: 3, description: 'All sets are triplets' },
    ALL_CONCEALED_TRIPLETS: { name: 'All Concealed Triplets (四暗刻)', fan: 8, description: 'All sets are triplets and no tiles taken from other players. Self pick or discard for the pair to win only' },
    ALL_QUADRUPLETS: { name: 'All Quadruplets (四槓子)', fan: 13, description: 'All four sets are quadruplets' }
  },

  // Special Tile Hands
  SPECIAL_TILE_HANDS: {
    DRAGON: { name: 'Dragon (三元牌)', fan: 1, description: 'A triplet of dragon tiles. Score for each triplet' },
    SMALL_THREE_DRAGONS: { name: 'Small Three Dragons (小三元)', fan: 5, description: 'Two dragon triplets and a pair of the third dragon' },
    BIG_THREE_DRAGONS: { name: 'Big Three Dragons (大三元)', fan: 8, description: 'Three dragon triplets' },
    ROUND_WIND: { name: 'Round Wind (圈風)', fan: 1, description: 'A triplet of either the round wind or your seat wind. If the triplet is both the round and seat wind, count for 2 Fan' },
    SEAT_WIND: { name: 'Seat Wind (門風)', fan: 1, description: 'A triplet of your seat wind' },
    SMALL_FOUR_WINDS: { name: 'Small Four Winds (小四喜)', fan: 6, description: 'Three wind triplets and a pair of the fourth wind' },
    BIG_FOUR_WINDS: { name: 'Big Four Winds (大四喜)', fan: 13, description: 'Four wind triplets' },
    MIXED_FLUSH: { name: 'Mixed Flush (混一色)', fan: 3, description: 'Your hand contains only one suit plus honours' },
    FULL_FLUSH: { name: 'Full Flush (清一色)', fan: 7, description: 'Your hand contains only one suit' },
    MIXED_TERMINALS: { name: 'Mixed Terminals (混么九)', fan: 4, description: 'Your hand contains only ones, nines and honours. 3 Fan from All Triplets is included' },
    ALL_TERMINALS: { name: 'All Terminals (清么九)', fan: 13, description: 'Your hand contains only ones and nines. 3 Fan from All Triplets is already included' },
    ALL_HONOURS: { name: 'All Honours (字一色)', fan: 10, description: 'Your hand contains only honours tiles. 3 Fan from All Triplets is already included' }
  },

  // Flowers and Seasons
  FLOWERS_SEASONS: {
    NO_FLOWERS_SEASONS: { name: 'No Flowers or Seasons (無花)', fan: 1, description: 'You have no flowers or seasons' },
    SEAT_FLOWER: { name: 'Seat Flower or Season (正花)', fan: 1, description: '1 fan for each flower or season of your seat number' },
    ALL_FLOWERS_SEASONS: { name: 'All Flowers or All Seasons (一樣花)', fan: 2, description: 'You have either all four flowers or all four seasons' },
    SEVEN_FLOWERS: { name: 'Seven Flowers (花糊)', fan: 3, description: 'You can choose to win immediately upon declaring the 7th flower tile' },
    EIGHT_FLOWERS: { name: 'Eight Flowers (大花糊)', fan: 8, description: 'You can choose to win immediately upon declaring the 8th flower tile' }
  },

  // Special Hands
  SPECIAL_HANDS: {
    BLESSING_OF_HEAVEN: { name: 'Blessing of Heaven (天糊)', fan: 13, description: 'As dealer, your beginning hand wins' },
    BLESSING_OF_EARTH: { name: 'Blessing of Earth (地糊)', fan: 13, description: 'As non-dealer, you win using the dealer\'s first discard' },
    BLESSING_OF_MAN: { name: 'Blessing of Man (人糊)', fan: 13, description: 'As non-dealer, you win on your first turn with a self-pick' },
    NINE_GATES: { name: 'Nine Gates (九連寶燈)', fan: 13, description: '111 234567 999 of a single suit, plus a 14th tile of the same suit' },
    THIRTEEN_ORPHANS: { name: 'Thirteen Orphans (十三么)', fan: 13, description: 'One of each one, nine, wind and dragon, plus a 14th tile that matches one of the other thirteen' },
    SEVEN_PAIRS: { name: 'Seven Pairs (七對子)', fan: 4, description: 'Seven different pairs. Can stack with All Honours, Semi-Pure and Pure Hand. Only played in certain variants' }
  }
};

// Payment table based on Fan score
export const PAYMENT_TABLE = {
  0: 1,
  1: 2,
  2: 4,
  3: 8,
  4: 16,
  5: 32,
  6: 64,
  7: 128,
  8: 256,
  9: 512,
  10: 1024,
  11: 2048,
  12: 4096,
  13: 8192
};

// Get payment for Fan score (13+ Fan all pay the same)
export const getPayment = (fan) => {
  if (fan >= 13) return PAYMENT_TABLE[13];
  return PAYMENT_TABLE[fan] || 1;
};

export const MINIMUM_FAN = 3;

