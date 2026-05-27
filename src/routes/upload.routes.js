const { Router } = require('express');
const { criarUpload } = require('../utils/upload');
const uploadController = require('../controllers/upload.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

const router = Router();

const uploadAvatar = criarUpload('avatars');
const uploadImagem = criarUpload('imagens');

router.post('/avatar', authMiddleware, uploadAvatar.single('avatar'), uploadController.avatar);
router.post('/imagem', authMiddleware, uploadImagem.single('imagem'), uploadController.imagem);

module.exports = router;
