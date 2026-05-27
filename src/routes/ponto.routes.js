const { Router } = require('express');
const pontoController = require('../controllers/ponto.controller');
const { authMiddleware, authorizeMiddleware } = require('../middlewares/auth.middleware');

const router = Router();

router.get('/', pontoController.index);
router.get('/:id', pontoController.show);
router.post('/', authMiddleware, authorizeMiddleware('admin'), pontoController.create);
router.put('/:id', authMiddleware, authorizeMiddleware('admin'), pontoController.update);
router.delete('/:id', authMiddleware, authorizeMiddleware('admin'), pontoController.delete);

module.exports = router;
