const fs = require('fs');
const multer = require('multer');
const path = require('path');

// Carpeta de subidas: UPLOAD_DIR o ./uploads (relativa al directorio de trabajo)
const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || 'uploads');

function ensureUploadDir() {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      ensureUploadDir();
      cb(null, UPLOAD_DIR);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

module.exports = upload;
module.exports.ensureUploadDir = ensureUploadDir;
module.exports.UPLOAD_DIR = UPLOAD_DIR;
