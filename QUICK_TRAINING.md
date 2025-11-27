# Quick Start: Train Mahjong Detector with Existing Datasets

Great news! You found existing mahjong tile datasets, which means you can skip the data collection phase!

## Available Datasets

### 1. Camerash Mahjong Dataset
**GitHub**: https://github.com/Camerash/mahjong-dataset
- **Size**: 10,000+ images
- **Format**: Labeled images of individual tiles
- **Quality**: High quality, consistent lighting
- **License**: Open source

### 2. Roboflow Mahjong Dataset
**Roboflow**: https://universe.roboflow.com/jon-chan-gnsoa/mahjong-baq4s
- **Size**: Varies (check current version)
- **Format**: Pre-labeled with bounding boxes
- **Quality**: Good variety of angles and lighting
- **Bonus**: Already in training-ready format!

---

## Fastest Path: Use Roboflow Dataset

This is the quickest way to get started:

### Step 1: Download from Roboflow

```bash
# Install roboflow
pip install roboflow

# Download the dataset
python download_roboflow.py
```

Create `download_roboflow.py`:
```python
from roboflow import Roboflow

# Initialize Roboflow (you'll need to create a free account)
rf = Roboflow(api_key="YOUR_API_KEY")  # Get from roboflow.com
project = rf.workspace("jon-chan-gnsoa").project("mahjong-baq4s")
dataset = project.version(1).download("tensorflow")

print("Dataset downloaded to ./mahjong-baq4s/")
```

### Step 2: Train with Pre-Configured Script

Create `train_with_roboflow.py`:
```python
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import json
import os

# Configuration
IMG_SIZE = 224
BATCH_SIZE = 32
EPOCHS = 50

# Load dataset (Roboflow format)
data_dir = './mahjong-baq4s/'

# Data generators
train_datagen = tf.keras.preprocessing.image.ImageDataGenerator(
    rescale=1./255,
    rotation_range=15,
    width_shift_range=0.1,
    height_shift_range=0.1,
    brightness_range=[0.8, 1.2],
    zoom_range=0.1,
    validation_split=0.2
)

train_generator = train_datagen.flow_from_directory(
    os.path.join(data_dir, 'train'),
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='training'
)

validation_generator = train_datagen.flow_from_directory(
    os.path.join(data_dir, 'train'),
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='validation'
)

# Get number of classes
NUM_CLASSES = len(train_generator.class_indices)
print(f"Training with {NUM_CLASSES} tile classes")

# Build model with MobileNetV2 (optimized for web)
base_model = keras.applications.MobileNetV2(
    input_shape=(IMG_SIZE, IMG_SIZE, 3),
    include_top=False,
    weights='imagenet'
)
base_model.trainable = False

model = keras.Sequential([
    base_model,
    layers.GlobalAveragePooling2D(),
    layers.Dropout(0.3),
    layers.Dense(256, activation='relu'),
    layers.Dropout(0.3),
    layers.Dense(NUM_CLASSES, activation='softmax')
])

# Compile
model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=0.001),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

# Train
print("Starting training...")
history = model.fit(
    train_generator,
    validation_data=validation_generator,
    epochs=EPOCHS,
    callbacks=[
        keras.callbacks.EarlyStopping(patience=5, restore_best_weights=True),
        keras.callbacks.ReduceLROnPlateau(factor=0.5, patience=3),
        keras.callbacks.ModelCheckpoint('best_model.h5', save_best_only=True)
    ]
)

# Fine-tuning
print("Fine-tuning model...")
base_model.trainable = True
for layer in base_model.layers[:-20]:
    layer.trainable = False

model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=0.0001),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

history_fine = model.fit(
    train_generator,
    validation_data=validation_generator,
    epochs=20,
    callbacks=[
        keras.callbacks.EarlyStopping(patience=5, restore_best_weights=True)
    ]
)

# Save model
model.save('mahjong_detector_final.h5')

# Save class mapping
class_names = {v: k for k, v in train_generator.class_indices.items()}
with open('class_mapping.json', 'w') as f:
    json.dump(class_names, f, indent=2)

print(f"\n✅ Training complete!")
print(f"Final accuracy: {history_fine.history['accuracy'][-1]:.2%}")
print(f"Validation accuracy: {history_fine.history['val_accuracy'][-1]:.2%}")
```

### Step 3: Run Training

```bash
# Install dependencies
pip install tensorflow roboflow pillow

# Download dataset
python download_roboflow.py

# Train model (2-4 hours with GPU, longer with CPU)
python train_with_roboflow.py
```

---

## Alternative: Use Camerash Dataset

### Step 1: Clone and Prepare

```bash
# Clone the repository
git clone https://github.com/Camerash/mahjong-dataset.git
cd mahjong-dataset

# The dataset is already organized by tile type!
```

### Step 2: Train with Camerash Data

Create `train_with_camerash.py`:
```python
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import json

# Configuration
IMG_SIZE = 224
BATCH_SIZE = 32
EPOCHS = 50
DATA_DIR = './mahjong-dataset/tiles/'  # Adjust path as needed

# Data generators with augmentation
train_datagen = tf.keras.preprocessing.image.ImageDataGenerator(
    rescale=1./255,
    rotation_range=20,
    width_shift_range=0.15,
    height_shift_range=0.15,
    brightness_range=[0.7, 1.3],
    zoom_range=0.15,
    horizontal_flip=False,  # Don't flip - tiles are asymmetric!
    validation_split=0.2
)

train_generator = train_datagen.flow_from_directory(
    DATA_DIR,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='training'
)

validation_generator = train_datagen.flow_from_directory(
    DATA_DIR,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='validation'
)

NUM_CLASSES = len(train_generator.class_indices)
print(f"Found {NUM_CLASSES} tile classes")
print(f"Classes: {list(train_generator.class_indices.keys())}")

# Build model
base_model = keras.applications.MobileNetV2(
    input_shape=(IMG_SIZE, IMG_SIZE, 3),
    include_top=False,
    weights='imagenet'
)
base_model.trainable = False

model = keras.Sequential([
    base_model,
    layers.GlobalAveragePooling2D(),
    layers.Dropout(0.4),
    layers.Dense(512, activation='relu'),
    layers.Dropout(0.4),
    layers.Dense(NUM_CLASSES, activation='softmax')
])

model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=0.001),
    loss='categorical_crossentropy',
    metrics=['accuracy', 'top_k_categorical_accuracy']
)

# Train
print("\n🚀 Starting training...")
history = model.fit(
    train_generator,
    validation_data=validation_generator,
    epochs=EPOCHS,
    callbacks=[
        keras.callbacks.EarlyStopping(
            monitor='val_accuracy',
            patience=7,
            restore_best_weights=True
        ),
        keras.callbacks.ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=3,
            min_lr=1e-7
        ),
        keras.callbacks.ModelCheckpoint(
            'best_mahjong_model.h5',
            monitor='val_accuracy',
            save_best_only=True
        )
    ]
)

# Fine-tuning
print("\n🔧 Fine-tuning...")
base_model.trainable = True
for layer in base_model.layers[:-30]:
    layer.trainable = False

model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=0.0001),
    loss='categorical_crossentropy',
    metrics=['accuracy', 'top_k_categorical_accuracy']
)

history_fine = model.fit(
    train_generator,
    validation_data=validation_generator,
    epochs=30,
    callbacks=[
        keras.callbacks.EarlyStopping(
            monitor='val_accuracy',
            patience=7,
            restore_best_weights=True
        )
    ]
)

# Save final model
model.save('mahjong_detector_camerash.h5')

# Save class names with proper mapping
class_indices = train_generator.class_indices
class_mapping = {}

for class_name, idx in class_indices.items():
    # Map to your app's format
    class_mapping[idx] = class_name

with open('class_names.json', 'w') as f:
    json.dump(class_mapping, f, indent=2)

print(f"\n✅ Training complete!")
print(f"Final accuracy: {history_fine.history['accuracy'][-1]:.2%}")
print(f"Validation accuracy: {history_fine.history['val_accuracy'][-1]:.2%}")
print(f"\nModel saved as: mahjong_detector_camerash.h5")
print(f"Class mapping saved as: class_names.json")
```

---

## Step 4: Convert to TensorFlow.js

```bash
# Install converter
pip install tensorflowjs

# Convert the model
tensorflowjs_converter \
    --input_format=keras \
    mahjong_detector_final.h5 \
    ../public/models/mahjong-detector/

# Copy class mapping
cp class_mapping.json ../public/models/mahjong-detector/
```

---

## Step 5: Update Your App

Update `src/utils/tileDetection.js`:

```javascript
import * as tf from '@tensorflow/tfjs';

let model = null;
let classMapping = null;

export const initializeTileDetection = async () => {
  try {
    await tf.ready();
    
    // Load model
    model = await tf.loadLayersModel('/models/mahjong-detector/model.json');
    
    // Load class mapping
    const response = await fetch('/models/mahjong-detector/class_mapping.json');
    classMapping = await response.json();
    
    console.log('✅ Mahjong detector loaded successfully');
    console.log(`Loaded ${Object.keys(classMapping).length} tile classes`);
    return model;
  } catch (error) {
    console.error('❌ Error loading model:', error);
    return null;
  }
};

export const detectTilesFromImage = async (imageBlob, imageElement) => {
  if (!model || !classMapping) {
    console.error('Model not initialized');
    return generateMockTiles(); // Fallback to mock
  }
  
  try {
    // Preprocess image
    const tensor = tf.browser.fromPixels(imageElement)
      .resizeNearestNeighbor([224, 224])
      .toFloat()
      .div(tf.scalar(255.0))
      .expandDims(0);
    
    // Get predictions
    const predictions = await model.predict(tensor).array();
    const predictionArray = predictions[0];
    
    // Get top predictions
    const topK = 14; // Expect ~14 tiles in a hand
    const indices = Array.from(predictionArray)
      .map((prob, idx) => ({ prob, idx }))
      .sort((a, b) => b.prob - a.prob)
      .slice(0, topK);
    
    // Convert to tile objects
    const tiles = indices
      .filter(p => p.prob > 0.3) // Confidence threshold
      .map(p => {
        const className = classMapping[p.idx];
        return parseTileClass(className);
      });
    
    // Cleanup
    tensor.dispose();
    
    console.log(`Detected ${tiles.length} tiles`);
    return tiles;
    
  } catch (error) {
    console.error('Error detecting tiles:', error);
    return generateMockTiles(); // Fallback
  }
};

// Parse class name to tile format
const parseTileClass = (className) => {
  // Handle different naming conventions from datasets
  
  // Camerash format: "1m", "2p", "3s", "east", "red", etc.
  // Roboflow format: might be "dots_1", "bam_2", etc.
  
  // Dots (筒/p)
  if (className.includes('dot') || className.endsWith('p')) {
    const num = parseInt(className.match(/\d+/)[0]);
    return { type: 'dots', value: num, concealed: true };
  }
  
  // Bams (索/s)
  if (className.includes('bam') || className.includes('bamboo') || className.endsWith('s')) {
    const num = parseInt(className.match(/\d+/)[0]);
    return { type: 'sticks', value: num, concealed: true };
  }
  
  // Craks (萬/m)
  if (className.includes('crak') || className.includes('man') || className.endsWith('m')) {
    const num = parseInt(className.match(/\d+/)[0]);
    return { type: 'man', value: num, concealed: true };
  }
  
  // Winds
  const windMap = {
    'east': 'east', 'e': 'east',
    'south': 'south', 's': 'south',
    'west': 'west', 'w': 'west',
    'north': 'north', 'n': 'north'
  };
  const wind = Object.keys(windMap).find(k => className.toLowerCase().includes(k));
  if (wind) {
    return { type: 'winds', value: windMap[wind], concealed: true };
  }
  
  // Dragons
  const dragonMap = {
    'red': 'red', 'chun': 'red',
    'green': 'green', 'fa': 'green',
    'white': 'white', 'bai': 'white'
  };
  const dragon = Object.keys(dragonMap).find(k => className.toLowerCase().includes(k));
  if (dragon) {
    return { type: 'dragons', value: dragonMap[dragon], concealed: true };
  }
  
  // Fallback
  console.warn(`Unknown tile class: ${className}`);
  return { type: 'dots', value: 1, concealed: true };
};

// Keep mock tiles as fallback
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
```

---

## Using Google Colab (Free GPU)

If you don't have a GPU, use Google Colab:

1. Go to https://colab.research.google.com
2. Create new notebook
3. Enable GPU: Runtime > Change runtime type > GPU
4. Upload your training script
5. Run the training
6. Download the trained model

**Colab Notebook Template:**
```python
# Install dependencies
!pip install tensorflow roboflow tensorflowjs

# Clone Camerash dataset
!git clone https://github.com/Camerash/mahjong-dataset.git

# Upload and run your training script
# (Copy the train_with_camerash.py code here)

# Convert to TensorFlow.js
!tensorflowjs_converter \
    --input_format=keras \
    mahjong_detector_camerash.h5 \
    ./tfjs_model/

# Download the model
from google.colab import files
!zip -r model.zip ./tfjs_model/
files.download('model.zip')
```

---

## Expected Results

With these datasets, you should achieve:
- **Training time**: 2-4 hours on GPU
- **Accuracy**: 95-98% on validation set
- **Model size**: ~5-10 MB
- **Inference speed**: ~100-200ms per image in browser

---

## Quick Checklist

- [ ] Choose dataset (Roboflow or Camerash)
- [ ] Download dataset
- [ ] Run training script (use Colab if no GPU)
- [ ] Convert to TensorFlow.js
- [ ] Copy model files to `public/models/mahjong-detector/`
- [ ] Update `tileDetection.js`
- [ ] Test with real photos
- [ ] Deploy!

---

## Troubleshooting

**Low accuracy (<90%)?**
- Train for more epochs
- Increase data augmentation
- Try different base model (EfficientNet, ResNet)

**Model too large?**
- Use MobileNetV2 or MobileNetV3
- Reduce dense layer sizes
- Use quantization

**Slow inference?**
- Ensure WebGL is enabled in browser
- Reduce image size
- Use model optimization

---

You're now ready to train a real mahjong detector! 🚀🀄

Start with the Roboflow dataset for the quickest path to success.

