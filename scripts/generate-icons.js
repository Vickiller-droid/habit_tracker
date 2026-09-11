import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPNG(width, height, isMaskable = false) {
  const bytesPerPixel = 4;
  const rawScanlineLength = width * bytesPerPixel;
  const uncompressedBuffer = Buffer.alloc(height * (rawScanlineLength + 1));

  const cx = width / 2;
  const cy = height / 2;
  // Radius for outer shape or safe zone
  const safeScale = isMaskable ? 0.38 : 0.44;
  const flameRadius = width * safeScale;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (rawScanlineLength + 1);
    uncompressedBuffer[rowOffset] = 0; // PNG filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * bytesPerPixel;

      // Background color: #0F172A (15, 23, 42)
      let r = 15;
      let g = 23;
      let b = 42;
      let a = 255;

      // Draw subtle rounded-rect or circular border glow
      const dx = x - cx;
      const dy = y - cy;
      const distFromCenter = Math.sqrt(dx * dx + dy * dy);

      // Flame / Habit Ascendance geometry:
      // Normalized coordinates from -1 to 1 centered at cy
      const nx = dx / flameRadius;
      const ny = (y - cy + flameRadius * 0.1) / flameRadius; // slightly shifted up

      // Flame shape equation:
      // Outer teardrop / flame contour
      // Bottom is round: nx^2 + (ny - 0.2)^2 <= 0.8
      // Top tapers to point: abs(nx) <= (1 - ny) * factor
      let inFlame = false;
      let inCore = false;

      if (ny >= -1.0 && ny <= 1.0) {
        // Tapered curve from bottom curve to top point
        const bottomY = 0.3;
        const widthAtY = ny > bottomY 
          ? Math.sqrt(Math.max(0, 0.49 - (ny - bottomY) * (ny - bottomY) * 2.5))
          : Math.max(0, 0.7 * Math.pow(Math.max(0, 1.0 + ny), 1.4) * (1 - ny * 0.5));

        if (Math.abs(nx) <= widthAtY && ny >= -0.9 && ny <= 0.75) {
          inFlame = true;
          // Inner core flame
          if (Math.abs(nx) <= widthAtY * 0.55 && ny >= -0.65 && ny <= 0.6) {
            inCore = true;
          }
        }
      }

      // Check if inside secondary growth particle/star at top-right
      const sparkDx = (x - (cx + flameRadius * 0.55)) / (flameRadius * 0.2);
      const sparkDy = (y - (cy - flameRadius * 0.6)) / (flameRadius * 0.2);
      const inSpark = (sparkDx * sparkDx + sparkDy * sparkDy) <= 1.0;

      if (inCore) {
        // Golden Yellow / Amber core: #FBBF24 -> #F59E0B
        const coreRatio = Math.min(1, Math.max(0, (ny + 0.65) / 1.25));
        r = Math.round(251 * (1 - coreRatio) + 245 * coreRatio);
        g = Math.round(191 * (1 - coreRatio) + 158 * coreRatio);
        b = Math.round(36 * (1 - coreRatio) + 11 * coreRatio);
      } else if (inFlame) {
        // Vibrant Orange Flame: #EA580C -> #F97316
        const flameRatio = Math.min(1, Math.max(0, (ny + 0.9) / 1.65));
        r = Math.round(249 * (1 - flameRatio) + 234 * flameRatio);
        g = Math.round(115 * (1 - flameRatio) + 88 * flameRatio);
        b = Math.round(22 * (1 - flameRatio) + 12 * flameRatio);
      } else if (inSpark) {
        r = 251;
        g = 191;
        b = 36;
      } else {
        // Outer dark background with subtle warm radial glow
        const glow = Math.max(0, 1 - distFromCenter / (width * 0.7));
        r = Math.min(255, Math.round(15 + 40 * glow * glow));
        g = Math.min(255, Math.round(23 + 20 * glow * glow));
        b = Math.min(255, Math.round(42 + 10 * glow * glow));
      }

      uncompressedBuffer[pxOffset] = r;
      uncompressedBuffer[pxOffset + 1] = g;
      uncompressedBuffer[pxOffset + 2] = b;
      uncompressedBuffer[pxOffset + 3] = a;
    }
  }

  // Compress with deflate
  const compressedData = zlib.deflateSync(uncompressedBuffer, { level: 9 });

  // Build PNG chunks
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // Bit depth: 8
  ihdrData.writeUInt8(6, 9); // Color type: 6 (RGBA)
  ihdrData.writeUInt8(0, 10); // Compression
  ihdrData.writeUInt8(0, 11); // Filter
  ihdrData.writeUInt8(0, 12); // Interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // IDAT chunk
  const idatChunk = makeChunk('IDAT', compressedData);

  // IEND chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(typeStr, dataBuffer) {
  const typeBuf = Buffer.from(typeStr, 'ascii');
  const len = dataBuffer.length;
  const chunkLenBuf = Buffer.alloc(4);
  chunkLenBuf.writeUInt32BE(len, 0);

  const crcPayload = Buffer.concat([typeBuf, dataBuffer]);
  const crcVal = zlib.crc32(crcPayload);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal >>> 0, 0);

  return Buffer.concat([chunkLenBuf, typeBuf, dataBuffer, crcBuf]);
}

// Ensure public directory exists
const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate PWA icons
console.log('Generating PWA icons...');
const icon192 = createPNG(192, 192, false);
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), icon192);

const icon512 = createPNG(512, 512, false);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), icon512);

const maskable192 = createPNG(192, 192, true);
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-192x192.png'), maskable192);

const maskable512 = createPNG(512, 512, true);
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), maskable512);

const appleTouch = createPNG(180, 180, false);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleTouch);

// Also generate a crisp SVG for modern vector tabs
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" rx="104" fill="#0F172A"/>
  <circle cx="256" cy="256" r="180" fill="url(#bg_glow)" opacity="0.4"/>
  <path d="M256 96C256 96 288 176 336 216C376 249 392 291 384 336C374 394 322 432 256 432C190 432 138 394 128 336C120 286 144 240 184 200C184 260 216 288 232 296C248 304 256 296 256 280C256 240 224 192 256 96Z" fill="url(#flame_grad)"/>
  <path d="M256 240C256 240 272 280 296 300C316 317 324 338 320 361C315 390 289 409 256 409C223 409 197 390 192 361C188 336 200 312 220 292C220 322 236 336 244 340C252 344 256 340 256 332C256 312 240 288 256 240Z" fill="url(#core_grad)"/>
  <circle cx="360" cy="150" r="16" fill="#FBBF24"/>
  <defs>
    <radialGradient id="bg_glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0%" stop-color="#EA580C" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#0F172A" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="flame_grad" x1="256" y1="96" x2="256" y2="432" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FB923C"/>
      <stop offset="50%" stop-color="#EA580C"/>
      <stop offset="100%" stop-color="#C2410C"/>
    </linearGradient>
    <linearGradient id="core_grad" x1="256" y1="240" x2="256" y2="409" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FEF08A"/>
      <stop offset="60%" stop-color="#FBBF24"/>
      <stop offset="100%" stop-color="#F59E0B"/>
    </linearGradient>
  </defs>
</svg>`;
fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent);

// Also create favicon.ico fallback (as a 64x64 PNG which modern browsers support for favicon)
const faviconPNG = createPNG(64, 64, false);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), faviconPNG);

console.log('Successfully generated all PWA icons in /public!');
