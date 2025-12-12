# ========================================
# 🀄 Train YOLOv8 from Downloaded Dataset
# ========================================
#
# You already downloaded a YOLOv8 dataset zip from Roboflow.
# This script will train on it and export to TensorFlow.js.
#
# Run in Google Colab with GPU enabled!
# ========================================

print("🀄 YOLOv8 Training from Downloaded Dataset")
print("=" * 60)

# Step 1: Install dependencies
print("\n📦 Step 1: Installing dependencies...")
!pip install -q ultralytics

# Step 2: Upload your dataset zip
print("\n📤 Step 2: Upload your dataset zip file...")
print("Click the 'Choose Files' button below and select your downloaded zip.")

from google.colab import files
import zipfile
import os

uploaded = files.upload()

# Get the uploaded filename
zip_filename = list(uploaded.keys())[0]
print(f"\n✅ Uploaded: {zip_filename}")

# Step 3: Extract the dataset
print("\n📂 Step 3: Extracting dataset...")
with zipfile.ZipFile(zip_filename, 'r') as zip_ref:
    zip_ref.extractall('mahjong_dataset')

print("✅ Extracted!")

# Show contents
print("\n📁 Dataset contents:")
!ls -la mahjong_dataset/
!find mahjong_dataset -name "*.yaml" | head -5

# Find the data.yaml file
import glob
yaml_files = glob.glob('mahjong_dataset/**/data.yaml', recursive=True)
if not yaml_files:
    yaml_files = glob.glob('mahjong_dataset/**/*.yaml', recursive=True)

if yaml_files:
    data_yaml_path = yaml_files[0]
    print(f"\n✅ Found config: {data_yaml_path}")
else:
    # Try common locations
    possible_paths = [
        'mahjong_dataset/data.yaml',
        'mahjong_dataset/dataset.yaml',
    ]
    for p in possible_paths:
        if os.path.exists(p):
            data_yaml_path = p
            break
    else:
        print("❌ Could not find data.yaml")
        print("Listing all files:")
        !find mahjong_dataset -type f | head -20
        data_yaml_path = input("Enter the path to data.yaml: ").strip()

# Show the yaml contents
print(f"\n📋 Dataset config ({data_yaml_path}):")
!cat {data_yaml_path}

# Fix paths in data.yaml if needed (Roboflow sometimes uses absolute paths)
print("\n🔧 Fixing dataset paths...")
with open(data_yaml_path, 'r') as f:
    yaml_content = f.read()

# Get the directory containing data.yaml
dataset_dir = os.path.dirname(os.path.abspath(data_yaml_path))

# Update the yaml to use relative paths
import yaml

with open(data_yaml_path, 'r') as f:
    data_config = yaml.safe_load(f)

# Fix the path to be the dataset directory
data_config['path'] = dataset_dir

with open(data_yaml_path, 'w') as f:
    yaml.dump(data_config, f)

print("✅ Paths fixed!")
print(f"Dataset path: {dataset_dir}")

# Count images
print("\n📷 Counting training images...")
!find {dataset_dir} -name "*.jpg" -o -name "*.png" | wc -l

# Step 4: Train YOLOv8
print("\n" + "=" * 60)
print("🚀 Step 4: Training YOLOv8 model...")
print("=" * 60)

from ultralytics import YOLO

# Load YOLOv8 nano model
model = YOLO('yolov8n.pt')

# Train
print("\n🏋️ Starting training...")
print("This typically takes 30-60 minutes.")

results = model.train(
    data=data_yaml_path,
    epochs=50,
    imgsz=640,
    batch=16,
    patience=15,
    device=0,
    project='mahjong_detector',
    name='train',
    exist_ok=True
)

print("\n✅ Training complete!")

# Show results
print("\n📊 Training Results:")
print(f"Best mAP50: {results.results_dict.get('metrics/mAP50(B)', 'N/A')}")

# Step 5: Export to TensorFlow.js
print("\n" + "=" * 60)
print("🔄 Step 5: Exporting to TensorFlow.js...")
print("=" * 60)

best_model_path = 'mahjong_detector/train/weights/best.pt'
trained_model = YOLO(best_model_path)

# Export to TF.js
trained_model.export(format='tfjs')
print("✅ Export complete!")

# Step 6: Package and download
print("\n" + "=" * 60)
print("📦 Step 6: Packaging for download...")
print("=" * 60)

import shutil

# Find TF.js model
tfjs_path = 'mahjong_detector/train/weights/best_web_model'
if not os.path.exists(tfjs_path):
    !find . -name "*_web_model" -type d
    tfjs_path = input("Enter TF.js model path: ").strip()

if os.path.exists(tfjs_path):
    # Zip it
    shutil.make_archive('mahjong_tfjs_model', 'zip', tfjs_path)
    
    print("\n📂 Model contents:")
    !ls -la {tfjs_path}
    
    # Download
    files.download('mahjong_tfjs_model.zip')
    print("\n📥 Downloading mahjong_tfjs_model.zip...")
    
    # Also download PyTorch model as backup
    if os.path.exists(best_model_path):
        files.download(best_model_path)
        print("📥 Also downloading best.pt...")

print("\n" + "=" * 60)
print("🎉 ALL DONE!")
print("=" * 60)
print("""
You should have downloaded:
  ✅ mahjong_tfjs_model.zip - For browser use

Next steps:
1. Extract the zip file
2. Copy contents to: mahjong-scorer/public/models/mahjong-detector/
3. The app will use it automatically!

🀄 Happy mahjong scoring!
""")

