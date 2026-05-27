const { Router } = require('express');
const doacaoController = require('../controllers/doacao.controller');
const { authMiddleware, optionalAuthMiddleware } = require('../middlewares/auth.middleware');

const router = Router();

router.get('/', authMiddleware, doacaoController.index);
router.post('/', optionalAuthMiddleware, doacaoController.create);

module.exports = router;
