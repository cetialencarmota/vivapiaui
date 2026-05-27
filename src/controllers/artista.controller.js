const Artista = require('../models/Artista');
const Obra = require('../models/Obra');
const Doacao = require('../models/Doacao');
const AppError = require('../utils/AppError');

const artistaController = {
  index(req, res, next) {
    try {
      const artistas = Artista.findAll();
      res.json(artistas);
    } catch (err) {
      next(err);
    }
  },

  show(req, res, next) {
    try {
      const artista = Artista.findById(req.params.id);
      if (!artista) {
        return next(new AppError('Artista não encontrado.', 404));
      }
      const obras = Obra.findAllByArtistaId(artista.id);
      const totalDoacoes = Doacao.totalPorArtista(artista.id);
      res.json({ ...artista, obras, total_doacoes: totalDoacoes.total });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const usuarioId = req.usuario.id;
      if (req.usuario.tipo_perfil === 'admin' && req.params.id) {
        const artista = Artista.findById(req.params.id);
        if (!artista) {
          return next(new AppError('Perfil de artista não encontrado.', 404));
        }
        const atualizado = Artista.update(artista.id, req.body);
        return res.json(atualizado);
      }
      let artista = Artista.findByUsuarioId(usuarioId);
      if (!artista) {
        return next(new AppError('Perfil de artista não encontrado.', 404));
      }
      artista = Artista.update(artista.id, req.body);
      res.json(artista);
    } catch (err) {
      next(err);
    }
  },

  showMe(req, res, next) {
    try {
      const artista = Artista.findByUsuarioId(req.usuario.id);
      if (!artista) {
        return next(new AppError('Perfil de artista não encontrado.', 404));
      }
      const obras = Obra.findAllByArtistaId(artista.id);
      const totalDoacoes = Doacao.totalPorArtista(artista.id);
      res.json({ ...artista, obras, total_doacoes: totalDoacoes.total });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = artistaController;
