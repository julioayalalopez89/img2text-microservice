require('dotenv').config({ quiet: true });

const app = require('./app');
const { ensureUploadDir } = require('./middlewares/upload.middleware');

const PORT = process.env.PORT || 3000;

// Crear la carpeta de subidas antes de aceptar peticiones
ensureUploadDir();

app.listen(PORT, () => {
  console.log(`🚀 img2text service running on port ${PORT}`);
});
