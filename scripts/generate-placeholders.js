/* eslint-env node */

/**
 * Generates valid PNG placeholders so Expo exports work without final brand assets.
 * Run: node scripts/generate-placeholders.js
 */
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
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

function makePng(size, rgba) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8;
  header[9] = 6;

  const rowLength = 1 + size * 4;
  const pixels = Buffer.alloc(rowLength * size);
  for (let y = 0; y < size; y += 1) {
    const rowStart = y * rowLength;
    pixels[rowStart] = 0;
    for (let x = 0; x < size; x += 1) {
      rgba.copy(pixels, rowStart + 1 + x * 4);
    }
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", header),
    chunk("IDAT", zlib.deflateSync(pixels)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const placeholderPng = makePng(1024, Buffer.from([0x8f, 0xd1, 0x4f, 0xff]));
const out = path.join(__dirname, "..", "assets");

fs.mkdirSync(out, { recursive: true });
for (const name of ["icon.png", "adaptive-icon.png", "splash-icon.png", "favicon.png"]) {
  fs.writeFileSync(path.join(out, name), placeholderPng);
}
console.log("Wrote placeholder PNGs to assets/");
