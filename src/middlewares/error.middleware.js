function errorMiddleware(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Erro interno do servidor.';
  console.error(`[ERROR] ${statusCode} - ${err.message}`);
  if (!err.isOperational) {
    console.error(err.stack);
  }
  res.status(statusCode).json({
    error: {
      message,
      status: statusCode
    }
  });
}

module.exports = errorMiddleware;
