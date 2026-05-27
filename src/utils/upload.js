const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AppError = require('./AppError');

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

function criarUpload(pasta) {
  const dir = path.resolve(__dirname, '..', '..', 'public', 'uploads', pasta);
  fs.mkdirSync(dir, { recursive: true });

  const storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, dir); },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname) || '.jpg';
      cb(null, pasta + '-' + Date.now() + '-' + Math.round(Math.random() * 1000) + ext);
    }
  });

  return multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
      if (TIPOS_PERMITIDOS.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new AppError('Formato de imagem inválido. Use JPG, PNG, GIF ou WebP.', 400));
      }
    }
  });
}

module.exports = { criarUpload };
