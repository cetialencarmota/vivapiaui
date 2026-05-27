const { Router } = require('express');
const buscaController = require('../controllers/busca.controller');

const router = Router();

router.get('/', buscaController.buscar);

module.exports = router;
