const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

function createPwaIcon(size, isMaskable = false) {
  const png = new PNG({ width: size, height: size });
  const center = size / 2;
  const radius = isMaskable ? size * 0.4 : size * 0.46;

  // Background fill: Deep navy blue gradient / solid brand color #0f172a / #1e3a8a
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;
      
      // Calculate distance from center for circular badge
      const dx = x - center;
      const dy = y - center;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (isMaskable || dist <= radius) {
        // Gradient from Indigo-900 (#1e1b4b) to Slate-900 (#0f172a)
        const t = (x + y) / (size * 2);
        png.data[idx] = Math.round(15 + t * 25);     // R: 15 - 40
        png.data[idx + 1] = Math.round(23 + t * 45); // G: 23 - 68
        png.data[idx + 2] = Math.round(62 + t * 140);// B: 62 - 202
        png.data[idx + 3] = 255;                      // Alpha
      } else {
        // Transparent outside circle for non-maskable
        png.data[idx] = 0;
        png.data[idx + 1] = 0;
        png.data[idx + 2] = 0;
        png.data[idx + 3] = 0;
      }

      // Draw stylized golden graduation cap / book motif in the center
      const iconScale = size / 512;
      const localX = (x - center) / iconScale;
      const localY = (y - center) / iconScale;

      // Cap rhomboid
      const isCap = Math.abs(localX) * 0.5 + Math.abs(localY + 40) < 90 && (localY + 40) >= -60 && (localY + 40) <= 60;
      // Book open wings
      const isBook = localY > 10 && localY < 80 && Math.abs(localX) < 110 && Math.abs(localY - 45) < 35;
      // Golden star / tassel accent
      const isAccent = Math.hypot(localX - 85, localY + 25) < 18 || Math.hypot(localX + 85, localY + 25) < 18;

      if (isCap || isBook) {
        png.data[idx] = 59;   // Blue-500 accent
        png.data[idx + 1] = 130;
        png.data[idx + 2] = 246;
        png.data[idx + 3] = 255;
      }
      if (isAccent) {
        png.data[idx] = 245;  // Amber-400 gold accent
        png.data[idx + 1] = 158;
        png.data[idx + 2] = 11;
        png.data[idx + 3] = 255;
      }
    }
  }

  return PNG.sync.write(png);
}

const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate standard PWA icons
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPwaIcon(192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPwaIcon(512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPwaIcon(512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPwaIcon(180, false));

console.log('PWA PNG Icons successfully generated in public/ directory!');
