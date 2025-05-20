// generate-manifests.js

const fs   = require('fs');
const path = require('path');

// Root images directory (adjust if yours is different)
const IMAGES_ROOT = path.join(__dirname, 'images');

fs.readdir(IMAGES_ROOT, { withFileTypes: true }, (err, entries) => {
  if (err) return console.error('❌ Could not read images root:', err);

  // Filter down to only subdirectories (e.g. "2023", "2024", "2025")
  const yearDirs = entries.filter(e => e.isDirectory()).map(e => e.name);

  yearDirs.forEach(year => {
    const dirPath = path.join(IMAGES_ROOT, year);

    fs.readdir(dirPath, (err, files) => {
      if (err) {
        console.error(`❌ Could not read directory for year ${year}:`, err);
        return;
      }

      // Keep only .png (or change to /\.jpe?g$/i for JPEGs)
      const imageFiles = files
        .filter(f => f.toLowerCase().endsWith('.png'))
        .sort();

      const manifestPath = path.join(dirPath, 'manifest.json');
      fs.writeFile(manifestPath,
                   JSON.stringify(imageFiles, null, 2),
                   err => {
        if (err) {
          console.error(`❌ Failed to write manifest for ${year}:`, err);
        } else {
          console.log(`✅ ${year}: ${imageFiles.length} items → ${path.relative(process.cwd(), manifestPath)}`);
        }
      });
    });
  });
});