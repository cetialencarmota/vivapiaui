const Obra = require('../models/Obra');
const Artista = require('../models/Artista');
const AppError = require('../utils/AppError');

function obterArtistaId(req) {
  if (req.usuario.tipo_perfil === 'admin') return null;
  const artista = Artista.findByUsuarioId(req.usuario.id);
  if (!artista) {
    throw new AppError('Perfil de artista não encontrado.', 404);
  }
  return artista.id;
}

const obraController = {
  index(req, res, next) {
    try {
      if (req.usuario.tipo_perfil === 'admin') {
        const obras = Obra.findAll();
        return res.json(obras);
      }
      const artista = Artista.findByUsuarioId(req.usuario.id);
      if (!artista) {
        return next(new AppError('Perfil de artista não encontrado.', 404));
      }
      const obras = Obra.findAllByArtistaId(artista.id);
      res.json(obras);
    } catch (err) {
      next(err);
    }
  },

  show(req, res, next) {
    try {
      const obra = Obra.findById(req.params.id);
      if (!obra) {
        return next(new AppError('Obra não encontrada.', 404));
      }
      res.json(obra);
    } catch (err) {
      next(err);
    }
  },

  create(req, res, next) {
    try {
      const artistaId = obterArtistaId(req);
      if (!artistaId) {
        return next(new AppError('Admin não pode criar obras sem um artista vinculado.', 403));
      }
      const { titulo, descricao } = req.body;
      if (!titulo || !titulo.trim()) {
        return next(new AppError('O título da obra é obrigatório.', 400));
      }
      if (!descricao || !descricao.trim()) {
        return next(new AppError('A descrição da obra é obrigatória.', 400));
      }
      const data = { ...req.body, artista_id: artistaId };
      const obra = Obra.create(data);
      res.status(201).json(obra);
    } catch (err) {
      next(err);
    }
  },

  update(req, res, next) {
    try {
      const obra = Obra.findById(req.params.id);
      if (!obra) {
        return next(new AppError('Obra não encontrada.', 404));
      }
      if (req.usuario.tipo_perfil !== 'admin') {
        const artista = Artista.findByUsuarioId(req.usuario.id);
        if (!artista || obra.artista_id !== artista.id) {
          return next(new AppError('Você só pode editar suas próprias obras.', 403));
        }
      }
      const atualizado = Obra.update(req.params.id, req.body);
      res.json(atualizado);
    } catch (err) {
      next(err);
    }
  },

  delete(req, res, next) {
    try {
      const obra = Obra.findById(req.params.id);
      if (!obra) {
        return next(new AppError('Obra não encontrada.', 404));
      }
      if (req.usuario.tipo_perfil !== 'admin') {
        const artista = Artista.findByUsuarioId(req.usuario.id);
        if (!artista || obra.artista_id !== artista.id) {
          return next(new AppError('Você só pode excluir suas próprias obras.', 403));
        }
      }
      Obra.delete(req.params.id);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }
};

module.exports = obraController;
