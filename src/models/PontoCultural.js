const db = require('../config/database');

const PontoCultural = {
  findAll(filters = {}) {
    let sql = 'SELECT * FROM pontos_culturais WHERE 1=1';
    const params = [];
    if (filters.tipo) { sql += ' AND tipo = ?'; params.push(filters.tipo); }
    if (filters.status) { sql += ' AND status = ?'; params.push(filters.status); }
    sql += ' ORDER BY data_criacao DESC';
    return db.prepare(sql).all(...params);
  },

  findById(id) {
    return db.prepare('SELECT * FROM pontos_culturais WHERE id = ?').get(id);
  },

  create(data) {
    const stmt = db.prepare(`
      INSERT INTO pontos_culturais (nome, descricao, categoria, latitude, longitude, endereco, imagem_url, criado_por, tipo, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      data.nome, data.descricao || null, data.categoria || null,
      data.latitude || null, data.longitude || null, data.endereco || null,
      data.imagem_url || null, data.criado_por || null, data.tipo || 'Lugar',
      data.status || 'Rascunho'
    );
    return this.findById(result.lastInsertRowid);
  },

  update(id, data) {
    const fields = [];
    const values = [];
    const allowed = ['nome', 'descricao', 'categoria', 'latitude', 'longitude', 'endereco', 'imagem_url', 'tipo', 'status'];
    for (const field of allowed) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(data[field]);
      }
    }
    if (fields.length === 0) return null;
    fields.push('data_atualizacao = CURRENT_TIMESTAMP');
    values.push(id);
    db.prepare(`UPDATE pontos_culturais SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.findById(id);
  },

  delete(id) {
    return db.prepare('DELETE FROM pontos_culturais WHERE id = ?').run(id);
  }
};

module.exports = PontoCultural;
