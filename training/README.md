# Mahjong Tile Detector Training

This directory contains everything you need to train your own mahjong tile detection model.

## Quick Start (3 Steps)

### Step 1: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 2: Download Dataset & Train
```bash
# Download Camerash dataset
bash download_camerash.sh

# Train the model (2-4 hours with GPU)
python train_camerash.py
```

### Step 3: Convert & Deploy
```bash
# Convert to TensorFlow.js
bash convert_to_tfjs.sh

# Test it!
cd ..
npm run dev
```

## Files

- `requirements.txt` - Python dependencies
- `download_camerash.sh` - Downloads the Camerash dataset
- `train_camerash.py` - Training script
- `convert_to_tfjs.sh` - Converts model to web format
- `colab_training.ipynb` - Google Colab notebook (free GPU)

## Using Google Colab (Recommended)

If you don't have a GPU:

1. Open `colab_training.ipynb` in Google Colab
2. Enable GPU: Runtime > Change runtime type > GPU
3. Run all cells
4. Download the converted model
5. Extract to `../public/models/mahjong-detector/`

## Expected Results

- **Training time**: 2-4 hours with GPU, 12-24 hours with CPU
- **Accuracy**: 95-98%
- **Model size**: ~5-10 MB
- **Inference speed**: 100-200ms per image

## Troubleshooting

**No GPU?** Use Google Colab (free)
**Low accuracy?** Train for more epochs or get more data
**Model too large?** Already using MobileNetV2 (optimized for web)

Good luck! 🀄

