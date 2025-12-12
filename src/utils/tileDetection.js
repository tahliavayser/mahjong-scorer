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
    
    // Determine the base path for the model
    const basePath = import.meta.env.BASE_URL || '/';
    const modelPath = `${basePath}models/mahjong-detector/model.json`;
    
    console.log('Loading mahjong detection model from:', modelPath);
    
    try {
      model = await tf.loadGraphModel(modelPath);
      console.log('✅ Model loaded successfully!');
    } catch (e1) {
      console.log('First path failed, trying alternatives...');
      // Try alternative paths
      const altPaths = [
        '/mahjong-scorer/models/mahjong-detector/model.json',
        '/models/mahjong-detector/model.json',
        './models/mahjong-detector/model.json'
      ];
      
      for (const path of altPaths) {
        try {
          console.log('Trying:', path);
          model = await tf.loadGraphModel(path);
          console.log('✅ Model loaded from:', path);
          break;
        } catch (e) {
          console.log('Failed:', path);
        }
      }
    }
    
    if (model) {
      // Warm up the model with a dummy prediction
      console.log('Warming up model...');
      const dummyInput = tf.zeros([1, 640, 640, 3]);
      await model.predict(dummyInput);
      dummyInput.dispose();
      console.log('✅ Model ready!');
    } else {
      console.warn('⚠️ Could not load model from any path');
    }
    
    return model;
  } catch (error) {
    console.error('Error initializing tile detection:', error);
    return null;
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
 * YOLOv8 TF.js output shape: [1, 46, 8400]
 * - 46 = 4 (bbox: x, y, w, h) + 42 (class scores)
 * - 8400 = number of detection anchors
 */
const postprocessDetections = (output, confidenceThreshold = 0.1) => {
  const detections = [];
  
  let outputData;
  if (Array.isArray(output)) {
    outputData = output[0];
  } else {
    outputData = output;
  }
  
  const shape = outputData.shape;
  console.log('Output shape:', shape);
  
  // Shape is [1, 46, 8400]
  // Transpose to [1, 8400, 46] for easier processing
  const transposed = outputData.transpose([0, 2, 1]);
  const data = transposed.dataSync();
  transposed.dispose();
  
  const numDetections = shape[2]; // 8400
  const numValues = shape[1]; // 46 (4 bbox + 42 classes)
  const numClasses = 42;
  
  console.log(`Processing ${numDetections} detections with ${numClasses} classes`);
  
  // Debug: Find the highest confidence scores in the output
  let globalMaxConf = 0;
  let globalMaxClass = 0;
  let globalMaxIdx = 0;
  
  // Parse each detection
  for (let i = 0; i < numDetections; i++) {
    const offset = i * numValues;
    
    // First 4 values are bbox (x_center, y_center, width, height)
    // const x = data[offset];
    // const y = data[offset + 1];
    // const w = data[offset + 2];
    // const h = data[offset + 3];
    
    // Remaining 42 values are class scores
    let maxConfidence = 0;
    let maxClassId = 0;
    
    for (let c = 0; c < numClasses; c++) {
      const confidence = data[offset + 4 + c];
      
      if (confidence > maxConfidence) {
        maxConfidence = confidence;
        maxClassId = c;
      }
      
      // Track global max for debugging
      if (confidence > globalMaxConf) {
        globalMaxConf = confidence;
        globalMaxClass = c;
        globalMaxIdx = i;
      }
    }
    
    if (maxConfidence > confidenceThreshold) {
      const className = CLASS_NAMES[maxClassId];
      if (className) {
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
  
  // Debug output
  console.log(`🔍 DEBUG: Highest confidence found: ${globalMaxConf.toFixed(4)} for class ${globalMaxClass} (${CLASS_NAMES[globalMaxClass]}) at index ${globalMaxIdx}`);
  
  // If no detections, log some sample values
  if (detections.length === 0) {
    console.log('Sample raw values from first detection:');
    const sampleOffset = 0;
    console.log('  BBox:', data[sampleOffset], data[sampleOffset+1], data[sampleOffset+2], data[sampleOffset+3]);
    console.log('  Class scores (first 10):', Array.from(data.slice(sampleOffset + 4, sampleOffset + 14)).map(v => v.toFixed(4)));
  }
  
  console.log(`Found ${detections.length} detections above threshold ${confidenceThreshold}`);
  
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
      console.error('❌ Model not available - tile detection will not work');
      throw new Error('Tile detection model not loaded. Please try again or use Manual Selection.');
    }
    
    console.log('Running tile detection on image:', imageElement.width, 'x', imageElement.height);
    
    // Preprocess image
    const inputTensor = preprocessImage(imageElement);
    console.log('Input tensor shape:', inputTensor.shape);
    
    // Run inference
    console.log('Running model inference...');
    const output = await model.predict(inputTensor);
    console.log('Model output:', output);
    
    // Cleanup input tensor
    inputTensor.dispose();
    
    // Post-process to get tile detections
    const detections = postprocessDetections(output, 0.25); // Lower threshold
    
    // Cleanup output
    if (Array.isArray(output)) {
      output.forEach(t => t.dispose());
    } else {
      output.dispose();
    }
    
    console.log(`Detected ${detections.length} tiles:`, detections);
    
    if (detections.length === 0) {
      console.warn('⚠️ No tiles detected in image');
      // Return empty array - let the UI handle this
      return [];
    }
    
    // Remove duplicates and sort
    const uniqueTiles = removeDuplicateDetections(detections);
    console.log('Final tiles after dedup:', uniqueTiles);
    
    return uniqueTiles;
  } catch (error) {
    console.error('Error detecting tiles:', error);
    throw error; // Re-throw so the UI can handle it
  }
};

/**
 * Remove duplicate detections using Non-Maximum Suppression
 * Keep top detections, allowing up to 4 of each tile type
 */
const removeDuplicateDetections = (detections) => {
  // Sort by confidence (highest first)
  const sorted = [...detections].sort((a, b) => b.confidence - a.confidence);
  
  // Count how many of each tile type we've kept
  const tileCounts = new Map();
  const result = [];
  
  for (const det of sorted) {
    const key = `${det.type}-${det.value}`;
    const count = tileCounts.get(key) || 0;
    
    // Allow up to 4 of each tile (mahjong has 4 copies of each regular tile)
    if (count < 4) {
      result.push({
        type: det.type,
        value: det.value,
        concealed: true,
        confidence: det.confidence
      });
      tileCounts.set(key, count + 1);
    }
  }
  
  // Limit to reasonable hand size (max 22: 14 regular + 8 bonus)
  const finalTiles = result.slice(0, 22).map(({ type, value, concealed }) => ({
    type, value, concealed
  }));
  
  console.log(`After NMS: ${finalTiles.length} tiles`);
  return finalTiles;
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
