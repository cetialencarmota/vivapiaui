const { Router } = require('express');
const mensagemController = require('../controllers/mensagem.controller');
const { authMiddleware, optionalAuthMiddleware, authorizeMiddleware } = require('../middlewares/auth.middleware');

const router = Router();

router.get('/', authMiddleware, authorizeMiddleware('artista', 'admin'), mensagemController.index);
router.get('/:id', authMiddleware, authorizeMiddleware('artista', 'admin'), mensagemController.show);
router.patch('/:id/lida', authMiddleware, authorizeMiddleware('artista', 'admin'), mensagemController.marcarLida);
router.post('/', optionalAuthMiddleware, mensagemController.create);

module.exports = router;
