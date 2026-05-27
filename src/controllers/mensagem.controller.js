const Mensagem = require('../models/Mensagem');
const Artista = require('../models/Artista');
const AppError = require('../utils/AppError');

const mensagemController = {
  index(req, res, next) {
    try {
      if (req.usuario.tipo_perfil === 'admin') {
        const mensagens = Mensagem.findAll();
        return res.json(mensagens);
      }
      const artista = Artista.findByUsuarioId(req.usuario.id);
      if (!artista) {
        return next(new AppError('Perfil de artista não encontrado.', 404));
      }
      const mensagens = Mensagem.findAllByArtistaId(artista.id);
      res.json(mensagens);
    } catch (err) {
      next(err);
    }
  },

  show(req, res, next) {
    try {
      const mensagem = Mensagem.findById(req.params.id);
      if (!mensagem) {
        return next(new AppError('Mensagem não encontrada.', 404));
      }
      const artista = Artista.findByUsuarioId(req.usuario.id);
      if (!artista || mensagem.artista_id !== artista.id) {
        if (req.usuario.tipo_perfil !== 'admin') {
          return next(new AppError('Acesso negado.', 403));
        }
      }
      if (mensagem.remetente_id) {
        const db = require('../config/database');
        const usuario = db.prepare('SELECT avatar_url, nome FROM usuarios WHERE id = ?').get(mensagem.remetente_id);
        if (usuario) {
          mensagem.avatar_url = usuario.avatar_url;
          mensagem.remetente_nome = usuario.nome;
        }
      }
      res.json(mensagem);
    } catch (err) {
      next(err);
    }
  },

  marcarLida(req, res, next) {
    try {
      const mensagem = Mensagem.findById(req.params.id);
      if (!mensagem) {
        return next(new AppError('Mensagem não encontrada.', 404));
      }
      const artista = Artista.findByUsuarioId(req.usuario.id);
      if (!artista || mensagem.artista_id !== artista.id) {
        if (req.usuario.tipo_perfil !== 'admin') {
          return next(new AppError('Acesso negado.', 403));
        }
      }
      const atualizada = Mensagem.marcarComoLida(req.params.id);
      res.json(atualizada);
    } catch (err) {
      next(err);
    }
  },

  create(req, res, next) {
    try {
      const { artista_id, nome, email, mensagem } = req.body;
      if (!artista_id || !mensagem) {
        return next(new AppError('Artista e mensagem são obrigatórios.', 400));
      }
      const artista = Artista.findById(artista_id);
      if (!artista) {
        return next(new AppError('Artista não encontrado.', 404));
      }
      const data = {
        artista_id,
        remetente_id: req.usuario ? req.usuario.id : null,
        nome: nome || (req.usuario ? req.usuario.nome : null),
        email: email || (req.usuario ? req.usuario.email : null),
        mensagem
      };
      const novaMensagem = Mensagem.create(data);
      res.status(201).json(novaMensagem);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = mensagemController;
