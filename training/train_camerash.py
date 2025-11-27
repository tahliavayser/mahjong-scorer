#!/usr/bin/env python3
"""
Train Mahjong Tile Detector using Camerash Dataset
"""

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import json
import os
from datetime import datetime

print("🀄 Mahjong Tile Detector Training")
print("=" * 50)

# Configuration
IMG_SIZE = 224
BATCH_SIZE = 32
EPOCHS = 50
DATA_DIR = './mahjong-dataset/tiles/'

# Check if dataset exists
if not os.path.exists(DATA_DIR):
    print("❌ Dataset not found!")
    print("Please run: bash download_camerash.sh")
    exit(1)

print(f"📂 Using dataset: {DATA_DIR}")
print(f"🖼️  Image size: {IMG_SIZE}x{IMG_SIZE}")
print(f"📦 Batch size: {BATCH_SIZE}")
print(f"🔄 Epochs: {EPOCHS}")
print()

# Data augmentation
print("🎨 Setting up data augmentation...")
train_datagen = tf.keras.preprocessing.image.ImageDataGenerator(
    rescale=1./255,
    rotation_range=20,
    width_shift_range=0.15,
    height_shift_range=0.15,
    brightness_range=[0.7, 1.3],
    zoom_range=0.15,
    fill_mode='nearest',
    validation_split=0.2
)

# Load data
print("📥 Loading training data...")
train_generator = train_datagen.flow_from_directory(
    DATA_DIR,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='training',
    shuffle=True
)

print("📥 Loading validation data...")
validation_generator = train_datagen.flow_from_directory(
    DATA_DIR,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='validation',
    shuffle=False
)

NUM_CLASSES = len(train_generator.class_indices)
print(f"\n✅ Found {NUM_CLASSES} tile classes")
print(f"📊 Training samples: {train_generator.samples}")
print(f"📊 Validation samples: {validation_generator.samples}")
print(f"\n🏷️  Classes: {list(train_generator.class_indices.keys())[:10]}...")
print()

# Build model
print("🏗️  Building model with MobileNetV2...")
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
    layers.BatchNormalization(),
    layers.Dropout(0.4),
    layers.Dense(NUM_CLASSES, activation='softmax')
], name='mahjong_detector')

model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=0.001),
    loss='categorical_crossentropy',
    metrics=['accuracy', keras.metrics.TopKCategoricalAccuracy(k=3, name='top_3_accuracy')]
)

print(f"\n📋 Model Summary:")
print(f"Total parameters: {model.count_params():,}")
print()

# Callbacks
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
callbacks = [
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
        min_lr=1e-7,
        verbose=1
    ),
    keras.callbacks.ModelCheckpoint(
        f'best_model_{timestamp}.h5',
        monitor='val_accuracy',
        save_best_only=True,
        verbose=1
    ),
    keras.callbacks.CSVLogger(f'training_log_{timestamp}.csv')
]

# Train
print("🚀 Starting training (Phase 1: Transfer Learning)...")
print("=" * 50)
history = model.fit(
    train_generator,
    validation_data=validation_generator,
    epochs=EPOCHS,
    callbacks=callbacks,
    verbose=1
)

print("\n" + "=" * 50)
print("✅ Phase 1 Complete!")
print(f"Best accuracy: {max(history.history['accuracy']):.2%}")
print(f"Best validation accuracy: {max(history.history['val_accuracy']):.2%}")

# Fine-tuning
print("\n🔧 Starting fine-tuning (Phase 2)...")
print("=" * 50)
base_model.trainable = True
for layer in base_model.layers[:-30]:
    layer.trainable = False

print(f"Trainable layers: {sum([1 for layer in model.layers if layer.trainable])}")

model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=0.0001),
    loss='categorical_crossentropy',
    metrics=['accuracy', keras.metrics.TopKCategoricalAccuracy(k=3, name='top_3_accuracy')]
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
        ),
        keras.callbacks.ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=3,
            min_lr=1e-8,
            verbose=1
        )
    ],
    verbose=1
)

print("\n" + "=" * 50)
print("✅ Phase 2 Complete!")

# Save final model
final_model_name = f'mahjong_detector_{timestamp}.h5'
model.save(final_model_name)
print(f"\n💾 Model saved: {final_model_name}")

# Save class mapping
class_indices = train_generator.class_indices
class_mapping = {v: k for k, v in class_indices.items()}

mapping_file = f'class_mapping_{timestamp}.json'
with open(mapping_file, 'w') as f:
    json.dump(class_mapping, f, indent=2)
print(f"💾 Class mapping saved: {mapping_file}")

# Final results
print("\n" + "=" * 50)
print("🎉 TRAINING COMPLETE!")
print("=" * 50)
print(f"Final Training Accuracy: {history_fine.history['accuracy'][-1]:.2%}")
print(f"Final Validation Accuracy: {history_fine.history['val_accuracy'][-1]:.2%}")
print(f"Final Top-3 Accuracy: {history_fine.history['top_3_accuracy'][-1]:.2%}")
print()
print("📦 Next Steps:")
print(f"1. Convert to TensorFlow.js:")
print(f"   tensorflowjs_converter --input_format=keras {final_model_name} ../public/models/mahjong-detector/")
print(f"2. Copy class mapping:")
print(f"   cp {mapping_file} ../public/models/mahjong-detector/")
print(f"3. Test in your app!")
print()

