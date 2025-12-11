# Converting YOLO Mahjong Detection to TensorFlow.js

This guide walks you through converting a YOLO-trained mahjong tile detector to TensorFlow.js for use in the browser.

## Overview

The [lissa2077/Mahjong-Detection](https://github.com/lissa2077/Mahjong-Detection) project uses YOLO (Darknet) format. We need to convert:

```
YOLO/Darknet (.weights/.cfg) → TensorFlow/Keras (.h5) → TensorFlow.js (model.json)
```

## Step 1: Get the YOLO Weights

The original repo doesn't include trained weights. You have two options:

### Option A: Train Your Own (Recommended)
Use their Colab notebook to train on their dataset structure.

### Option B: Use Pre-trained YOLO Weights
If you have access to mahjong YOLO weights from elsewhere.

## Step 2: Set Up Google Colab

Open Google Colab: https://colab.research.google.com

Enable GPU: Runtime → Change runtime type → GPU → Save

## Step 3: Run the Conversion Script

Copy and paste the code from `yolo_to_tfjs.py` into a Colab cell and run it.

## Step 4: Download and Use

After conversion, you'll get a `mahjong_tfjs_model.zip` file containing:
- `model.json` - Model architecture
- `group1-shard*.bin` - Model weights
- `classes.json` - Tile class names

## Step 5: Add to Your App

1. Extract the zip
2. Copy contents to `public/models/mahjong-detector/`
3. The app will automatically use the new model!

## Troubleshooting

### "Weights file not found"
You need to train or obtain YOLO weights first. See the training section.

### "Conversion failed"
Make sure you're using compatible versions:
- TensorFlow 2.x
- tensorflowjs 3.x or 4.x

### Model too large
Use YOLO-tiny v4 instead of full YOLOv3 (35MB vs 274MB)

