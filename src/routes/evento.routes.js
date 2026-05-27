const { Router } = require('express');
const eventoController = require('../controllers/evento.controller');
const { authMiddleware, authorizeMiddleware } = require('../middlewares/auth.middleware');

const router = Router();

router.get('/', eventoController.index);
router.get('/:id', eventoController.show);
router.post('/', authMiddleware, authorizeMiddleware('artista', 'admin'), eventoController.create);
router.put('/:id', authMiddleware, authorizeMiddleware('artista', 'admin'), eventoController.update);
router.delete('/:id', authMiddleware, authorizeMiddleware('artista', 'admin'), eventoController.delete);

module.exports = router;
