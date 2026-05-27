const PontoCultural = require('../models/PontoCultural');
const AppError = require('../utils/AppError');

const pontoController = {
  index(req, res, next) {
    try {
      const { tipo, status } = req.query;
      const pontos = PontoCultural.findAll({ tipo, status });
      res.json(pontos);
    } catch (err) {
      next(err);
    }
  },

  show(req, res, next) {
    try {
      const ponto = PontoCultural.findById(req.params.id);
      if (!ponto) {
        return next(new AppError('Ponto cultural não encontrado.', 404));
      }
      res.json(ponto);
    } catch (err) {
      next(err);
    }
  },

  create(req, res, next) {
    try {
      const data = { ...req.body, criado_por: req.usuario.id };
      const ponto = PontoCultural.create(data);
      res.status(201).json(ponto);
    } catch (err) {
      next(err);
    }
  },

  update(req, res, next) {
    try {
      const ponto = PontoCultural.findById(req.params.id);
      if (!ponto) {
        return next(new AppError('Ponto cultural não encontrado.', 404));
      }
      const atualizado = PontoCultural.update(req.params.id, req.body);
      res.json(atualizado);
    } catch (err) {
      next(err);
    }
  },

  delete(req, res, next) {
    try {
      const ponto = PontoCultural.findById(req.params.id);
      if (!ponto) {
        return next(new AppError('Ponto cultural não encontrado.', 404));
      }
      PontoCultural.delete(req.params.id);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }
};

module.exports = pontoController;
