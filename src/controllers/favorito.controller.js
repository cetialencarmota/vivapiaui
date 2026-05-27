const Favorito = require('../models/Favorito');
const Artista = require('../models/Artista');
const AppError = require('../utils/AppError');

const favoritoController = {
  index(req, res, next) {
    try {
      const favoritos = Favorito.findAllByUsuarioId(req.usuario.id);
      res.json(favoritos);
    } catch (err) {
      next(err);
    }
  },

  create(req, res, next) {
    try {
      const { artista_id } = req.body;
      if (!artista_id) {
        return next(new AppError('ID do artista é obrigatório.', 400));
      }
      const perfil = Artista.findByUsuarioId(req.usuario.id);
      if (perfil && perfil.id === Number(artista_id)) {
        return next(new AppError('Você não pode favoritar seu próprio perfil.', 403));
      }
      const favorito = Favorito.create(req.usuario.id, artista_id);
      if (!favorito) {
        return next(new AppError('Artista já está nos favoritos.', 409));
      }
      res.status(201).json(favorito);
    } catch (err) {
      next(err);
    }
  },

  delete(req, res, next) {
    try {
      const result = Favorito.delete(req.usuario.id, req.params.artistaId);
      if (result.changes === 0) {
        return next(new AppError('Favorito não encontrado.', 404));
      }
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  },

  check(req, res, next) {
    try {
      const favorito = Favorito.findByUsuarioAndArtista(req.usuario.id, req.params.artistaId);
      res.json({ favoritado: !!favorito });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = favoritoController;
