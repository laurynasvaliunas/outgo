const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");

const OUT_DIR = path.join(__dirname, "..", "assets", "images");

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (let i = 0; i < buffer.length; i += 1) {
    crc ^= buffer[i];
    for (let j = 0; j < 8; j += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  const crc = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function writePng(filePath, width, height, draw) {
  const raw = Buffer.alloc((width * 4 + 1) * height);

  for (let y = 0; y < height; y += 1) {
    const row = y * (width * 4 + 1);
    raw[row] = 0;
    for (let x = 0; x < width; x += 1) {
      const pixel = draw(x, y, width, height);
      const index = row + 1 + x * 4;
      raw[index] = pixel[0];
      raw[index + 1] = pixel[1];
      raw[index + 2] = pixel[2];
      raw[index + 3] = pixel[3];
    }
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;
  header[10] = 0;
  header[11] = 0;
  header[12] = 0;

  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", header),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0))
  ]);

  fs.writeFileSync(filePath, png);
}

function hex(value) {
  const clean = value.replace("#", "");
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16)
  ];
}

function mix(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t)
  ];
}

function circle(x, y, cx, cy, radius) {
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= radius * radius;
}

function roundedRect(x, y, left, top, right, bottom, radius) {
  const inBox = x >= left && x <= right && y >= top && y <= bottom;
  if (!inBox) {
    return false;
  }

  const cx = x < left + radius ? left + radius : x > right - radius ? right - radius : x;
  const cy = y < top + radius ? top + radius : y > bottom - radius ? bottom - radius : y;
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= radius * radius;
}

function markPixel(x, y, size, transparent = false) {
  const bg = hex("#F8F4EE");
  const green = hex("#4F6F52");
  const greenDark = hex("#2F4A39");
  const cream = hex("#FFF8EE");
  const clay = hex("#C76D4D");
  const blue = hex("#4F7E8A");
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.34;

  let color = transparent ? [0, 0, 0, 0] : [...bg, 255];

  if (!transparent) {
    const t = Math.max(0, Math.min(1, y / size));
    color = [...mix(bg, hex("#EFE8DD"), t), 255];
  }

  if (circle(x, y, cx, cy, r)) {
    color = [...green, 255];
  }

  if (circle(x, y, cx, cy, r * 0.74)) {
    color = [...cream, 255];
  }

  const pathWidth = size * 0.052;
  const diagonal = Math.abs(y - (0.58 * size - 0.32 * (x - cx))) < pathWidth;
  const diagonalBounds =
    x > size * 0.32 && x < size * 0.73 && y > size * 0.38 && y < size * 0.68;
  if (diagonal && diagonalBounds) {
    color = [...greenDark, 255];
  }

  if (roundedRect(x, y, size * 0.31, size * 0.47, size * 0.52, size * 0.63, size * 0.035)) {
    color = [...greenDark, 255];
  }

  if (roundedRect(x, y, size * 0.52, size * 0.48, size * 0.66, size * 0.61, size * 0.06)) {
    color = [...greenDark, 255];
  }

  if (roundedRect(x, y, size * 0.35, size * 0.64, size * 0.57, size * 0.69, size * 0.025)) {
    color = [...clay, 255];
  }

  if (circle(x, y, size * 0.64, size * 0.36, size * 0.055)) {
    color = [...blue, 255];
  }

  return color;
}

ensureDir(OUT_DIR);

writePng(path.join(OUT_DIR, "icon.png"), 1024, 1024, (x, y, w) =>
  markPixel(x, y, w, false)
);

writePng(path.join(OUT_DIR, "splash-icon.png"), 1024, 1024, (x, y, w) =>
  markPixel(x, y, w, true)
);

writePng(path.join(OUT_DIR, "adaptive-icon.png"), 1024, 1024, (x, y, w) =>
  markPixel(x, y, w, true)
);

console.log("Generated app icon, splash icon and adaptive icon.");
