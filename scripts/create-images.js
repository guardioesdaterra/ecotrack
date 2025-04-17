const fs = require('fs');
const path = require('path');

// Simple 1x1 pixel PNG for grid-overlay (transparent black with 20% opacity)
const gridOverlayBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// Simple 1x1 pixel PNG for scanline (transparent white with 10% opacity)
const scanlineBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HgAGgwJ/lK3Q6wAAAABJRU5ErkJggg==';

// Function to write base64 string to a file
function writeBase64ToFile(base64String, outputPath) {
  // Remove data:image/png;base64, if it exists
  const data = base64String.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(data, 'base64');
  
  // Ensure directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Write file
  fs.writeFileSync(outputPath, buffer);
  console.log(`Created: ${outputPath}`);
}

// Create grid-overlay.png
writeBase64ToFile(
  gridOverlayBase64,
  path.join(__dirname, '../public/grid-overlay.png')
);

// Create scanline.png
writeBase64ToFile(
  scanlineBase64,
  path.join(__dirname, '../public/scanline.png')
);

console.log('Image files created successfully!'); 