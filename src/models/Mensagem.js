const db = require('../config/database');

const Mensagem = {
  findAll() {
    return db.prepare(`
      SELECT m.*, p.nome_artistico, u.nome as artista_nome
      FROM mensagens m
      LEFT JOIN perfis_artistas p ON p.id = m.artista_id
      LEFT JOIN usuarios u ON u.id = p.usuario_id
      ORDER BY m.data_envio DESC
    `).all();
  },

  findAllByArtistaId(artistaId) {
    return db.prepare(`
      SELECT m.*, u.avatar_url, u.nome as remetente_nome
      FROM mensagens m
      LEFT JOIN usuarios u ON u.id = m.remetente_id
      WHERE m.artista_id = ?
      ORDER BY m.data_envio DESC
    `).all(artistaId);
  },

  findById(id) {
    return db.prepare('SELECT * FROM mensagens WHERE id = ?').get(id);
  },

  create({ artista_id, remetente_id, nome, email, mensagem }) {
    const stmt = db.prepare(`
      INSERT INTO mensagens (artista_id, remetente_id, nome, email, mensagem)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(artista_id, remetente_id || null, nome || null, email || null, mensagem);
    return this.findById(result.lastInsertRowid);
  },

  marcarComoLida(id) {
    db.prepare('UPDATE mensagens SET lida = 1 WHERE id = ?').run(id);
    return this.findById(id);
  }
};

module.exports = Mensagem;
