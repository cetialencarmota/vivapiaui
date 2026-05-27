const Doacao = require('../models/Doacao');
const AppError = require('../utils/AppError');

const doacaoController = {
  create(req, res, next) {
    try {
      const { artista_id, valor } = req.body;
      if (!artista_id || !valor || valor <= 0) {
        return next(new AppError('Artista e valor válido são obrigatórios.', 400));
      }
      const doacao = Doacao.create({
        artista_id,
        visitante_id: req.usuario ? req.usuario.id : null,
        valor
      });
      res.status(201).json(doacao);
    } catch (err) {
      next(err);
    }
  },

  index(req, res, next) {
    try {
      const doacoes = req.usuario.tipo_perfil === 'admin'
        ? Doacao.findAll()
        : Doacao.findAllByVisitanteId(req.usuario.id);
      res.json(doacoes);
    } catch (err) {
      next(err);
    }
  },

  total(req, res, next) {
    try {
      const { artista_id } = req.params;
      if (!artista_id) {
        return next(new AppError('ID do artista é obrigatório.', 400));
      }
      const total = Doacao.totalPorArtista(artista_id);
      res.json(total);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = doacaoController;
