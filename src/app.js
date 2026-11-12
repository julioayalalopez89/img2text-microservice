const express = require('express');
const ocrRoutes = require('./routes/img2text.routes');

const app = express();

// Middleware
app.use(express.json());                        // Para JSON
app.use(express.urlencoded({ extended: true })); // Para form-data simple

// Ruta base
app.get('/', (req, res) => {
  res.json({
    service: 'OCR Microservice',
    status: 'running'
  });
});

// Health check para el contenedor / Azure
app.get('/healthz', (req, res) => {
  res.json({ status: 'ok' });
});

// Rutas OCR
app.use('/api/ocr', ocrRoutes);

module.exports = app;
