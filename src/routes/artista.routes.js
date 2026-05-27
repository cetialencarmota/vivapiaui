const { Router } = require('express');
const artistaController = require('../controllers/artista.controller');
const { authMiddleware, authorizeMiddleware } = require('../middlewares/auth.middleware');

const router = Router();

router.get('/', artistaController.index);
router.get('/me', authMiddleware, authorizeMiddleware('artista', 'admin'), artistaController.showMe);
router.get('/:id', artistaController.show);
router.put('/me', authMiddleware, authorizeMiddleware('artista', 'admin'), artistaController.update);
router.put('/:id', authMiddleware, authorizeMiddleware('admin'), artistaController.update);

module.exports = router;
