# Training a TensorFlow Model for Mahjong Tile Detection

This guide will walk you through training a custom model to detect and classify mahjong tiles from photos.

## Overview

You'll need to:
1. Collect training data (photos of tiles)
2. Label the data
3. Train a TensorFlow model
4. Convert to TensorFlow.js format
5. Integrate into the app

**Time estimate**: 2-4 weeks (mostly data collection)
**Difficulty**: Intermediate to Advanced

---

## Step 1: Collect Training Data

### What You Need
- **1,000-2,000 images per tile type** (34 tile types total)
- Photos should include:
  - Different lighting conditions
  - Various angles (straight-on, slight tilt)
  - Different backgrounds
  - Different mahjong sets (if possible)

### Tile Types to Collect (34 total)
- **Dots**: 1-9 (9 classes)
- **Bams**: 1-9 (9 classes)
- **Craks**: 1-9 (9 classes)
- **Winds**: East, South, West, North (4 classes)
- **Dragons**: Red, Green, White (3 classes)

**Total**: 34 classes × 1,000 images = ~34,000 images minimum

### Collection Methods

#### Option A: Take Photos Yourself (Recommended)
```bash
# Organize your photos like this:
training_data/
├── dots_1/
│   ├── img_0001.jpg
│   ├── img_0002.jpg
│   └── ...
├── dots_2/
│   ├── img_0001.jpg
│   └── ...
├── bams_1/
├── craks_1/
├── wind_east/
├── dragon_red/
└── ...
```

**Tips for taking photos:**
- Use your phone camera
- Take 10-20 photos per session
- Vary the angle slightly each time
- Change lighting (natural, indoor, bright, dim)
- Include some photos with multiple tiles visible
- Take photos of tiles on different surfaces

#### Option B: Data Augmentation
Use fewer photos (200-500 per class) and augment them:
- Rotation (±15 degrees)
- Brightness adjustment
- Contrast changes
- Slight zoom
- Horizontal flip (be careful - some tiles are asymmetric!)

#### Option C: Use Existing Datasets
Search for:
- "Mahjong tile dataset" on Kaggle
- Academic datasets
- Open source projects

---

## Step 2: Label Your Data

If your photos aren't organized by folder, use a labeling tool:

### Recommended Tools

**LabelImg** (Free, Easy)
```bash
# Install
pip install labelImg

# Run
labelImg
```

**Roboflow** (Web-based, Free tier)
- Upload images
- Draw bounding boxes
- Auto-label similar images
- Export in TensorFlow format
- Website: https://roboflow.com

**CVAT** (Free, Powerful)
- Open source annotation tool
- Good for large datasets
- Website: https://cvat.org

---

## Step 3: Train the Model

### Option A: Using Python & TensorFlow (Recommended)

Create a training script:

```python
# train_mahjong_detector.py
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import numpy as np

# Configuration
IMG_SIZE = 224  # Standard size for transfer learning
BATCH_SIZE = 32
EPOCHS = 50
NUM_CLASSES = 34  # 34 different tile types

# Data augmentation
train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=15,
    width_shift_range=0.1,
    height_shift_range=0.1,
    brightness_range=[0.8, 1.2],
    zoom_range=0.1,
    validation_split=0.2  # 80% train, 20% validation
)

# Load training data
train_generator = train_datagen.flow_from_directory(
    'training_data/',
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='training'
)

validation_generator = train_datagen.flow_from_directory(
    'training_data/',
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='validation'
)

# Build model using transfer learning (MobileNetV2 - good for web)
base_model = keras.applications.MobileNetV2(
    input_shape=(IMG_SIZE, IMG_SIZE, 3),
    include_top=False,
    weights='imagenet'
)

# Freeze base model layers
base_model.trainable = False

# Add custom classification layers
model = keras.Sequential([
    base_model,
    layers.GlobalAveragePooling2D(),
    layers.Dropout(0.3),
    layers.Dense(256, activation='relu'),
    layers.Dropout(0.3),
    layers.Dense(NUM_CLASSES, activation='softmax')
])

# Compile model
model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=0.001),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

# Train model
history = model.fit(
    train_generator,
    validation_data=validation_generator,
    epochs=EPOCHS,
    callbacks=[
        keras.callbacks.EarlyStopping(patience=5, restore_best_weights=True),
        keras.callbacks.ReduceLROnPlateau(factor=0.5, patience=3)
    ]
)

# Fine-tune: Unfreeze some layers and train again
base_model.trainable = True
# Freeze all layers except the last 20
for layer in base_model.layers[:-20]:
    layer.trainable = False

# Recompile with lower learning rate
model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=0.0001),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

# Continue training
history_fine = model.fit(
    train_generator,
    validation_data=validation_generator,
    epochs=20,
    callbacks=[
        keras.callbacks.EarlyStopping(patience=5, restore_best_weights=True)
    ]
)

# Save model
model.save('mahjong_detector_model.h5')

# Save class names
import json
class_names = list(train_generator.class_indices.keys())
with open('class_names.json', 'w') as f:
    json.dump(class_names, f)

print(f"Training complete! Final accuracy: {history_fine.history['accuracy'][-1]:.2%}")
```

### Run Training

```bash
# Install dependencies
pip install tensorflow pillow numpy

# Organize your data in training_data/ folder
# Run training
python train_mahjong_detector.py
```

**Expected Results:**
- Training time: 2-6 hours (depending on GPU)
- Target accuracy: >95% on validation set
- If accuracy is low: collect more data or adjust model

---

## Step 4: Convert to TensorFlow.js

```bash
# Install converter
pip install tensorflowjs

# Convert the model
tensorflowjs_converter \
    --input_format=keras \
    mahjong_detector_model.h5 \
    public/models/mahjong-detector/
```

This creates:
- `model.json` - Model architecture
- `group1-shard1of*.bin` - Model weights

---

## Step 5: Integrate into Your App

Update `src/utils/tileDetection.js`:

```javascript
import * as tf from '@tensorflow/tfjs';

let model = null;
let classNames = null;

export const initializeTileDetection = async () => {
  try {
    await tf.ready();
    
    // Load the model
    model = await tf.loadLayersModel('/models/mahjong-detector/model.json');
    
    // Load class names
    const response = await fetch('/models/mahjong-detector/class_names.json');
    classNames = await response.json();
    
    console.log('Model loaded successfully');
    return model;
  } catch (error) {
    console.error('Error loading model:', error);
    return null;
  }
};

export const detectTilesFromImage = async (imageBlob, imageElement) => {
  if (!model || !classNames) {
    throw new Error('Model not loaded');
  }
  
  try {
    // Preprocess image
    const tensor = tf.browser.fromPixels(imageElement)
      .resizeNearestNeighbor([224, 224])
      .toFloat()
      .div(tf.scalar(255.0))
      .expandDims(0);
    
    // Run prediction
    const predictions = await model.predict(tensor).data();
    
    // Get top predictions
    const tiles = [];
    const threshold = 0.5; // Confidence threshold
    
    predictions.forEach((confidence, index) => {
      if (confidence > threshold) {
        const className = classNames[index];
        const tile = parseClassName(className);
        tiles.push(tile);
      }
    });
    
    // Clean up
    tensor.dispose();
    
    return tiles;
  } catch (error) {
    console.error('Error detecting tiles:', error);
    throw error;
  }
};

// Helper to parse class name into tile object
const parseClassName = (className) => {
  // Example: "dots_3" -> { type: 'dots', value: 3, concealed: true }
  const parts = className.split('_');
  const type = parts[0];
  const value = parts[1];
  
  // Convert to proper format
  if (type === 'dots' || type === 'bams' || type === 'craks') {
    return { type, value: parseInt(value), concealed: true };
  } else if (type === 'wind') {
    const windMap = { east: 'east', south: 'south', west: 'west', north: 'north' };
    return { type: 'winds', value: windMap[value], concealed: true };
  } else if (type === 'dragon') {
    const dragonMap = { red: 'red', green: 'green', white: 'white' };
    return { type: 'dragons', value: dragonMap[value], concealed: true };
  }
  
  return { type, value, concealed: true };
};
```

---

## Alternative: Use Google Teachable Machine (Easiest!)

If you want a simpler approach without coding:

### Steps:

1. **Go to**: https://teachablemachine.withgoogle.com/
2. **Select**: Image Project
3. **Add Classes**: Create 34 classes (one per tile type)
4. **Upload Images**: Add your photos to each class
5. **Train**: Click "Train Model" (takes 5-10 minutes)
6. **Export**: 
   - Choose "TensorFlow.js"
   - Download the model
   - Copy files to `public/models/mahjong-detector/`
7. **Update Code**: Use the provided code snippet

**Pros:**
- No coding required for training
- Visual interface
- Quick to get started

**Cons:**
- Less control over model architecture
- May have lower accuracy
- Limited data augmentation

---

## Tips for Success

### Data Collection
- **Quality > Quantity**: 500 good photos beats 2,000 bad ones
- **Consistency**: Use similar lighting and angles
- **Variety**: Include edge cases (worn tiles, shadows, etc.)

### Training
- **Start Small**: Test with 5-10 classes first
- **Monitor Overfitting**: If validation accuracy << training accuracy, you're overfitting
- **Use GPU**: Training on CPU can take days; GPU takes hours
  - Google Colab (free GPU): https://colab.research.google.com
  - Kaggle Notebooks (free GPU): https://www.kaggle.com/code

### Testing
- **Test with Real Photos**: Not just training data
- **Check Edge Cases**: Blurry photos, bad lighting, multiple tiles
- **Iterate**: Collect more data for classes with low accuracy

---

## Estimated Costs

- **Time**: 2-4 weeks (mostly data collection)
- **Money**: $0 (using free tools and Google Colab)
- **Hardware**: Any computer (use cloud GPU for training)

---

## Quick Start Checklist

- [ ] Decide on approach (Python training vs Teachable Machine)
- [ ] Collect 200+ photos per tile type (or 1,000+ for best results)
- [ ] Organize photos into folders by class
- [ ] Train model (Python script or Teachable Machine)
- [ ] Convert to TensorFlow.js format
- [ ] Copy model files to `public/models/mahjong-detector/`
- [ ] Update `src/utils/tileDetection.js`
- [ ] Test with real photos
- [ ] Iterate and improve

---

## Resources

### Learning
- TensorFlow.js Docs: https://www.tensorflow.org/js
- Image Classification Tutorial: https://www.tensorflow.org/tutorials/images/classification
- Transfer Learning Guide: https://www.tensorflow.org/tutorials/images/transfer_learning

### Tools
- Google Teachable Machine: https://teachablemachine.withgoogle.com/
- Google Colab (free GPU): https://colab.research.google.com
- Roboflow (data labeling): https://roboflow.com
- LabelImg: https://github.com/heartexlabs/labelImg

### Datasets
- Kaggle Datasets: https://www.kaggle.com/datasets
- Search: "mahjong tiles dataset"

---

## Need Help?

If you get stuck:
1. Start with Google Teachable Machine (easiest)
2. Use Google Colab for free GPU training
3. Check TensorFlow.js documentation
4. Ask in TensorFlow forums or Stack Overflow

Good luck with your model training! 🚀🀄

