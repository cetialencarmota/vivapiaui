const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, '..', '..', 'data', 'viva_piaui.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function colunaExiste(nomeTabela, nomeColuna) {
  const rows = db.prepare(`PRAGMA table_info(${nomeTabela})`).all();
  return rows.some(row => row.name === nomeColuna);
}

function adicionarColuna(tabela, coluna, definicao) {
  if (colunaExiste(tabela, coluna)) return false;
  db.exec(`ALTER TABLE ${tabela} ADD COLUMN ${coluna} ${definicao}`);
  return true;
}

function inicializarTabelas() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL,
      tipo_perfil TEXT CHECK(tipo_perfil IN ('visitante', 'artista', 'admin')) NOT NULL,
      data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
      avatar_url TEXT,
      cidade TEXT,
      bio TEXT
    );

    CREATE TABLE IF NOT EXISTS perfis_artistas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER UNIQUE NOT NULL,
      biografia TEXT,
      especialidade TEXT,
      portfolio_url TEXT,
      redes_sociais TEXT,
      nome_artistico TEXT,
      chave_pix TEXT,
      instagram TEXT,
      whatsapp TEXT,
      foto_url TEXT,
      capa_url TEXT,
      localizacao TEXT,
      categoria_artistica TEXT,
      FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS pontos_culturais (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      descricao TEXT,
      categoria TEXT,
      latitude REAL,
      longitude REAL,
      endereco TEXT,
      imagem_url TEXT,
      criado_por INTEGER,
      tipo TEXT CHECK(tipo IN ('Lugar','Evento','Artista')),
      status TEXT CHECK(status IN ('Publicado','Rascunho')) DEFAULT 'Rascunho',
      data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
      data_atualizacao DATETIME,
      FOREIGN KEY (criado_por) REFERENCES usuarios (id)
    );

    CREATE TABLE IF NOT EXISTS obras (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      artista_id INTEGER NOT NULL,
      titulo TEXT NOT NULL,
      descricao TEXT NOT NULL,
      categoria TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('Público','Rascunho')),
      imagem_url TEXT,
      data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
      data_atualizacao DATETIME,
      FOREIGN KEY (artista_id) REFERENCES perfis_artistas (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS mensagens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      artista_id INTEGER NOT NULL,
      remetente_id INTEGER,
      nome TEXT,
      email TEXT,
      mensagem TEXT NOT NULL,
      lida INTEGER DEFAULT 0,
      data_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (artista_id) REFERENCES perfis_artistas (id) ON DELETE CASCADE,
      FOREIGN KEY (remetente_id) REFERENCES usuarios (id)
    );

    CREATE TABLE IF NOT EXISTS eventos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      descricao TEXT,
      data_inicio TEXT,
      data_fim TEXT,
      mes TEXT,
      local TEXT,
      endereco TEXT,
      imagem_url TEXT,
      tags TEXT,
      criado_por INTEGER,
      status TEXT DEFAULT 'Rascunho' CHECK(status IN ('Publicado','Rascunho')),
      data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
      data_atualizacao DATETIME,
      FOREIGN KEY (criado_por) REFERENCES usuarios (id)
    );

    CREATE TABLE IF NOT EXISTS participacoes_eventos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      artista_id INTEGER NOT NULL,
      evento_id INTEGER NOT NULL,
      status_participacao TEXT,
      FOREIGN KEY (artista_id) REFERENCES perfis_artistas (id) ON DELETE CASCADE,
      FOREIGN KEY (evento_id) REFERENCES eventos (id) ON DELETE CASCADE,
      UNIQUE(artista_id, evento_id)
    );

    CREATE TABLE IF NOT EXISTS doacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      artista_id INTEGER NOT NULL,
      visitante_id INTEGER,
      valor REAL NOT NULL,
      data_doacao DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (artista_id) REFERENCES perfis_artistas (id) ON DELETE CASCADE,
      FOREIGN KEY (visitante_id) REFERENCES usuarios (id)
    );

    CREATE TABLE IF NOT EXISTS favoritos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      artista_id INTEGER NOT NULL,
      data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE,
      FOREIGN KEY (artista_id) REFERENCES perfis_artistas (id) ON DELETE CASCADE,
      UNIQUE(usuario_id, artista_id)
    );
  `);
}

function migrarTabelas() {
  const migracoes = [
    ['usuarios', 'avatar_url', 'TEXT'],
    ['usuarios', 'cidade', 'TEXT'],
    ['usuarios', 'bio', 'TEXT'],
    ['perfis_artistas', 'nome_artistico', 'TEXT'],
    ['perfis_artistas', 'chave_pix', 'TEXT'],
    ['perfis_artistas', 'instagram', 'TEXT'],
    ['perfis_artistas', 'whatsapp', 'TEXT'],
    ['perfis_artistas', 'foto_url', 'TEXT'],
    ['perfis_artistas', 'capa_url', 'TEXT'],
    ['perfis_artistas', 'localizacao', 'TEXT'],
    ['perfis_artistas', 'categoria_artistica', 'TEXT'],
    ['pontos_culturais', 'tipo', 'TEXT CHECK(tipo IN (\'Lugar\',\'Evento\',\'Artista\'))'],
    ['pontos_culturais', 'status', 'TEXT CHECK(status IN (\'Publicado\',\'Rascunho\')) DEFAULT \'Rascunho\''],
    ['pontos_culturais', 'data_criacao', 'DATETIME DEFAULT CURRENT_TIMESTAMP'],
    ['pontos_culturais', 'data_atualizacao', 'DATETIME'],
    ['eventos', 'latitude', 'REAL'],
    ['eventos', 'longitude', 'REAL']
  ];
  for (const [tabela, coluna, definicao] of migracoes) {
    try {
      adicionarColuna(tabela, coluna, definicao);
    } catch (err) {
      if (!err.message.includes('duplicate column')) {
        console.warn(`Migração ignorada: ${tabela}.${coluna} - ${err.message}`);
      }
    }
  }
}

inicializarTabelas();
migrarTabelas();

module.exports = db;
