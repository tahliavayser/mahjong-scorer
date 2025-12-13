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
 * Preprocess image for YOLOv8 (640x640) with letterboxing
 * Maintains aspect ratio by padding instead of stretching
 */
const preprocessImage = (imageElement) => {
  return tf.tidy(() => {
    // Convert image to tensor
    let tensor = tf.browser.fromPixels(imageElement);
    
    const [origH, origW] = [tensor.shape[0], tensor.shape[1]];
    const targetSize = 640;
    
    // Calculate scale to fit in 640x640 while maintaining aspect ratio
    const scale = Math.min(targetSize / origW, targetSize / origH);
    const newW = Math.round(origW * scale);
    const newH = Math.round(origH * scale);
    
    console.log(`Preprocessing: ${origW}x${origH} → ${newW}x${newH} (scale: ${scale.toFixed(3)})`);
    
    // Resize maintaining aspect ratio
    tensor = tf.image.resizeBilinear(tensor, [newH, newW]);
    
    // Calculate padding (center the image)
    const padTop = Math.floor((targetSize - newH) / 2);
    const padBottom = targetSize - newH - padTop;
    const padLeft = Math.floor((targetSize - newW) / 2);
    const padRight = targetSize - newW - padLeft;
    
    // Pad with gray (114/255 is YOLO's default padding color)
    const padValue = 114;
    tensor = tensor.pad([
      [padTop, padBottom],
      [padLeft, padRight],
      [0, 0]
    ], padValue);
    
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
const postprocessDetections = (output, confidenceThreshold = 0.6) => {
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
  // Format: [batch, features, anchors]
  // features = 4 (bbox) + 42 (classes)
  // anchors = 8400 different detection locations
  
  // Data is laid out as:
  // [x0,x1,x2...x8399, y0,y1...y8399, w0,w1...w8399, h0,h1...h8399, c0_0,c0_1...c0_8399, c1_0,c1_1...c1_8399, ...]
  
  const rawData = outputData.dataSync();
  const numAnchors = shape[2]; // 8400
  const numFeatures = shape[1]; // 46
  const numClasses = numFeatures - 4; // 42
  
  console.log(`Processing ${numAnchors} anchors with ${numClasses} classes`);
  
  // Extract class scores and apply sigmoid to convert logits to probabilities
  // Class data starts at feature index 4
  let globalMaxConf = 0;
  let globalMaxClass = 0;
  let globalMaxAnchor = 0;
  
  // NOTE: YOLOv8 TF.js export already applies sigmoid to class scores!
  // So rawData values 4-45 are already probabilities (0-1), not logits
  
  // Parse each anchor
  for (let a = 0; a < numAnchors; a++) {
    // Get bbox (indices 0-3, each spanning all anchors)
    // These are already decoded to pixel coordinates (0-640)
    const x = rawData[0 * numAnchors + a];
    const y = rawData[1 * numAnchors + a];
    const w = rawData[2 * numAnchors + a];
    const h = rawData[3 * numAnchors + a];
    
    // Get class scores (indices 4-45, each spanning all anchors)
    // These are ALREADY sigmoid-activated probabilities!
    let maxConfidence = 0;
    let maxClassId = 0;
    
    for (let c = 0; c < numClasses; c++) {
      const confidence = rawData[(4 + c) * numAnchors + a];
      
      if (confidence > maxConfidence) {
        maxConfidence = confidence;
        maxClassId = c;
      }
      
      if (confidence > globalMaxConf) {
        globalMaxConf = confidence;
        globalMaxClass = c;
        globalMaxAnchor = a;
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
            className,
            bbox: { x, y, w, h }
          });
        }
      }
    }
  }
  
  // Debug output
  console.log(`🔍 DEBUG: Highest confidence found: ${globalMaxConf.toFixed(4)} for class ${globalMaxClass} (${CLASS_NAMES[globalMaxClass]}) at anchor ${globalMaxAnchor}`);
  
  // Show probabilities for best anchor (already sigmoid-activated by model)
  const bestProbs = [];
  for (let c = 0; c < Math.min(10, numClasses); c++) {
    const idx = (4 + c) * numAnchors + globalMaxAnchor;
    const prob = rawData[idx];
    bestProbs.push(`${CLASS_NAMES[c]}:${prob.toFixed(3)}`);
  }
  console.log(`Best anchor ${globalMaxAnchor} class probs:`, bestProbs.join(', '));
  
  // Show bbox for best anchor
  console.log(`Best anchor bbox: x=${rawData[0 * numAnchors + globalMaxAnchor].toFixed(1)}, y=${rawData[1 * numAnchors + globalMaxAnchor].toFixed(1)}, w=${rawData[2 * numAnchors + globalMaxAnchor].toFixed(1)}, h=${rawData[3 * numAnchors + globalMaxAnchor].toFixed(1)}`);
  
  // Check max probability across ALL anchors
  let maxProb = 0;
  let maxProbClass = 0;
  let maxProbAnchor = 0;
  for (let c = 0; c < numClasses; c++) {
    for (let a = 0; a < numAnchors; a++) {
      const idx = (4 + c) * numAnchors + a;
      if (rawData[idx] > maxProb) {
        maxProb = rawData[idx];
        maxProbClass = c;
        maxProbAnchor = a;
      }
    }
  }
  console.log(`🔥 Max probability across ALL anchors: ${maxProb.toFixed(4)} for class ${maxProbClass} (${CLASS_NAMES[maxProbClass]}) at anchor ${maxProbAnchor}`);
  
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
    console.log('Output is Tensor?', output instanceof tf.Tensor);
    
    // Check model output signature
    if (model.outputs) {
      console.log('Model output names:', model.outputs.map(o => o.name));
    }
    
    // If output is a single tensor, log its shape
    if (output instanceof tf.Tensor) {
      console.log('Direct tensor shape:', output.shape);
    } else if (Array.isArray(output)) {
      console.log('Array output, shapes:', output.map(t => t.shape));
    }
    
    // Cleanup input tensor
    inputTensor.dispose();
    
    // Post-process to get tile detections
    // Lower threshold (0.3) to catch more tiles in challenging photos (stacked, angled)
    const detections = postprocessDetections(output, 0.3);
    
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
 * Calculate IoU (Intersection over Union) between two boxes
 * Boxes are {x, y, w, h} where x,y is center
 */
const calculateIoU = (box1, box2) => {
  // Convert center format to corner format
  const x1_min = box1.x - box1.w / 2;
  const x1_max = box1.x + box1.w / 2;
  const y1_min = box1.y - box1.h / 2;
  const y1_max = box1.y + box1.h / 2;
  
  const x2_min = box2.x - box2.w / 2;
  const x2_max = box2.x + box2.w / 2;
  const y2_min = box2.y - box2.h / 2;
  const y2_max = box2.y + box2.h / 2;
  
  // Calculate intersection
  const inter_x_min = Math.max(x1_min, x2_min);
  const inter_x_max = Math.min(x1_max, x2_max);
  const inter_y_min = Math.max(y1_min, y2_min);
  const inter_y_max = Math.min(y1_max, y2_max);
  
  if (inter_x_max <= inter_x_min || inter_y_max <= inter_y_min) {
    return 0;
  }
  
  const inter_area = (inter_x_max - inter_x_min) * (inter_y_max - inter_y_min);
  const area1 = box1.w * box1.h;
  const area2 = box2.w * box2.h;
  const union_area = area1 + area2 - inter_area;
  
  return inter_area / union_area;
};

/**
 * Remove duplicate detections using proper NMS with IoU
 * Keep top detections, suppressing overlapping boxes
 */
const removeDuplicateDetections = (detections) => {
  if (detections.length === 0) return [];
  
  // Sort by confidence (highest first)
  const sorted = [...detections].sort((a, b) => b.confidence - a.confidence);
  
  const kept = [];
  const suppressed = new Set();
  // Higher IoU threshold (0.5) = less aggressive suppression
  // Allows tiles that are stacked/overlapping in photo to both be detected
  const iouThreshold = 0.5;
  
  for (let i = 0; i < sorted.length; i++) {
    if (suppressed.has(i)) continue;
    
    const current = sorted[i];
    kept.push(current);
    
    // Suppress all lower-confidence detections that overlap with this one
    for (let j = i + 1; j < sorted.length; j++) {
      if (suppressed.has(j)) continue;
      
      if (current.bbox && sorted[j].bbox) {
        const iou = calculateIoU(current.bbox, sorted[j].bbox);
        if (iou > iouThreshold) {
          suppressed.add(j);
        }
      }
    }
  }
  
  console.log(`NMS: ${detections.length} → ${kept.length} (suppressed ${suppressed.size} overlapping)`);
  
  // Sort by X position (left to right) to maintain visual order
  const sortedByPosition = [...kept].sort((a, b) => {
    if (a.bbox && b.bbox) {
      return a.bbox.x - b.bbox.x;
    }
    return 0;
  });
  
  console.log('Tiles sorted by X position:', sortedByPosition.map(d => 
    `${d.className}@${d.bbox?.x?.toFixed(0)}`
  ).join(', '));
  
  // Now apply tile type limits (max 4 of each)
  const tileCounts = new Map();
  const result = [];
  
  for (const det of sortedByPosition) {
    const key = `${det.type}-${det.value}`;
    const count = tileCounts.get(key) || 0;
    
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
  
  // Limit to reasonable hand size (already in position order)
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
