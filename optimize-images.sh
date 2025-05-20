#!/usr/bin/env bash
set -e

# optimize-images.sh
# Compress every PNG under images/ using pngquant in-place

find images -type f -name '*.png' | while read img; do
  echo "Optimizing $img..."
  # --ext .png overwrites the original
  # --force to skip prompts
  pngquant --force --ext .png --quality=65-80 "$img"
done

echo "✅ All images optimized."
