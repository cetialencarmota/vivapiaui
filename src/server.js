require('./config/database');
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[Viva Piauí] Servidor rodando em http://localhost:${PORT}`);
  console.log(`[Viva Piauí] API disponível em http://localhost:${PORT}/api`);
});
