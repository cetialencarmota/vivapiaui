const Usuario = require('../models/Usuario');
const AppError = require('../utils/AppError');

const uploadController = {
  avatar(req, res, next) {
    try {
      if (!req.file) {
        return next(new AppError('Nenhuma imagem enviada.', 400));
      }
      const avatarUrl = '/uploads/avatars/' + req.file.filename;
      const usuario = Usuario.update(req.usuario.id, { avatar_url: avatarUrl });
      if (!usuario) {
        return next(new AppError('Usuário não encontrado.', 404));
      }
      res.json({ usuario, avatar_url: avatarUrl });
    } catch (err) {
      next(err);
    }
  },

  imagem(req, res, next) {
    try {
      if (!req.file) {
        return next(new AppError('Nenhuma imagem enviada.', 400));
      }
      const imagemUrl = '/uploads/imagens/' + req.file.filename;
      res.json({ imagem_url: imagemUrl });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = uploadController;
