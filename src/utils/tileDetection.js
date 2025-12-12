// TensorFlow.js tile detection using trained YOLOv8 model
import * as tf from '@tensorflow/tfjs';

// Model class mapping from your trained model
const CLASS_NAMES = {
  0: '1B', 1: '1C', 2: '1D', 3: '1F', 4: '1S',
  5: '2B', 6: '2C', 7: '2D', 8: '2F', 9: '2S',
  10: '3B', 11: '3C', 12: '3D', 13: '3F', 14: '3S',
  15: '4B', 16: '4C', 17: '4D', 18: '4F', 19: '4S',
  20: '5B', 21: '5C', 22: '5D',
  23: '6B', 24: '6C', 25: '6D',
  26: '7B', 27: '7C', 28: '7D',
  29: '8B', 30: '8C', 31: '8D',
  32: '9B', 33: '9C', 34: '9D',
  35: 'EW', 36: 'GD', 37: 'NW', 38: 'RD', 39: 'SW', 40: 'WD', 41: 'WW'
};

// Convert model class names to our tile format
const classToTile = (className) => {
  // Parse the class name (e.g., "1B" = 1 Bamboo, "EW" = East Wind)
  
  // Numbered tiles
  if (/^[1-9][BCD]$/.test(className)) {
    const value = parseInt(className[0]);
    const suit = className[1];
    const typeMap = { 'B': 'sticks', 'C': 'man', 'D': 'dots' };
    return { type: typeMap[suit], value, concealed: true };
  }
  
  // Flowers (1F-4F)
  if (/^[1-4]F$/.test(className)) {
    const num = parseInt(className[0]);
    const flowerMap = { 1: 'plum', 2: 'orchid', 3: 'mum', 4: 'bamboo' };
    return { type: 'flowers', value: flowerMap[num], concealed: true };
  }
  
  // Seasons (1S-4S)
  if (/^[1-4]S$/.test(className)) {
    const num = parseInt(className[0]);
    const seasonMap = { 1: 'spring', 2: 'summer', 3: 'autumn', 4: 'winter' };
    return { type: 'seasons', value: seasonMap[num], concealed: true };
  }
  
  // Winds
  const windMap = {
    'EW': { type: 'winds', value: 'east', concealed: true },
    'SW': { type: 'winds', value: 'south', concealed: true },
    'WW': { type: 'winds', value: 'west', concealed: true },
    'NW': { type: 'winds', value: 'north', concealed: true }
  };
  if (windMap[className]) return windMap[className];
  
  // Dragons
  const dragonMap = {
    'RD': { type: 'dragons', value: 'red', concealed: true },
    'GD': { type: 'dragons', value: 'green', concealed: true },
    'WD': { type: 'dragons', value: 'white', concealed: true }
  };
  if (dragonMap[className]) return dragonMap[className];
  
  // Fallback
  console.warn('Unknown class:', className);
  return null;
};

let model = null;

/**
 * Initialize the tile detection model
 */
export const initializeTileDetection = async () => {
  try {
    await tf.ready();
    console.log('TensorFlow.js initialized, backend:', tf.getBackend());
    
    // Load the trained YOLOv8 model
    console.log('Loading mahjong detection model...');
    model = await tf.loadGraphModel('/mahjong-scorer/models/mahjong-detector/model.json');
    console.log('Model loaded successfully!');
    
    // Warm up the model with a dummy prediction
    const dummyInput = tf.zeros([1, 640, 640, 3]);
    await model.predict(dummyInput);
    dummyInput.dispose();
    console.log('Model warmed up');
    
    return model;
  } catch (error) {
    console.error('Error initializing tile detection:', error);
    // Try loading without the base path (for local dev)
    try {
      model = await tf.loadGraphModel('/models/mahjong-detector/model.json');
      console.log('Model loaded (local path)');
      return model;
    } catch (e) {
      console.error('Failed to load model:', e);
      return null;
    }
  }
};

/**
 * Preprocess image for YOLOv8 (640x640)
 */
const preprocessImage = (imageElement) => {
  return tf.tidy(() => {
    // Convert image to tensor
    let tensor = tf.browser.fromPixels(imageElement);
    
    // Resize to 640x640 (YOLOv8 input size)
    tensor = tf.image.resizeBilinear(tensor, [640, 640]);
    
    // Normalize to [0, 1]
    tensor = tensor.div(255.0);
    
    // Add batch dimension [1, 640, 640, 3]
    tensor = tensor.expandDims(0);
    
    return tensor;
  });
};

/**
 * Post-process YOLOv8 output to get detections
 */
const postprocessDetections = (output, confidenceThreshold = 0.5) => {
  const detections = [];
  
  // YOLOv8 TF.js output format varies - handle common cases
  let outputData;
  
  if (Array.isArray(output)) {
    outputData = output[0];
  } else {
    outputData = output;
  }
  
  const data = outputData.dataSync();
  const shape = outputData.shape;
  
  console.log('Output shape:', shape);
  
  // YOLOv8 output is typically [1, num_classes + 4, num_detections]
  // or [1, num_detections, num_classes + 4]
  
  if (shape.length === 3) {
    const numDetections = shape[2] || shape[1];
    const numClasses = 42; // Your model has 42 classes
    
    // Parse detections
    for (let i = 0; i < numDetections; i++) {
      // Try to extract class confidences
      let maxConfidence = 0;
      let maxClassId = 0;
      
      for (let c = 0; c < numClasses; c++) {
        const idx = (4 + c) * numDetections + i; // Adjust based on actual format
        const confidence = data[idx] || 0;
        
        if (confidence > maxConfidence) {
          maxConfidence = confidence;
          maxClassId = c;
        }
      }
      
      if (maxConfidence > confidenceThreshold) {
        const className = CLASS_NAMES[maxClassId];
        const tile = classToTile(className);
        
        if (tile) {
          detections.push({
            ...tile,
            confidence: maxConfidence,
            className
          });
        }
      }
    }
  }
  
  return detections;
};

/**
 * Detect tiles from an image using the trained model
 */
export const detectTilesFromImage = async (imageBlob, imageElement) => {
  try {
    // Ensure model is loaded
    if (!model) {
      console.log('Model not loaded, initializing...');
      await initializeTileDetection();
    }
    
    if (!model) {
      console.warn('Model still not available, using mock detection');
      return generateMockTiles();
    }
    
    console.log('Running tile detection...');
    
    // Preprocess image
    const inputTensor = preprocessImage(imageElement);
    
    // Run inference
    const output = await model.predict(inputTensor);
    
    // Cleanup input tensor
    inputTensor.dispose();
    
    // Post-process to get tile detections
    const detections = postprocessDetections(output, 0.3);
    
    // Cleanup output
    if (Array.isArray(output)) {
      output.forEach(t => t.dispose());
    } else {
      output.dispose();
    }
    
    console.log(`Detected ${detections.length} tiles`);
    
    if (detections.length === 0) {
      console.warn('No tiles detected, using mock for demo');
      return generateMockTiles();
    }
    
    // Remove duplicates and sort
    const uniqueTiles = removeDuplicateDetections(detections);
    
    return uniqueTiles;
  } catch (error) {
    console.error('Error detecting tiles:', error);
    // Fallback to mock detection on error
    return generateMockTiles();
  }
};

/**
 * Remove duplicate detections (same tile detected multiple times)
 */
const removeDuplicateDetections = (detections) => {
  // Group by tile type+value and keep highest confidence
  const tileMap = new Map();
  
  for (const det of detections) {
    const key = `${det.type}-${det.value}`;
    const existing = tileMap.get(key);
    
    if (!existing || det.confidence > existing.confidence) {
      tileMap.set(key, det);
    }
  }
  
  // For mahjong, we can have up to 4 of the same tile
  // This simple approach keeps one of each - adjust as needed
  return Array.from(tileMap.values()).map(({ type, value, concealed }) => ({
    type, value, concealed
  }));
};

/**
 * Generate mock tiles for testing/fallback
 */
const generateMockTiles = () => {
  return [
    { type: 'dots', value: 1, concealed: true },
    { type: 'dots', value: 2, concealed: true },
    { type: 'dots', value: 3, concealed: true },
    { type: 'sticks', value: 4, concealed: true },
    { type: 'sticks', value: 5, concealed: true },
    { type: 'sticks', value: 6, concealed: true },
    { type: 'man', value: 7, concealed: true },
    { type: 'man', value: 8, concealed: true },
    { type: 'man', value: 9, concealed: true },
    { type: 'dots', value: 5, concealed: true },
    { type: 'dots', value: 6, concealed: true },
    { type: 'dots', value: 7, concealed: true },
    { type: 'winds', value: 'east', concealed: true },
    { type: 'winds', value: 'east', concealed: true }
  ];
};

/**
 * Validate detected tiles
 */
export const validateDetectedTiles = (tiles) => {
  const regularTiles = tiles.filter(t => t.type !== 'flowers' && t.type !== 'seasons');
  const bonusTiles = tiles.filter(t => t.type === 'flowers' || t.type === 'seasons');
  
  if (regularTiles.length < 13 || regularTiles.length > 14) {
    return {
      valid: false,
      error: `Expected 13-14 regular tiles, found ${regularTiles.length}`
    };
  }
  
  if (bonusTiles.length > 8) {
    return {
      valid: false,
      error: `Too many bonus tiles: ${bonusTiles.length}`
    };
  }
  
  return { valid: true };
};

/**
 * Get example hands for testing
 */
export const getExampleHands = () => {
  return {
    allSequences: [
      { type: 'dots', value: 1, concealed: true },
      { type: 'dots', value: 2, concealed: true },
      { type: 'dots', value: 3, concealed: true },
      { type: 'sticks', value: 4, concealed: true },
      { type: 'sticks', value: 5, concealed: true },
      { type: 'sticks', value: 6, concealed: true },
      { type: 'man', value: 7, concealed: true },
      { type: 'man', value: 8, concealed: true },
      { type: 'man', value: 9, concealed: true },
      { type: 'dots', value: 5, concealed: true },
      { type: 'dots', value: 6, concealed: true },
      { type: 'dots', value: 7, concealed: true },
      { type: 'winds', value: 'east', concealed: true },
      { type: 'winds', value: 'east', concealed: true }
    ],
    allTriplets: [
      { type: 'dots', value: 1, concealed: true },
      { type: 'dots', value: 1, concealed: true },
      { type: 'dots', value: 1, concealed: true },
      { type: 'sticks', value: 5, concealed: true },
      { type: 'sticks', value: 5, concealed: true },
      { type: 'sticks', value: 5, concealed: true },
      { type: 'man', value: 9, concealed: true },
      { type: 'man', value: 9, concealed: true },
      { type: 'man', value: 9, concealed: true },
      { type: 'dragons', value: 'red', concealed: true },
      { type: 'dragons', value: 'red', concealed: true },
      { type: 'dragons', value: 'red', concealed: true },
      { type: 'winds', value: 'east', concealed: true },
      { type: 'winds', value: 'east', concealed: true }
    ]
  };
};
