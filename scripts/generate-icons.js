const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const INK = '#1d1913';
const BONE = '#fbfaf7';
const AMBER = '#e0891c';

const LETTER = 'M7 20V8L16 16.5L25 8V20';
const UNDERLINE = 'M7 25.5H25';
const STROKE = 3.4;

const OUT_DIR = path.join(__dirname, '..', 'assets', 'images');

function markBody(inkColor, accentColor) {
  return `<path d="${LETTER}" stroke="${inkColor}" stroke-width="${STROKE}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <path d="${UNDERLINE}" stroke="${accentColor}" stroke-width="${STROKE}" stroke-linecap="round" fill="none"/>`;
}

function markSvg({ size, inkColor, accentColor, scale = 1 }) {
  const offset = (32 - 32 * scale) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">
  <g transform="translate(${offset} ${offset}) scale(${scale})">
    ${markBody(inkColor, accentColor)}
  </g>
</svg>`;
}

function roundedSquareSvg({ size, background, inkColor, accentColor, scale }) {
  const offset = (32 - 32 * scale) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="7.2" fill="${background}"/>
  <g transform="translate(${offset} ${offset}) scale(${scale})">
    ${markBody(inkColor, accentColor)}
  </g>
</svg>`;
}

function solidSvg({ size, color }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" fill="${color}"/></svg>`;
}

const TARGETS = [
  {
    file: 'icon.png',
    svg: roundedSquareSvg({
      size: 1024,
      background: INK,
      inkColor: BONE,
      accentColor: AMBER,
      scale: 1,
    }),
  },
  {
    file: 'android-icon-foreground.png',
    svg: markSvg({ size: 432, inkColor: BONE, accentColor: AMBER, scale: 0.62 }),
  },
  {
    file: 'android-icon-background.png',
    svg: solidSvg({ size: 432, color: INK }),
  },
  {
    file: 'android-icon-monochrome.png',
    svg: markSvg({ size: 432, inkColor: '#000000', accentColor: '#000000', scale: 0.62 }),
  },
  {
    file: 'splash-icon.png',
    svg: markSvg({ size: 512, inkColor: INK, accentColor: AMBER, scale: 1 }),
  },
  {
    file: 'favicon.png',
    svg: roundedSquareSvg({
      size: 96,
      background: INK,
      inkColor: BONE,
      accentColor: AMBER,
      scale: 1,
    }),
  },
];

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const target of TARGETS) {
    const destination = path.join(OUT_DIR, target.file);
    await sharp(Buffer.from(target.svg)).png().toFile(destination);
    console.log(`escrito ${target.file}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
