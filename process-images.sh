#!/usr/bin/env bash
set -e

# 1) Strip all metadata (EXIF, GPS, etc.) using exiftool
find images -type f -name '*.jpeg' | while read img; do
  echo "Stripping metadata from $img..."
  exiftool -overwrite_original -all= "$img"
done

# 2) Optimize JPEGs (lossy) using jpegoptim
find images -type f -name '*.jpeg' | while read img; do
  echo "Optimizing $img..."
  jpegoptim --strip-all --max=80 "$img"
done

echo "✅ Images processed (metadata stripped & optimized)."