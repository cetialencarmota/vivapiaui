const db = require('../config/database');

const Favorito = {
  findAllByUsuarioId(usuarioId) {
    return db.prepare(`
      SELECT f.*, p.nome_artistico, p.categoria_artistica, p.localizacao, p.foto_url,
             u.nome, u.avatar_url
      FROM favoritos f
      JOIN perfis_artistas p ON p.id = f.artista_id
      JOIN usuarios u ON u.id = p.usuario_id
      WHERE f.usuario_id = ?
      ORDER BY f.data_criacao DESC
    `).all(usuarioId);
  },

  create(usuarioId, artistaId) {
    const stmt = db.prepare('INSERT OR IGNORE INTO favoritos (usuario_id, artista_id) VALUES (?, ?)');
    const result = stmt.run(usuarioId, artistaId);
    if (result.changes === 0) return null;
    return { id: result.lastInsertRowid, usuario_id: usuarioId, artista_id: artistaId };
  },

  delete(usuarioId, artistaId) {
    return db.prepare('DELETE FROM favoritos WHERE usuario_id = ? AND artista_id = ?').run(usuarioId, artistaId);
  },

  findByUsuarioAndArtista(usuarioId, artistaId) {
    return db.prepare('SELECT * FROM favoritos WHERE usuario_id = ? AND artista_id = ?').get(usuarioId, artistaId);
  }
};

module.exports = Favorito;
