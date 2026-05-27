const { Router } = require('express');
const favoritoController = require('../controllers/favorito.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

const router = Router();

router.use(authMiddleware);
router.get('/', favoritoController.index);
router.get('/check/:artistaId', favoritoController.check);
router.post('/', favoritoController.create);
router.delete('/:artistaId', favoritoController.delete);

module.exports = router;
