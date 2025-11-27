# ========================================
# 🀄 MAHJONG TILE DETECTOR TRAINING
# ========================================

print("🀄 Starting Mahjong Tile Detector Training")
print("=" * 60)

# Install dependencies
print("\n📦 Installing dependencies...")
!pip install -q tensorflow tensorflowjs

# Download Camerash dataset
print("\n📥 Downloading Camerash mahjong dataset...")
!git clone https://github.com/Camerash/mahjong-dataset.git
print("✅ Dataset downloaded!")

# Import libraries
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import json
from datetime import datetime

# Configuration
IMG_SIZE = 224
BATCH_SIZE = 32
EPOCHS = 50

# Find the correct data directory
import os
print("\n🔍 Checking dataset structure...")
if os.path.exists('./mahjong-dataset/tiles/'):
    DATA_DIR = './mahjong-dataset/tiles/'
elif os.path.exists('./mahjong-dataset/'):
    # List what's in the dataset
    contents = os.listdir('./mahjong-dataset/')
    print(f"   Found in dataset: {contents}")
    # Look for a directory with images
    for item in contents:
        item_path = os.path.join('./mahjong-dataset/', item)
        if os.path.isdir(item_path):
            # Check if it has subdirectories (tile classes)
            subdirs = [d for d in os.listdir(item_path) if os.path.isdir(os.path.join(item_path, d))]
            if len(subdirs) > 10:  # Should have 34 tile classes
                DATA_DIR = item_path
                print(f"   Using directory: {DATA_DIR}")
                break
    else:
        # Default fallback
        DATA_DIR = './mahjong-dataset/'
else:
    raise FileNotFoundError("Dataset not found!")

print(f"\n⚙️  Configuration:")
print(f"   Data directory: {DATA_DIR}")
print(f"   Image size: {IMG_SIZE}x{IMG_SIZE}")
print(f"   Batch size: {BATCH_SIZE}")
print(f"   Epochs: {EPOCHS}")

# Data augmentation
print("\n🎨 Setting up data augmentation...")
train_datagen = tf.keras.preprocessing.image.ImageDataGenerator(
    rescale=1./255,
    rotation_range=20,
    width_shift_range=0.15,
    height_shift_range=0.15,
    brightness_range=[0.7, 1.3],
    zoom_range=0.15,
    validation_split=0.2
)

# Load data
print("\n📂 Loading training data...")
train_generator = train_datagen.flow_from_directory(
    DATA_DIR,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='training',
    shuffle=True
)

validation_generator = train_datagen.flow_from_directory(
    DATA_DIR,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='validation',
    shuffle=False
)

NUM_CLASSES = len(train_generator.class_indices)
print(f"\n✅ Data loaded successfully!")
print(f"   Classes: {NUM_CLASSES}")
print(f"   Training samples: {train_generator.samples}")
print(f"   Validation samples: {validation_generator.samples}")

# Build model
print("\n🏗️  Building model with MobileNetV2...")
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
    optimizer=keras.optimizers.Adam(0.001),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

print(f"✅ Model built! Total parameters: {model.count_params():,}")

# Train Phase 1
print("\n" + "=" * 60)
print("🚀 PHASE 1: Transfer Learning")
print("=" * 60)

history = model.fit(
    train_generator,
    validation_data=validation_generator,
    epochs=EPOCHS,
    callbacks=[
        keras.callbacks.EarlyStopping(
            monitor='val_accuracy',
            patience=7,
            restore_best_weights=True,
            verbose=1
        ),
        keras.callbacks.ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=3,
            verbose=1
        )
    ],
    verbose=1
)

print(f"\n✅ Phase 1 Complete!")
print(f"   Best accuracy: {max(history.history['val_accuracy']):.2%}")

# Fine-tuning Phase 2
print("\n" + "=" * 60)
print("🔧 PHASE 2: Fine-Tuning")
print("=" * 60)

base_model.trainable = True
for layer in base_model.layers[:-30]:
    layer.trainable = False

model.compile(
    optimizer=keras.optimizers.Adam(0.0001),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

history_fine = model.fit(
    train_generator,
    validation_data=validation_generator,
    epochs=30,
    callbacks=[
        keras.callbacks.EarlyStopping(
            monitor='val_accuracy',
            patience=7,
            restore_best_weights=True,
            verbose=1
        )
    ],
    verbose=1
)

print(f"\n✅ Phase 2 Complete!")
print(f"   Final accuracy: {history_fine.history['val_accuracy'][-1]:.2%}")

# Save model
print("\n💾 Saving model...")
model.save('mahjong_detector.h5')

# Save class mapping
class_mapping = {v: k for k, v in train_generator.class_indices.items()}
with open('class_mapping.json', 'w') as f:
    json.dump(class_mapping, f, indent=2)

print("✅ Model saved!")

# Convert to TensorFlow.js
print("\n🔄 Converting to TensorFlow.js...")
!tensorflowjs_converter \
    --input_format=keras \
    --output_format=tfjs_graph_model \
    mahjong_detector.h5 \
    ./tfjs_model/

!cp class_mapping.json ./tfjs_model/

print("✅ Converted to TensorFlow.js!")

# Zip and download
print("\n📦 Preparing download...")
!zip -r mahjong_model.zip ./tfjs_model/

from google.colab import files
files.download('mahjong_model.zip')

# Final summary
print("\n" + "=" * 60)
print("🎉 TRAINING COMPLETE!")
print("=" * 60)
print(f"Final Training Accuracy: {history_fine.history['accuracy'][-1]:.2%}")
print(f"Final Validation Accuracy: {history_fine.history['val_accuracy'][-1]:.2%}")
print("\n📥 mahjong_model.zip is downloading...")
print("\n✅ Next Steps:")
print("   1. Extract mahjong_model.zip")
print("   2. Copy contents to: public/models/mahjong-detector/")
print("   3. Test your app!")
print("=" * 60)

