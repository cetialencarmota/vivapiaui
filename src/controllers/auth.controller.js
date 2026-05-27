const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');
const Artista = require('../models/Artista');
const { gerarToken } = require('../middlewares/auth.middleware');
const AppError = require('../utils/AppError');

const authController = {
  async register(req, res, next) {
    try {
      const { nome, email, senha, tipo_perfil } = req.body;
      if (!nome || !email || !senha || !tipo_perfil) {
        return next(new AppError('Todos os campos são obrigatórios.', 400));
      }
      if (!['visitante', 'artista', 'admin'].includes(tipo_perfil)) {
        return next(new AppError('Tipo de perfil inválido.', 400));
      }
      const existente = Usuario.findByEmail(email);
      if (existente) {
        return next(new AppError('Este e-mail já está cadastrado.', 409));
      }
      const senhaHash = bcrypt.hashSync(senha, 10);
      const usuario = Usuario.create({ nome, email, senha: senhaHash, tipo_perfil });

      if (tipo_perfil === 'artista') {
        Artista.create(usuario.id, { nome_artistico: nome });
      }

      const token = gerarToken(usuario);
      res.status(201).json({ usuario, token });
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { email, senha } = req.body;
      if (!email || !senha) {
        return next(new AppError('E-mail e senha são obrigatórios.', 400));
      }
      const usuario = Usuario.findByEmail(email);
      if (!usuario) {
        return next(new AppError('E-mail ou senha inválidos.', 401));
      }
      const senhaValida = bcrypt.compareSync(senha, usuario.senha);
      if (!senhaValida) {
        return next(new AppError('E-mail ou senha inválidos.', 401));
      }
      const token = gerarToken(usuario);
      const { senha: _, ...usuarioSemSenha } = usuario;
      res.json({ usuario: usuarioSemSenha, token });
    } catch (err) {
      next(err);
    }
  },

  async me(req, res, next) {
    try {
      const usuario = Usuario.findById(req.usuario.id);
      if (!usuario) {
        return next(new AppError('Usuário não encontrado.', 404));
      }
      let perfil = null;
      if (usuario.tipo_perfil === 'artista') {
        perfil = Artista.findByUsuarioId(usuario.id);
      }
      res.json({ usuario, perfil });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const usuario = Usuario.update(req.usuario.id, req.body);
      if (!usuario) {
        return next(new AppError('Usuário não encontrado.', 404));
      }
      res.json({ usuario });
    } catch (err) {
      next(err);
    }
  },

  async changePassword(req, res, next) {
    try {
      const { nova_senha } = req.body;
      if (!nova_senha) {
        return next(new AppError('Nova senha é obrigatória.', 400));
      }
      if (nova_senha.length < 6) {
        return next(new AppError('A nova senha deve ter no mínimo 6 caracteres.', 400));
      }
      const usuario = Usuario.findByEmail(req.usuario.email);
      if (!usuario) {
        return next(new AppError('Usuário não encontrado.', 404));
      }
      Usuario.changePassword(usuario.id, bcrypt.hashSync(nova_senha, 10));
      res.json({ mensagem: 'Senha alterada com sucesso.' });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = authController;
