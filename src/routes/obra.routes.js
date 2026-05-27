const { Router } = require('express');
const obraController = require('../controllers/obra.controller');
const { authMiddleware, authorizeMiddleware } = require('../middlewares/auth.middleware');

const router = Router();

router.get('/', authMiddleware, authorizeMiddleware('artista', 'admin'), obraController.index);
router.get('/:id', authMiddleware, obraController.show);
router.post('/', authMiddleware, authorizeMiddleware('artista'), obraController.create);
router.put('/:id', authMiddleware, authorizeMiddleware('artista', 'admin'), obraController.update);
router.delete('/:id', authMiddleware, authorizeMiddleware('artista', 'admin'), obraController.delete);

module.exports = router;
