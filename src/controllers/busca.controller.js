const Busca = require('../models/Busca');

const buscaController = {
  buscar(req, res, next) {
    try {
      const { q } = req.query;
      if (!q || !q.trim()) {
        return res.json({ artistas: [], eventos: [], pontos: [] });
      }
      const resultados = Busca.buscar(q.trim());
      res.json(resultados);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = buscaController;
