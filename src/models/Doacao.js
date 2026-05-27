const db = require('../config/database');

const Doacao = {
  findAllByArtistaId(artistaId) {
    return db.prepare('SELECT * FROM doacoes WHERE artista_id = ? ORDER BY data_doacao DESC').all(artistaId);
  },

  create({ artista_id, visitante_id, valor }) {
    const stmt = db.prepare('INSERT INTO doacoes (artista_id, visitante_id, valor) VALUES (?, ?, ?)');
    const result = stmt.run(artista_id, visitante_id || null, valor);
    return { id: result.lastInsertRowid, artista_id, visitante_id, valor };
  },

  totalPorArtista(artistaId) {
    return db.prepare('SELECT COALESCE(SUM(valor), 0) as total FROM doacoes WHERE artista_id = ?').get(artistaId);
  },

  findAll() {
    return db.prepare(`
      SELECT d.*, p.nome_artistico, p.categoria_artistica, p.localizacao, p.foto_url,
             u.nome, u.avatar_url
      FROM doacoes d
      JOIN perfis_artistas p ON p.id = d.artista_id
      JOIN usuarios u ON u.id = p.usuario_id
      ORDER BY d.data_doacao DESC
    `).all();
  },

  findAllByVisitanteId(visitanteId) {
    return db.prepare(`
      SELECT d.*, p.nome_artistico, p.categoria_artistica, p.localizacao, p.foto_url,
             u.nome, u.avatar_url
      FROM doacoes d
      JOIN perfis_artistas p ON p.id = d.artista_id
      JOIN usuarios u ON u.id = p.usuario_id
      WHERE d.visitante_id = ?
      ORDER BY d.data_doacao DESC
    `).all(visitanteId);
  }
};

module.exports = Doacao;
