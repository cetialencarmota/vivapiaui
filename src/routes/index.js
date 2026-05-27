const { Router } = require('express');
const authRoutes = require('./auth.routes');
const artistaRoutes = require('./artista.routes');
const pontoRoutes = require('./ponto.routes');
const eventoRoutes = require('./evento.routes');
const obraRoutes = require('./obra.routes');
const mensagemRoutes = require('./mensagem.routes');
const doacaoRoutes = require('./doacao.routes');
const favoritoRoutes = require('./favorito.routes');
const uploadRoutes = require('./upload.routes');
const buscaRoutes = require('./busca.routes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/artistas', artistaRoutes);
router.use('/pontos-culturais', pontoRoutes);
router.use('/eventos', eventoRoutes);
router.use('/obras', obraRoutes);
router.use('/mensagens', mensagemRoutes);
router.use('/doacoes', doacaoRoutes);
router.use('/favoritos', favoritoRoutes);
router.use('/upload', uploadRoutes);
router.use('/busca', buscaRoutes);

module.exports = router;
