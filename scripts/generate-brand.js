const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const INK = '#171511';
const SURFACE = '#211e1a';
const BONE = '#f4f2ee';
const MUTED = '#a6a199';
const AMBER = '#e0891c';
const SEPARATOR = '#2c2925';

const LETTER = 'M7 20V8L16 16.5L25 8V20';
const UNDERLINE = 'M7 25.5H25';

const SIGNATURE =
  'M20 92C28 60 36 26 46 16C52 30 54 62 56 90C60 62 70 28 82 22C88 36 88 64 88 88C90 70 98 56 108 58C117 60 114 78 123 78C131 78 132 64 140 64C148 64 147 78 155 76C163 74 167 66 175 64';
const SIGNATURE_FLOURISH = 'M26 104C72 112 140 110 188 96';

const OUT_DIR = path.join(__dirname, '..', 'assets', 'brand');

const SERIF = "Newsreader, Georgia, 'Times New Roman', serif";
const SANS = "Figtree, 'Segoe UI', Helvetica, Arial, sans-serif";

function ruledLines(width, height, spacing) {
  const lines = [];
  for (let y = spacing; y < height; y += spacing) {
    lines.push(
      `<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="${SEPARATOR}" stroke-width="1"/>`
    );
  }
  return lines.join('');
}

function mark(x, y, size, strokeScale = 1) {
  const scale = size / 32;
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <path d="${LETTER}" stroke="${BONE}" stroke-width="${3.4 * strokeScale}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${UNDERLINE}" stroke="${AMBER}" stroke-width="${3.4 * strokeScale}" fill="none" stroke-linecap="round"/>
  </g>`;
}

const BANNER_W = 1280;
const BANNER_H = 400;

function bannerBackground() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${BANNER_W}" height="${BANNER_H}">
    <rect width="${BANNER_W}" height="${BANNER_H}" fill="${INK}"/>
    <g opacity="0.5">${ruledLines(BANNER_W, BANNER_H, 40)}</g>
  </svg>`;
}

/* Cada pieza se renderiza suelta sobre fondo transparente y se recorta a su
   caja real antes de componer. Colocarlas con coordenadas fijas es adivinar el
   ancho y el alto del texto, y con otra fuente instalada el banner sale
   descentrado y la marca desproporcionada.

   La M ocupa solo dos tercios de su caja, porque el subrayado cuelga por
   debajo. A igual tamano nominal se ve mas pequena que el texto, asi que se
   escala hasta que su letra mide lo mismo que la altura de mayuscula. */
function markLayer(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size + 40}" height="${size + 40}">
    ${mark(20, 20, size)}
  </svg>`;
}

function wordmarkLayer() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="700" height="200">
    <text x="20" y="140" font-family="${SERIF}" font-size="104" font-weight="500" fill="${BONE}" letter-spacing="-2.5">Miniout</text>
  </svg>`;
}

async function lockup() {
  const wordmark = await trimmed(wordmarkLayer());

  const markGlyphRatio = (20 - 8 + 3.4) / 32;
  const markSize = Math.round(wordmark.height / markGlyphRatio);
  const markImage = await trimmed(markLayer(markSize));

  const gap = 30;
  const width = markImage.width + gap + wordmark.width;
  const height = Math.max(markImage.height, wordmark.height);

  const data = await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: markImage.data, left: 0, top: 0 },
      { input: wordmark.data, left: markImage.width + gap, top: 0 },
    ])
    .png()
    .toBuffer();

  return { data, width, height };
}

function taglineLayer() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="60">
    <text x="20" y="40" font-family="${SANS}" font-size="27" fill="${MUTED}">Apuntes y tareas de universidad, donde escribir es lo primero</text>
  </svg>`;
}

async function trimmed(svg) {
  const { data, info } = await sharp(Buffer.from(svg))
    .trim({ threshold: 1 })
    .png()
    .toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

async function banner() {
  const brand = await lockup();
  const tagline = await trimmed(taglineLayer());

  const gap = 38;
  const blockHeight = brand.height + gap + tagline.height;
  const top = Math.round((BANNER_H - blockHeight) / 2);

  return sharp(Buffer.from(bannerBackground()))
    .composite([
      {
        input: brand.data,
        left: Math.round((BANNER_W - brand.width) / 2),
        top,
      },
      {
        input: tagline.data,
        left: Math.round((BANNER_W - tagline.width) / 2),
        top: top + brand.height + gap,
      },
    ])
    .png()
    .toBuffer();
}

function appIcon(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">
    <rect width="32" height="32" rx="7.2" fill="${INK}"/>
    <path d="${LETTER}" stroke="${BONE}" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${UNDERLINE}" stroke="${AMBER}" stroke-width="3.4" fill="none" stroke-linecap="round"/>
  </svg>`;
}

function signature(width) {
  const height = Math.round((width * 130) / 235);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 235 130">
    <rect width="235" height="130" fill="${SURFACE}" rx="10"/>
    <g transform="translate(15.4 0) skewX(-14)">
      <path d="${SIGNATURE}" stroke="${BONE}" stroke-width="4.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="${SIGNATURE_FLOURISH}" stroke="${AMBER}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="198" cy="93" r="4" fill="${AMBER}"/>
    </g>
  </svg>`;
}

const TARGETS = [
  { file: 'logo.png', svg: appIcon(256) },
  { file: 'firma.png', svg: signature(470) },
];

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  fs.writeFileSync(path.join(OUT_DIR, 'banner.png'), await banner());
  console.log('escrito banner.png');

  for (const target of TARGETS) {
    await sharp(Buffer.from(target.svg)).png().toFile(path.join(OUT_DIR, target.file));
    console.log(`escrito ${target.file}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
