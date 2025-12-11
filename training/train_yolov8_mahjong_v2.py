# ========================================
# 🀄 YOLOv8 Mahjong Tile Detector v2
# Train and Export to TensorFlow.js
# ========================================
#
# Run this in Google Colab with GPU enabled!
# Runtime → Change runtime type → GPU
# ========================================

print("🀄 YOLOv8 Mahjong Tile Detector Training v2")
print("=" * 60)

# Step 1: Install dependencies
print("\n📦 Step 1: Installing dependencies...")
!pip install -q ultralytics roboflow

# Step 2: Import libraries
print("\n📚 Step 2: Importing libraries...")
from ultralytics import YOLO
from roboflow import Roboflow
import os
import shutil

# Step 3: Download dataset from Roboflow
print("\n📥 Step 3: Downloading Mahjong dataset from Roboflow...")
print("=" * 60)

print("""
To download the dataset, you need a Roboflow API key:

1. Go to: https://app.roboflow.com
2. Create a free account  
3. Go to Settings → API Keys
4. Copy your API key
""")

api_key = input("Enter your Roboflow API key: ").strip()

dataset_downloaded = False
data_yaml_path = None

# Try multiple mahjong datasets on Roboflow
datasets_to_try = [
    # Format: (workspace, project, version)
    ("mahjong-cwnef", "mahjong-6bgsu", 1),
    ("mahjong-cwnef", "mahjong-6bgsu", 2),
    ("mahjong-tiles-fgxnc", "mahjong-tiles", 1),
    ("mahjong-udlwb", "mahjong-ymhxw", 1),
    ("object-detection-xhguw", "mahjong-tiles-9gfwd", 1),
]

rf = Roboflow(api_key=api_key)

for workspace, project_name, version in datasets_to_try:
    try:
        print(f"\n🔍 Trying: {workspace}/{project_name} v{version}...")
        project = rf.workspace(workspace).project(project_name)
        dataset = project.version(version).download("yolov8")
        data_yaml_path = f"{dataset.location}/data.yaml"
        dataset_downloaded = True
        print(f"✅ Successfully downloaded: {workspace}/{project_name}")
        break
    except Exception as e:
        print(f"   ❌ Not available: {e}")
        continue

# If none of the known datasets worked, let user search
if not dataset_downloaded:
    print("\n" + "=" * 60)
    print("⚠️  Pre-configured datasets not available.")
    print("=" * 60)
    print("""
Let's search for a mahjong dataset on Roboflow Universe:

1. Go to: https://universe.roboflow.com/search?q=mahjong
2. Find a dataset with "Object Detection" type
3. Click on it and note the:
   - Workspace name (in the URL after roboflow.com/)
   - Project name
   - Version number

Example URL: https://universe.roboflow.com/my-workspace/mahjong-tiles/1
   Workspace: my-workspace
   Project: mahjong-tiles
   Version: 1
""")
    
    workspace = input("Enter workspace name: ").strip()
    project_name = input("Enter project name: ").strip()
    version = int(input("Enter version number: ").strip())
    
    try:
        print(f"\n🔍 Downloading {workspace}/{project_name} v{version}...")
        project = rf.workspace(workspace).project(project_name)
        dataset = project.version(version).download("yolov8")
        data_yaml_path = f"{dataset.location}/data.yaml"
        dataset_downloaded = True
        print("✅ Dataset downloaded!")
    except Exception as e:
        print(f"❌ Failed to download: {e}")

if not dataset_downloaded:
    print("\n" + "=" * 60)
    print("❌ Could not download any dataset.")
    print("=" * 60)
    print("""
ALTERNATIVE: Download dataset manually

1. Go to https://universe.roboflow.com/search?q=mahjong
2. Find a dataset and click "Download"
3. Select "YOLOv8" format
4. Download and upload to Colab
5. Update data_yaml_path variable below

Or try the Camerash dataset approach from earlier.
""")
    raise Exception("No dataset available. See instructions above.")

# Show dataset info
print("\n📊 Dataset info:")
!cat {data_yaml_path}

# Count images
print("\n📷 Counting images...")
!find $(dirname {data_yaml_path}) -name "*.jpg" -o -name "*.png" | wc -l

# Step 4: Train YOLOv8
print("\n" + "=" * 60)
print("🚀 Step 4: Training YOLOv8 model...")
print("=" * 60)

# Load YOLOv8 nano model (smallest, fastest)
model = YOLO('yolov8n.pt')

# Train on mahjong dataset
print("\n🏋️ Starting training...")
print("This will take 30min - 2 hours depending on dataset size.")

results = model.train(
    data=data_yaml_path,
    epochs=50,  # Reduced for faster training
    imgsz=640,
    batch=16,
    patience=15,
    device=0,  # Use GPU
    project='mahjong_detector',
    name='train',
    exist_ok=True
)

print("\n✅ Training complete!")

# Step 5: Export to TensorFlow.js
print("\n" + "=" * 60)
print("🔄 Step 5: Exporting to TensorFlow.js...")
print("=" * 60)

# Load the best trained model
best_model_path = 'mahjong_detector/train/weights/best.pt'

if os.path.exists(best_model_path):
    trained_model = YOLO(best_model_path)
    
    # Export to TensorFlow.js
    print("Exporting to TensorFlow.js format...")
    trained_model.export(format='tfjs')
    print("✅ Export complete!")
else:
    print(f"⚠️ Best model not found at {best_model_path}")
    print("Checking for any trained weights...")
    !find mahjong_detector -name "*.pt"

# Step 6: Package for download
print("\n" + "=" * 60)
print("📦 Step 6: Packaging model for download...")
print("=" * 60)

# Find the exported TF.js model
!find . -name "*_web_model" -type d

tfjs_paths = [
    'mahjong_detector/train/weights/best_web_model',
    'best_web_model',
    'yolov8n_web_model'
]

tfjs_path = None
for path in tfjs_paths:
    if os.path.exists(path):
        tfjs_path = path
        break

if tfjs_path:
    # Create zip for download
    shutil.make_archive('mahjong_tfjs_model', 'zip', tfjs_path)
    print(f"✅ Model packaged from {tfjs_path}!")
    
    # List contents
    print("\n📂 Model contents:")
    !ls -la {tfjs_path}
    
    # Download
    from google.colab import files
    files.download('mahjong_tfjs_model.zip')
    
    print("\n📥 Downloading mahjong_tfjs_model.zip...")
else:
    print("⚠️ TF.js model not found. Listing all generated files:")
    !find mahjong_detector -type f | head -50

# Also save the PyTorch model
if os.path.exists(best_model_path):
    shutil.copy(best_model_path, 'mahjong_best.pt')
    files.download('mahjong_best.pt')
    print("📥 Also downloading mahjong_best.pt (PyTorch format)")

# Final instructions
print("\n" + "=" * 60)
print("🎉 COMPLETE!")
print("=" * 60)
print("""
Downloaded files:
- mahjong_tfjs_model.zip - TensorFlow.js model for browser
- mahjong_best.pt - PyTorch model (backup)

Next steps:
1. Extract mahjong_tfjs_model.zip
2. Copy contents to: public/models/mahjong-detector/
3. Update src/utils/tileDetection.js to load the model
4. Test your app!

The model is ready for browser-based detection! 🀄
""")

