import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Generate icon.svg
const iconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0c6b29" />
      <stop offset="100%" stop-color="#053e16" />
    </linearGradient>
    <linearGradient id="zapGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="10%" stop-color="#facc15" />
      <stop offset="100%" stop-color="#eab308" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="12" flood-color="#facc15" flood-opacity="0.4" />
    </filter>
  </defs>

  <!-- Background squircle -->
  <rect width="512" height="512" rx="120" fill="url(#bgGrad)" />
  
  <!-- Outer Border Accent -->
  <rect x="16" y="16" width="480" height="480" rx="108" fill="none" stroke="#22c55e" stroke-width="10" stroke-opacity="0.35" />
  <rect x="24" y="24" width="464" height="464" rx="100" fill="none" stroke="#facc15" stroke-width="3" stroke-opacity="0.4" />

  <!-- Iconic Lightning Bolt (Zap) -->
  <polygon 
    points="272,86 112,284 256,284 240,426 400,218 256,218" 
    fill="url(#zapGrad)" 
    stroke="#ca8a04" 
    stroke-width="12" 
    stroke-linejoin="round"
    filter="url(#glow)"
  />
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), iconSvg);
console.log('Created public/icon.svg');

// PNG Generator using point-in-polygon and squircle distance
function pointInPoly(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1];
    const xj = poly[j][0], yj = poly[j][1];
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function distToSegment(px, py, x1, y1, x2, y2) {
  const l2 = (x1 - x2) ** 2 + (y1 - y2) ** 2;
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
}

function distToPolyEdges(x, y, poly) {
  let minDist = Infinity;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const d = distToSegment(x, y, poly[j][0], poly[j][1], poly[i][0], poly[i][1]);
    if (d < minDist) minDist = d;
  }
  return minDist;
}

function generateIconPng(size, isMaskable = false) {
  const width = size;
  const height = size;
  const rowBytes = width * 4 + 1;
  const raw = Buffer.alloc(rowBytes * height);

  // Scaled zap points
  // Base zap in [0, 512]:
  // Points: [272,86], [112,284], [256,284], [240,426], [400,218], [256,218]
  // Center is (256, 256)
  const scale = (isMaskable ? 0.65 : 0.85) * (size / 512);
  const cx = size / 2;
  const cy = size / 2;

  const basePoly = [
    [272, 86],
    [112, 284],
    [256, 284],
    [240, 426],
    [400, 218],
    [256, 218]
  ];

  const poly = basePoly.map(([bx, by]) => [
    cx + (bx - 256) * scale,
    cy + (by - 256) * scale
  ]);

  const cornerRadius = isMaskable ? 0 : size * 0.22; // rounded squircle for standard, full bleed for maskable

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes;
    raw[rowOffset] = 0; // Filter none

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      // Check corner radius if not maskable
      if (!isMaskable) {
        let dx = 0;
        let dy = 0;
        if (x < cornerRadius) dx = cornerRadius - x;
        else if (x > width - cornerRadius) dx = x - (width - cornerRadius);
        if (y < cornerRadius) dy = cornerRadius - y;
        else if (y > height - cornerRadius) dy = y - (height - cornerRadius);

        if (dx > 0 && dy > 0) {
          const dist = Math.hypot(dx, dy);
          if (dist > cornerRadius) {
            // Outside squircle: transparent
            raw[pxOffset] = 0;
            raw[pxOffset + 1] = 0;
            raw[pxOffset + 2] = 0;
            raw[pxOffset + 3] = 0;
            continue;
          }
        }
      }

      // Check if inside lightning poly
      const inPoly = pointInPoly(x, y, poly);
      const edgeDist = distToPolyEdges(x, y, poly);

      if (inPoly) {
        if (edgeDist < Math.max(2, size * 0.015)) {
          // Yellow-amber border
          raw[pxOffset] = 202;     // R
          raw[pxOffset + 1] = 138; // G
          raw[pxOffset + 2] = 4;   // B
          raw[pxOffset + 3] = 255;
        } else {
          // Brilliant yellow gradient
          const t = y / height;
          raw[pxOffset] = Math.round(250 - t * 15);     // 250 -> 235
          raw[pxOffset + 1] = Math.round(204 - t * 25); // 204 -> 179
          raw[pxOffset + 2] = Math.round(21 - t * 13);  // 21 -> 8
          raw[pxOffset + 3] = 255;
        }
      } else {
        // Background green gradient
        const t = (x + y) / (width + height);
        raw[pxOffset] = Math.round(12 - t * 7);      // R: 12 -> 5
        raw[pxOffset + 1] = Math.round(107 - t * 45); // G: 107 -> 62 (#0c6b29 -> #053e16)
        raw[pxOffset + 2] = Math.round(41 - t * 19);  // B: 41 -> 22
        raw[pxOffset + 3] = 255;
      }
    }
  }

  // Build PNG Buffer
  function crc32(buf) {
    let crc = 0 ^ -1;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ -1) >>> 0;
  }
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const toCrc = Buffer.concat([typeBuf, data]);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(toCrc), 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

// Generate all required PWA icons
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), generateIconPng(180, false));
console.log('Created public/apple-touch-icon.png (180x180)');

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), generateIconPng(192, false));
console.log('Created public/pwa-192x192.png (192x192)');

fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), generateIconPng(512, false));
console.log('Created public/pwa-512x512.png (512x512)');

fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), generateIconPng(512, true));
console.log('Created public/pwa-maskable-512x512.png (maskable)');

fs.writeFileSync(path.join(publicDir, 'favicon.png'), generateIconPng(64, false));
console.log('Created public/favicon.png');

console.log('All icons generated successfully!');
