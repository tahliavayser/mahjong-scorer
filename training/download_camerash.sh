#!/bin/bash

echo "🀄 Downloading Camerash Mahjong Dataset..."
echo ""

# Clone the dataset
if [ -d "mahjong-dataset" ]; then
    echo "⚠️  Dataset already exists. Skipping download."
else
    echo "📦 Cloning repository..."
    git clone https://github.com/Camerash/mahjong-dataset.git
    echo "✅ Dataset downloaded!"
fi

echo ""
echo "📊 Dataset Statistics:"
cd mahjong-dataset
find . -name "*.jpg" -o -name "*.png" | wc -l | xargs echo "Total images:"
echo ""
echo "✅ Ready to train!"
echo "Next step: Run 'python train_camerash.py'"

