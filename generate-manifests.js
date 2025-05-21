// Scans each year folder under `images/`,
// filters for `.jpeg`, sorts them,
// and writes `manifest.json` listing exactly those filenames.
const fs   = require('fs');
const path = require('path');
const IMAGES_ROOT = path.join(__dirname, 'images');

fs.readdirSync(IMAGES_ROOT, { withFileTypes: true })
  .filter(e => e.isDirectory())
  .map(e => e.name)
  .forEach(year => {
    const dir = path.join(IMAGES_ROOT, year);
    const files = fs.readdirSync(dir)
                    .filter(f => f.toLowerCase().endsWith('.jpeg'))
                    .sort();
    fs.writeFileSync(
      path.join(dir, 'manifest.json'),
      JSON.stringify(files, null, 2)
    );
    console.log(`✔ ${year}: ${files.length} images`);
  });