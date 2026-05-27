const db = require('../config/database');

const Obra = {
  findAll() {
    return db.prepare(`
      SELECT o.*, p.nome_artistico, u.nome as artista_nome
      FROM obras o
      LEFT JOIN perfis_artistas p ON p.id = o.artista_id
      LEFT JOIN usuarios u ON u.id = p.usuario_id
      ORDER BY o.data_criacao DESC
    `).all();
  },

  findAllByArtistaId(artistaId) {
    return db.prepare('SELECT * FROM obras WHERE artista_id = ? ORDER BY data_criacao DESC').all(artistaId);
  },

  findById(id) {
    return db.prepare('SELECT * FROM obras WHERE id = ?').get(id);
  },

  create(data) {
    const stmt = db.prepare(`
      INSERT INTO obras (artista_id, titulo, descricao, categoria, status, imagem_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      data.artista_id, data.titulo, data.descricao,
      data.categoria, data.status || 'Público', data.imagem_url || null
    );
    return this.findById(result.lastInsertRowid);
  },

  update(id, data) {
    const fields = [];
    const values = [];
    const allowed = ['titulo', 'descricao', 'categoria', 'status', 'imagem_url'];
    for (const field of allowed) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(data[field]);
      }
    }
    if (fields.length === 0) return null;
    fields.push('data_atualizacao = CURRENT_TIMESTAMP');
    values.push(id);
    db.prepare(`UPDATE obras SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.findById(id);
  },

  delete(id) {
    return db.prepare('DELETE FROM obras WHERE id = ?').run(id);
  }
};

module.exports = Obra;
