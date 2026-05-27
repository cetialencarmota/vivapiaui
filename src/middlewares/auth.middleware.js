const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const Usuario = require('../models/Usuario');

const JWT_SECRET = process.env.JWT_SECRET || 'viva-piaui-jwt-secret-dev';

function gerarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, email: usuario.email, tipo_perfil: usuario.tipo_perfil },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) {
    return next(new AppError('Token de autenticação não fornecido.', 401));
  }
  const token = header.startsWith('Bearer ') ? header.slice(7) : header;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const usuario = Usuario.findById(decoded.id);
    if (!usuario) {
      return next(new AppError('Usuário não encontrado.', 401));
    }
    req.usuario = usuario;
    next();
  } catch (err) {
    return next(new AppError('Token inválido ou expirado.', 401));
  }
}

function optionalAuthMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) {
    return next();
  }
  const token = header.startsWith('Bearer ') ? header.slice(7) : header;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const usuario = Usuario.findById(decoded.id);
    if (usuario) {
      req.usuario = usuario;
    }
  } catch (err) {
    // token inválido — segue sem usuario
  }
  next();
}

function authorizeMiddleware(...perfisPermitidos) {
  return function (req, res, next) {
    if (!req.usuario) {
      return next(new AppError('Autenticação necessária.', 401));
    }
    if (!perfisPermitidos.includes(req.usuario.tipo_perfil)) {
      return next(new AppError('Acesso não autorizado para este perfil.', 403));
    }
    next();
  };
}

module.exports = { authMiddleware, optionalAuthMiddleware, authorizeMiddleware, gerarToken, JWT_SECRET };
