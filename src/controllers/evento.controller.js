const Evento = require('../models/Evento');
const AppError = require('../utils/AppError');

function verificarProprietarioOuAdmin(evento, req) {
  if (req.usuario.tipo_perfil === 'admin') return true;
  return evento.criado_por === req.usuario.id;
}

const eventoController = {
  index(req, res, next) {
    try {
      const { status, mes } = req.query;
      const eventos = Evento.findAll({ status, mes });
      res.json(eventos);
    } catch (err) {
      next(err);
    }
  },

  show(req, res, next) {
    try {
      const evento = Evento.findById(req.params.id);
      if (!evento) {
        return next(new AppError('Evento não encontrado.', 404));
      }
      if (evento.tags) {
        evento.tags = JSON.parse(evento.tags);
      }
      res.json(evento);
    } catch (err) {
      next(err);
    }
  },

  create(req, res, next) {
    try {
      const data = { ...req.body, criado_por: req.usuario.id };
      const evento = Evento.create(data);
      res.status(201).json(evento);
    } catch (err) {
      next(err);
    }
  },

  update(req, res, next) {
    try {
      const evento = Evento.findById(req.params.id);
      if (!evento) {
        return next(new AppError('Evento não encontrado.', 404));
      }
      if (!verificarProprietarioOuAdmin(evento, req)) {
        return next(new AppError('Você só pode editar seus próprios eventos.', 403));
      }
      const atualizado = Evento.update(req.params.id, req.body);
      res.json(atualizado);
    } catch (err) {
      next(err);
    }
  },

  delete(req, res, next) {
    try {
      const evento = Evento.findById(req.params.id);
      if (!evento) {
        return next(new AppError('Evento não encontrado.', 404));
      }
      if (!verificarProprietarioOuAdmin(evento, req)) {
        return next(new AppError('Você só pode excluir seus próprios eventos.', 403));
      }
      Evento.delete(req.params.id);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }
};

module.exports = eventoController;
