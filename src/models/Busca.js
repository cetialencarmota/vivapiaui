const db = require('../config/database');

const Busca = {
  buscar(q) {
    const term = `%${q}%`;
    const artistas = db.prepare(`
      SELECT p.id, p.nome_artistico AS nome, p.categoria_artistica AS categoria,
             p.foto_url AS imagem, p.localizacao, 'artista' AS tipo,
             p.biografia AS descricao
      FROM perfis_artistas p
      JOIN usuarios u ON u.id = p.usuario_id
      WHERE p.nome_artistico LIKE ? OR p.biografia LIKE ? OR p.categoria_artistica LIKE ?
         OR u.nome LIKE ?
    `).all(term, term, term, term);

    const eventos = db.prepare(`
      SELECT id, nome, descricao, data_inicio, local, imagem_url AS imagem,
             'evento' AS tipo
      FROM eventos
      WHERE status = 'Publicado'
        AND (nome LIKE ? OR descricao LIKE ? OR local LIKE ?)
    `).all(term, term, term);

    const pontos = db.prepare(`
      SELECT id, nome, descricao, categoria, endereco, imagem_url AS imagem,
             tipo AS subtipo, 'ponto' AS tipo
      FROM pontos_culturais
      WHERE status = 'Publicado'
        AND (nome LIKE ? OR descricao LIKE ? OR categoria LIKE ? OR endereco LIKE ?)
    `).all(term, term, term, term);

    return { artistas, eventos, pontos };
  }
};

module.exports = Busca;
