const fs = require('fs/promises');
const { imageToText } = require('../services/img2text.service');
const { imageToHTMLText, imageTo3LayerHTML } = require('../services/pic2html.service');

const MODES = ['ascii', 'pic2html', 'pic2html3'];

async function processImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image provided' });
    }

    const mode = req.body.mode || 'ascii';
    if (!MODES.includes(mode)) {
      return res.status(400).json({ success: false, error: `Invalid mode. Use one of: ${MODES.join(', ')}` });
    }

    if (mode === 'pic2html' || mode === 'pic2html3') {
      return res.json(await processPic2Html(req, mode));
    }

    // Leer variables del POST
    const charWidth = parseInt(req.body.charWidth) || 80;
    const charHeight = req.body.charHeight ? parseInt(req.body.charHeight) : undefined;
    const contrast = req.body.contrast ? parseFloat(req.body.contrast) : 0;
    const gamma = req.body.gamma ? parseFloat(req.body.gamma) : 1;
    const dither = req.body.dither === "true";
    const edge = req.body.edge === "true";
    const color = req.body.color === "true";
    const html = req.body.html === "true";
    const charAspect = req.body.charAspect ? parseFloat(req.body.charAspect) : 0.5;
    const characters = req.body.characters ? req.body.characters.split('') : [' ', '.', ':', '-', '=', '+', '*', '#', '%', '@'];

    // Llamar a la función pasando todas las opciones
    const text = await imageToText(req.file.path, {
      charWidth,
      charHeight,
      contrast,
      gamma,
      dither,
      edge,
      color,
      html,
      charAspect,
      characters
    });

    res.json({ success: true, text });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    // Borrar siempre el archivo subido, haya ido bien o mal
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
  }
}

// Opciones de los modos pic2html / pic2html3
async function processPic2Html(req, mode) {
  const options = {
    width: parseInt(req.body.charWidth) || 100,
    characters: req.body.characters ? req.body.characters.split('') : undefined,
    textType: req.body.textType === 'random' ? 'random' : 'sequence',
  };

  if (mode === 'pic2html3') {
    const layers = await imageTo3LayerHTML(req.file.path, options);
    return { success: true, mode, layers };
  }

  const text = await imageToHTMLText(req.file.path, {
    ...options,
    grayscale: req.body.grayscale === 'true',
    bgColor: req.body.bgColor || undefined,
    fontSize: req.body.fontSize ? parseFloat(req.body.fontSize) || undefined : undefined,
  });
  return { success: true, mode, text };
}

module.exports = { processImage };
