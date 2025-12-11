# ========================================
# 🀄 YOLO to TensorFlow.js Conversion
# For Mahjong Tile Detection
# ========================================
# 
# This script converts a YOLO/Darknet model to TensorFlow.js
# for use in browser-based mahjong tile detection.
#
# Run this in Google Colab with GPU enabled.
# ========================================

print("🀄 YOLO to TensorFlow.js Converter")
print("=" * 60)

# Install dependencies
print("\n📦 Installing dependencies...")
!pip install -q tensorflow tensorflowjs

# Clone the Mahjong Detection repo
print("\n📥 Cloning Mahjong Detection repository...")
!git clone https://github.com/lissa2077/Mahjong-Detection.git
!ls Mahjong-Detection/

# Check what's available
print("\n🔍 Checking repository contents...")
!ls -la Mahjong-Detection/
!ls -la Mahjong-Detection/darknet/ 2>/dev/null || echo "No darknet folder"

# The repo doesn't include trained weights, so we need to either:
# 1. Train using their setup
# 2. Use a different pre-trained mahjong model

print("\n" + "=" * 60)
print("⚠️  IMPORTANT: Trained weights not included in repo")
print("=" * 60)
print("""
The lissa2077/Mahjong-Detection repo doesn't include the trained
weights file. You have these options:

OPTION 1: Train your own model using their Colab notebooks
  - Check: Mahjong-Detection/Colab Notebooks/
  - This requires the training dataset

OPTION 2: Use YOLOv5 with a mahjong dataset (easier)
  - We can use ultralytics/yolov5 which has better TF.js support

OPTION 3: Use a simpler classification approach
  - Train a tile classifier instead of object detector
  - Works well for clear photos of arranged tiles

Let's try Option 2 - it's the most straightforward path.
""")

# ========================================
# OPTION 2: YOLOv5 Approach (Recommended)
# ========================================

print("\n" + "=" * 60)
print("🚀 Setting up YOLOv5 for Mahjong Detection")
print("=" * 60)

# Install YOLOv5
!pip install -q ultralytics

from ultralytics import YOLO
import os
import json

# Check if we have a dataset to train on
print("\n📂 Checking for training data...")

# Create a sample dataset structure for reference
sample_structure = """
Your dataset should be organized like this:

mahjong_dataset/
├── images/
│   ├── train/
│   │   ├── img001.jpg
│   │   ├── img002.jpg
│   │   └── ...
│   └── val/
│       ├── img101.jpg
│       └── ...
├── labels/
│   ├── train/
│   │   ├── img001.txt  (YOLO format: class x_center y_center width height)
│   │   └── ...
│   └── val/
│       └── ...
└── data.yaml
"""

print(sample_structure)

# Create a data.yaml template
data_yaml = """
# Mahjong Tile Detection Dataset
path: ./mahjong_dataset
train: images/train
val: images/val

# 34 mahjong tile classes
names:
  0: 1_dot
  1: 2_dot
  2: 3_dot
  3: 4_dot
  4: 5_dot
  5: 6_dot
  6: 7_dot
  7: 8_dot
  8: 9_dot
  9: 1_bam
  10: 2_bam
  11: 3_bam
  12: 4_bam
  13: 5_bam
  14: 6_bam
  15: 7_bam
  16: 8_bam
  17: 9_bam
  18: 1_crak
  19: 2_crak
  20: 3_crak
  21: 4_crak
  22: 5_crak
  23: 6_crak
  24: 7_crak
  25: 8_crak
  26: 9_crak
  27: east
  28: south
  29: west
  30: north
  31: red_dragon
  32: green_dragon
  33: white_dragon
"""

print("\n📝 Sample data.yaml:")
print(data_yaml)

# Save template
os.makedirs('mahjong_dataset', exist_ok=True)
with open('mahjong_dataset/data.yaml', 'w') as f:
    f.write(data_yaml)

print("\n" + "=" * 60)
print("📋 NEXT STEPS")
print("=" * 60)
print("""
To complete the training and conversion:

1. PREPARE YOUR DATASET
   - Collect mahjong tile images (or use Roboflow)
   - Annotate them with bounding boxes (use Roboflow or LabelImg)
   - Organize in the structure shown above

2. TRAIN THE MODEL
   Run this code after preparing your dataset:
   
   from ultralytics import YOLO
   model = YOLO('yolov8n.pt')  # Start with nano model
   model.train(data='mahjong_dataset/data.yaml', epochs=100)

3. EXPORT TO TENSORFLOW.JS
   After training:
   
   model.export(format='tfjs')

4. DOWNLOAD AND USE
   The exported model will be in runs/detect/train/weights/
   Download and add to your app's public/models/ folder

ALTERNATIVE: Use Roboflow (Easiest!)
   1. Go to https://universe.roboflow.com
   2. Search for "mahjong tiles"
   3. Find a dataset with annotations
   4. Export in YOLOv8 format
   5. Train with the code above
""")

# ========================================
# Quick Demo: Export a base YOLOv8 model
# ========================================

print("\n" + "=" * 60)
print("🎯 Demo: Exporting base YOLOv8 to TensorFlow.js")
print("=" * 60)

try:
    # Load a pre-trained YOLOv8 nano model
    model = YOLO('yolov8n.pt')
    
    # Export to TensorFlow.js format
    print("\n🔄 Exporting to TensorFlow.js format...")
    model.export(format='tfjs')
    
    print("\n✅ Export successful!")
    print("This demonstrates the export process works.")
    print("You'll need to train on mahjong tiles for actual detection.")
    
    # Show exported files
    !ls -la yolov8n_web_model/ 2>/dev/null || echo "Check runs/ folder for output"
    
except Exception as e:
    print(f"\n❌ Export demo failed: {e}")
    print("This is expected if dependencies are missing.")

print("\n" + "=" * 60)
print("🏁 SUMMARY")
print("=" * 60)
print("""
To get mahjong tile detection working:

EASIEST PATH:
1. Go to Roboflow Universe
2. Find a mahjong tile dataset
3. Train with YOLOv8
4. Export to TensorFlow.js
5. Add to your app

The conversion pipeline is:
  YOLOv8 (.pt) → TensorFlow.js (model.json + weights)

YOLOv8 has built-in TF.js export, making this much easier
than converting from Darknet/YOLOv3!
""")

