const db = require('../config/database');

const Usuario = {
  findAll() {
    return db.prepare('SELECT id, nome, email, tipo_perfil, data_cadastro, avatar_url, cidade, bio FROM usuarios').all();
  },

  findById(id) {
    return db.prepare('SELECT id, nome, email, tipo_perfil, data_cadastro, avatar_url, cidade, bio FROM usuarios WHERE id = ?').get(id);
  },

  findByEmail(email) {
    return db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);
  },

  create({ nome, email, senha, tipo_perfil }) {
    const stmt = db.prepare('INSERT INTO usuarios (nome, email, senha, tipo_perfil) VALUES (?, ?, ?, ?)');
    const result = stmt.run(nome, email, senha, tipo_perfil);
    return { id: result.lastInsertRowid, nome, email, tipo_perfil };
  },

  update(id, { nome, cidade, bio, avatar_url }) {
    const fields = [];
    const values = [];
    if (nome !== undefined) { fields.push('nome = ?'); values.push(nome); }
    if (cidade !== undefined) { fields.push('cidade = ?'); values.push(cidade); }
    if (bio !== undefined) { fields.push('bio = ?'); values.push(bio); }
    if (avatar_url !== undefined) { fields.push('avatar_url = ?'); values.push(avatar_url); }
    if (fields.length === 0) return null;
    values.push(id);
    db.prepare(`UPDATE usuarios SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.findById(id);
  },

  changePassword(id, novaSenha) {
    db.prepare('UPDATE usuarios SET senha = ? WHERE id = ?').run(novaSenha, id);
    return this.findById(id);
  }
};

module.exports = Usuario;
