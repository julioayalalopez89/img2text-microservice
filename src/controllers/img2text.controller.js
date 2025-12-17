const { imageToText } = require('../services/img2text.service');

async function processImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image provided' });
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
  }
}

module.exports = { processImage };
