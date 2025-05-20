// generate-manifests.js
const fs   = require('fs');
const path = require('path');

const IMAGES_ROOT = path.join(__dirname, 'images');

fs.readdirSync(IMAGES_ROOT, { withFileTypes: true })
  .filter(e => e.isDirectory())
  .map(e => e.name)
  .forEach(year => {
    const dirPath = path.join(IMAGES_ROOT, year);
    const files   = fs.readdirSync(dirPath)
                      .filter(f => f.toLowerCase().endsWith('.png'))
                      .sort();
    fs.writeFileSync(
      path.join(dirPath, 'manifest.json'),
      JSON.stringify(files, null, 2)
    );
    console.log(`✔ ${year}: ${files.length} images`);
  });