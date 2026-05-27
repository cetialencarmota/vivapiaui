const db = require('../config/database');

const Artista = {
  findAll() {
    return db.prepare(`
      SELECT p.*, u.nome, u.email, u.cidade, u.avatar_url
      FROM perfis_artistas p
      JOIN usuarios u ON u.id = p.usuario_id
    `).all();
  },

  findById(id) {
    return db.prepare(`
      SELECT p.*, u.nome, u.email, u.cidade, u.avatar_url
      FROM perfis_artistas p
      JOIN usuarios u ON u.id = p.usuario_id
      WHERE p.id = ?
    `).get(id);
  },

  findByUsuarioId(usuarioId) {
    return db.prepare(`
      SELECT p.*, u.nome, u.email, u.cidade, u.avatar_url
      FROM perfis_artistas p
      JOIN usuarios u ON u.id = p.usuario_id
      WHERE p.usuario_id = ?
    `).get(usuarioId);
  },

  create(usuarioId, data = {}) {
    const stmt = db.prepare(`
      INSERT INTO perfis_artistas (usuario_id, biografia, especialidade, nome_artistico, chave_pix, instagram, whatsapp, foto_url, capa_url, localizacao, categoria_artistica)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      usuarioId,
      data.biografia || null,
      data.especialidade || null,
      data.nome_artistico || null,
      data.chave_pix || null,
      data.instagram || null,
      data.whatsapp || null,
      data.foto_url || null,
      data.capa_url || null,
      data.localizacao || null,
      data.categoria_artistica || null
    );
    return this.findById(result.lastInsertRowid);
  },

  update(id, data) {
    const fields = [];
    const values = [];
    const allowed = ['biografia', 'especialidade', 'nome_artistico', 'chave_pix', 'instagram', 'whatsapp', 'foto_url', 'capa_url', 'localizacao', 'categoria_artistica', 'portfolio_url', 'redes_sociais'];
    for (const field of allowed) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(data[field]);
      }
    }
    if (fields.length === 0) return null;
    values.push(id);
    db.prepare(`UPDATE perfis_artistas SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.findById(id);
  }
};

module.exports = Artista;
