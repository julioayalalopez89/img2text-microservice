const express = require('express');
const router = express.Router();

// Middleware para subir archivos
const upload = require('../middlewares/upload.middleware');

// Controller que procesa la imagen
const { processImage } = require('../controllers/img2text.controller');

// Ruta POST /api/ocr
router.post('/', upload.single('image'), processImage);

module.exports = router;
