const { createCanvas, loadImage } = require('canvas');

const { getBrightness } = require('./image/brightness');
const { applyContrast } = require('./image/contrast');
const { applyGamma } = require('./image/gamma');
const { brightnessToChar } = require('./image/charMapper');
const { applyDither } = require('./image/dither');
const { edgeDetect } = require('./image/edge');
const { colorize } = require('./image/ansiColor');
const { htmlColor } = require('./image/htmlColor');

async function imageToText(imagePath, options = {}) {
  const {
    charWidth = 80,    // ancho en caracteres
    charHeight,        // altura en caracteres opcional
    characters = [' ', '.', ':', '-', '=', '+', '*', '#', '%', '@'],
    contrast = 0,
    gamma = 1,
    dither = false,
    edge = false,
    color = false,
    html = false,      // devuelve HTML si true
    charAspect = 0.5,  // relación altura/ancho de los caracteres
  } = options;

  const img = await loadImage(imagePath);

  // calcular tamaño del canvas
  let canvasWidth = charWidth;
  let canvasHeight;

  if (charHeight) {
    canvasHeight = charHeight;
  } else {
    const aspect = img.height / img.width;
    canvasHeight = Math.floor(canvasWidth * aspect * charAspect);
  }

  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

  const { data } = ctx.getImageData(0, 0, canvasWidth, canvasHeight);

  let output = '';
  const brightnessBuffer = new Float32Array(canvasWidth * canvasHeight);

  // 1️⃣ Calcular brillo base
  for (let y = 0; y < canvasHeight; y++) {
    for (let x = 0; x < canvasWidth; x++) {
      const idx = (y * canvasWidth + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      let brightness = getBrightness(r, g, b);
      brightnessBuffer[y * canvasWidth + x] = brightness;
    }
  }

  // 2️⃣ Generar ASCII aplicando mejoras opcionales
  for (let y = 0; y < canvasHeight; y++) {
    for (let x = 0; x < canvasWidth; x++) {
      let brightness = brightnessBuffer[y * canvasWidth + x];

      if (contrast !== 0) brightness = applyContrast(brightness, contrast);
      if (gamma !== 1) brightness = applyGamma(brightness, gamma);
      if (edge) brightness = edgeDetect(x, y, brightnessBuffer, canvasWidth);
      if (dither) brightness = applyDither(x, y, brightness, brightnessBuffer, canvasWidth);

      let char = brightnessToChar(brightness, characters);

      if (color) {
        const idx = (y * canvasWidth + x) * 4;
        char = html
          ? htmlColor(char, data[idx], data[idx + 1], data[idx + 2], true)
          : colorize(char, data[idx], data[idx + 1], data[idx + 2], true);
      }

      output += char;
    }
    output += '\n';
  }

  

  return output;
}

module.exports = { imageToText };
