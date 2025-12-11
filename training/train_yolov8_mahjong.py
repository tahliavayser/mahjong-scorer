# ========================================
# 🀄 YOLOv8 Mahjong Tile Detector
# Train and Export to TensorFlow.js
# ========================================
#
# Run this in Google Colab with GPU enabled!
# Runtime → Change runtime type → GPU
# ========================================

print("🀄 YOLOv8 Mahjong Tile Detector Training")
print("=" * 60)

# Step 1: Install dependencies
print("\n📦 Step 1: Installing dependencies...")
!pip install -q ultralytics roboflow tensorflowjs

# Step 2: Import libraries
print("\n📚 Step 2: Importing libraries...")
from ultralytics import YOLO
from roboflow import Roboflow
import os
import shutil

# Step 3: Download dataset from Roboflow
print("\n📥 Step 3: Downloading Mahjong dataset from Roboflow...")
print("=" * 60)

# You'll need a Roboflow API key
# Get one free at: https://app.roboflow.com/settings/api
print("""
To download the dataset, you need a Roboflow API key:

1. Go to: https://app.roboflow.com
2. Create a free account
3. Go to Settings → API Keys
4. Copy your API key
""")

api_key = input("Enter your Roboflow API key: ")

try:
    rf = Roboflow(api_key=api_key)
    
    # Try to find a mahjong dataset
    # This uses jon-chan-gnsoa/mahjong-baq4s from earlier
    print("\n🔍 Searching for mahjong dataset...")
    
    project = rf.workspace("jon-chan-gnsoa").project("mahjong-baq4s")
    dataset = project.version(1).download("yolov8")
    
    print("✅ Dataset downloaded!")
    data_yaml_path = f"{dataset.location}/data.yaml"
    
except Exception as e:
    print(f"\n⚠️ Roboflow download failed: {e}")
    print("\nTrying alternative dataset...")
    
    # Alternative: Create minimal dataset for testing
    print("\n📝 Creating sample dataset structure...")
    
    os.makedirs('mahjong_dataset/images/train', exist_ok=True)
    os.makedirs('mahjong_dataset/images/val', exist_ok=True)
    os.makedirs('mahjong_dataset/labels/train', exist_ok=True)
    os.makedirs('mahjong_dataset/labels/val', exist_ok=True)
    
    data_yaml = """
path: ./mahjong_dataset
train: images/train
val: images/val

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
    
    with open('mahjong_dataset/data.yaml', 'w') as f:
        f.write(data_yaml)
    
    data_yaml_path = 'mahjong_dataset/data.yaml'
    print("⚠️ Sample structure created. You need to add images and labels!")

# Step 4: Train YOLOv8
print("\n" + "=" * 60)
print("🚀 Step 4: Training YOLOv8 model...")
print("=" * 60)

# Load YOLOv8 nano model (smallest, fastest)
model = YOLO('yolov8n.pt')

# Train on mahjong dataset
print("\n🏋️ Starting training...")
print("This will take 1-3 hours depending on dataset size.")

try:
    results = model.train(
        data=data_yaml_path,
        epochs=100,
        imgsz=640,
        batch=16,
        patience=20,
        device=0,  # Use GPU
        project='mahjong_detector',
        name='train'
    )
    print("\n✅ Training complete!")
except Exception as e:
    print(f"\n❌ Training failed: {e}")
    print("Make sure you have images in the dataset folders!")
    raise

# Step 5: Export to TensorFlow.js
print("\n" + "=" * 60)
print("🔄 Step 5: Exporting to TensorFlow.js...")
print("=" * 60)

# Load the best trained model
best_model_path = 'mahjong_detector/train/weights/best.pt'
trained_model = YOLO(best_model_path)

# Export to TensorFlow.js
trained_model.export(format='tfjs')

print("✅ Export complete!")

# Step 6: Package for download
print("\n" + "=" * 60)
print("📦 Step 6: Packaging model for download...")
print("=" * 60)

# Find the exported model
tfjs_path = best_model_path.replace('.pt', '_web_model')
if os.path.exists(tfjs_path):
    # Create zip for download
    shutil.make_archive('mahjong_tfjs_model', 'zip', tfjs_path)
    print("✅ Model packaged!")
    
    # Download
    from google.colab import files
    files.download('mahjong_tfjs_model.zip')
    
    print("\n📥 Downloading mahjong_tfjs_model.zip...")
else:
    print(f"⚠️ TF.js model not found at {tfjs_path}")
    print("Checking alternative locations...")
    !find . -name "*web_model*" -type d

# Final instructions
print("\n" + "=" * 60)
print("🎉 TRAINING & EXPORT COMPLETE!")
print("=" * 60)
print("""
Next steps:

1. Extract mahjong_tfjs_model.zip

2. Copy the contents to your app:
   public/models/mahjong-detector/
   ├── model.json
   └── group1-shard*.bin

3. Update tileDetection.js to use the new model

4. Test your app!

The model is now ready for browser-based mahjong tile detection! 🀄
""")

