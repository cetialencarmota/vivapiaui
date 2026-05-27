const db = require('../config/database');

const Evento = {
  findAll(filters = {}) {
    let sql = 'SELECT *, nome as titulo FROM eventos WHERE 1=1';
    const params = [];
    if (filters.status) { sql += ' AND status = ?'; params.push(filters.status); }
    if (filters.mes) { sql += ' AND mes = ?'; params.push(filters.mes); }
    sql += ' ORDER BY data_criacao DESC';
    return db.prepare(sql).all(...params);
  },

  findById(id) {
    return db.prepare('SELECT *, nome as titulo FROM eventos WHERE id = ?').get(id);
  },

  create(data) {
    const nome = data.nome || data.titulo;
    const stmt = db.prepare(`
      INSERT INTO eventos (nome, descricao, data_inicio, data_fim, mes, local, endereco, imagem_url, tags, latitude, longitude, criado_por, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      nome, data.descricao || null, data.data_inicio || null,
      data.data_fim || null, data.mes || null, data.local || null,
      data.endereco || null, data.imagem_url || null,
      data.tags ? JSON.stringify(data.tags) : null,
      data.latitude || null, data.longitude || null,
      data.criado_por || null, data.status || 'Rascunho'
    );
    return this.findById(result.lastInsertRowid);
  },

  update(id, data) {
    const fields = [];
    const values = [];
    if (data.titulo !== undefined) { data.nome = data.titulo; }
    const allowed = ['nome', 'descricao', 'data_inicio', 'data_fim', 'mes', 'local', 'endereco', 'imagem_url', 'tags', 'latitude', 'longitude', 'status'];
    for (const field of allowed) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(field === 'tags' ? JSON.stringify(data[field]) : data[field]);
      }
    }
    if (fields.length === 0) return null;
    fields.push('data_atualizacao = CURRENT_TIMESTAMP');
    values.push(id);
    db.prepare(`UPDATE eventos SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.findById(id);
  },

  delete(id) {
    return db.prepare('DELETE FROM eventos WHERE id = ?').run(id);
  }
};

module.exports = Evento;
