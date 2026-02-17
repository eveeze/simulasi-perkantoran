#!/bin/bash
# Download face-api.js model weights
# Run this script from the project root: bash scripts/download-models.sh

MODEL_DIR="public/models"
BASE_URL="https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights"

mkdir -p "$MODEL_DIR"

MODELS=(
  "ssd_mobilenetv1_model-weights_manifest.json"
  "ssd_mobilenetv1_model-shard1"
  "ssd_mobilenetv1_model-shard2"
  "face_landmark_68_model-weights_manifest.json"
  "face_landmark_68_model-shard1"
  "face_recognition_model-weights_manifest.json"
  "face_recognition_model-shard1"
  "face_recognition_model-shard2"
)

echo "📦 Downloading face-api.js model weights..."
for model in "${MODELS[@]}"; do
  if [ -f "$MODEL_DIR/$model" ]; then
    echo "  ✓ $model (exists)"
  else
    echo "  ↓ $model"
    curl -sL -o "$MODEL_DIR/$model" "$BASE_URL/$model"
  fi
done

echo ""
echo "✅ All models downloaded to $MODEL_DIR/"
echo "   Total files: $(ls -1 $MODEL_DIR | wc -l)"
echo "   Total size: $(du -sh $MODEL_DIR | cut -f1)"
