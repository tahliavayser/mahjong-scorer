# ========================================
# 🀄 MAHJONG TILE DETECTOR TRAINING
# Using Roboflow Dataset (Already Organized!)
# ========================================

print("🀄 Starting Mahjong Tile Detector Training")
print("=" * 60)

# Install dependencies
print("\n📦 Installing dependencies...")
!pip install -q tensorflow tensorflowjs roboflow

# Download Roboflow dataset (already organized by class!)
print("\n📥 Downloading Roboflow mahjong dataset...")
print("⚠️  You'll need a Roboflow API key (free account)")
print("   Sign up at: https://roboflow.com")
print("   Get your API key from: https://app.roboflow.com/settings/api")

# You need to create a free Roboflow account and get your API key
# Then replace YOUR_API_KEY below
API_KEY = input("Enter your Roboflow API key: ")

from roboflow import Roboflow
rf = Roboflow(api_key=API_KEY)
project = rf.workspace("jon-chan-gnsoa").project("mahjong-baq4s")
dataset = project.version(2).download("folder")

print("✅ Dataset downloaded and organized!")

# Find the data directory
import os
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import json
from datetime import datetime

# Roboflow organizes as: train/, valid/, test/
DATA_DIR = './mahjong-baq4s-2/train/'

if not os.path.exists(DATA_DIR):
    # Try to find it
    for root, dirs, files in os.walk('.'):
        if 'train' in dirs:
            DATA_DIR = os.path.join(root, 'train')
            break

print(f"\n📂 Using data directory: {DATA_DIR}")

# Count classes
classes = [d for d in os.listdir(DATA_DIR) if os.path.isdir(os.path.join(DATA_DIR, d))]
print(f"✅ Found {len(classes)} tile classes")
print(f"Sample classes: {classes[:10]}")

# Configuration
IMG_SIZE = 224
BATCH_SIZE = 32
EPOCHS = 50

print(f"\n⚙️  Configuration:")
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

