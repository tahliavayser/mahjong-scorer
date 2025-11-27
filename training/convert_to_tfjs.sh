#!/bin/bash

echo "🔄 Converting model to TensorFlow.js format..."
echo ""

# Find the most recent model file
MODEL_FILE=$(ls -t mahjong_detector_*.h5 2>/dev/null | head -1)
MAPPING_FILE=$(ls -t class_mapping_*.json 2>/dev/null | head -1)

if [ -z "$MODEL_FILE" ]; then
    echo "❌ No trained model found!"
    echo "Please run: python train_camerash.py"
    exit 1
fi

echo "📦 Found model: $MODEL_FILE"
echo "📦 Found mapping: $MAPPING_FILE"
echo ""

# Create output directory
OUTPUT_DIR="../public/models/mahjong-detector"
mkdir -p "$OUTPUT_DIR"

# Convert model
echo "🔄 Converting to TensorFlow.js..."
tensorflowjs_converter \
    --input_format=keras \
    --output_format=tfjs_graph_model \
    "$MODEL_FILE" \
    "$OUTPUT_DIR"

if [ $? -eq 0 ]; then
    echo "✅ Model converted successfully!"
    
    # Copy class mapping
    if [ -n "$MAPPING_FILE" ]; then
        cp "$MAPPING_FILE" "$OUTPUT_DIR/class_mapping.json"
        echo "✅ Class mapping copied!"
    fi
    
    echo ""
    echo "📊 Model files created in: $OUTPUT_DIR"
    ls -lh "$OUTPUT_DIR"
    
    echo ""
    echo "🎉 All done! Your model is ready to use in the app!"
    echo ""
    echo "Next steps:"
    echo "1. Update src/utils/tileDetection.js (if needed)"
    echo "2. Test the app: npm run dev"
    echo "3. Deploy: npm run deploy"
else
    echo "❌ Conversion failed!"
    exit 1
fi

