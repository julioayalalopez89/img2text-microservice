// Modos pic2html y pic2html3 (portados de src/lib/pic2html.ts y pic2html3.ts).
// A diferencia del modo ASCII, aquí el carácter no depende del brillo: se recorre
// la lista de caracteres (en secuencia o al azar) y lo que dibuja la imagen es el color.
const { createCanvas, loadImage } = require('canvas');

const DEFAULT_CHARACTERS = ['0', '1'];

// Escapa un carácter para poder insertarlo dentro de HTML
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Solo deja pasar colores CSS simples (nombre, #hex, rgb(...)) para no inyectar estilos
function safeCssColor(color, fallback) {
  return typeof color === 'string' && /^[#a-zA-Z0-9(),.%\s]{1,40}$/.test(color) ? color : fallback;
}

// Devuelve una función que entrega el siguiente carácter.
// El contador es por llamada (en el .ts original era global y se compartía entre peticiones).
function createCharPicker(characters, textType) {
  let count = -1;
  return function nextChar() {
    if (characters.length === 1) return characters[0];
    if (textType === 'random') {
      return characters[Math.floor(Math.random() * characters.length)];
    }
    count++;
    if (count >= characters.length) count = 0;
    return characters[count];
  };
}

// Carga la imagen y la escala a `width` columnas manteniendo la proporción
async function readPixels(imagePath, width) {
  const img = await loadImage(imagePath);
  const height = Math.max(1, Math.round(width * (img.height / img.width)));
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);
  const { data } = ctx.getImageData(0, 0, width, height);
  return { data, width, height };
}

/**
 * pic2html: un <span> por carácter con el color del píxel.
 * Devuelve un string HTML (<div> con un <pre>).
 */
async function imageToHTMLText(imagePath, options = {}) {
  const {
    width = 100,
    characters = DEFAULT_CHARACTERS,
    textType = 'sequence',
    grayscale = false,
    bgColor = 'black',
    fontSize = 7,
  } = options;

  const { data, height } = await readPixels(imagePath, width);
  const nextChar = createCharPicker(characters.map(escapeHtml), textType);
  const background = safeCssColor(bgColor, 'black');

  let html = '<!-- Generated with img2text-microservice (pic2html) -->\n';
  html += `<div style="background-color:${background}; padding:10px;">\n`;
  html += `<pre style="font-size:${fontSize}px; line-height:${fontSize}px;">\n`;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      let r = data[idx];
      let g = data[idx + 1];
      let b = data[idx + 2];

      if (grayscale) {
        const avg = Math.round((r + g + b) / 3);
        r = g = b = avg;
      }

      html += `<span style="color:rgb(${r},${g},${b})">${nextChar()}</span>`;
    }
    html += '\n';
  }

  html += '</pre></div>';
  return html;
}

/**
 * pic2html3: separa la imagen en 3 capas por brillo (oscuro < 85, medio < 170, claro).
 * Devuelve un array de 3 strings HTML (<pre>), en orden: oscura, media, clara.
 */
async function imageTo3LayerHTML(imagePath, options = {}) {
  const {
    width = 100,
    characters = DEFAULT_CHARACTERS,
    textType = 'sequence',
  } = options;

  const { data, height } = await readPixels(imagePath, width);
  const nextChar = createCharPicker(characters.map(escapeHtml), textType);

  const layerBlack = [];
  const layerMid = [];
  const layerWhite = [];

  for (let y = 0; y < height; y++) {
    let rowBlack = '';
    let rowMid = '';
    let rowWhite = '';
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      const ch = nextChar();

      if (gray < 85) {
        rowBlack += ch; rowMid += ' '; rowWhite += ' ';
      } else if (gray < 170) {
        rowBlack += ' '; rowMid += ch; rowWhite += ' ';
      } else {
        rowBlack += ' '; rowMid += ' '; rowWhite += ch;
      }
    }
    layerBlack.push(rowBlack);
    layerMid.push(rowMid);
    layerWhite.push(rowWhite);
  }

  return [
    `<pre>${layerBlack.join('\n')}</pre>`,
    `<pre>${layerMid.join('\n')}</pre>`,
    `<pre>${layerWhite.join('\n')}</pre>`,
  ];
}

module.exports = { imageToHTMLText, imageTo3LayerHTML };
