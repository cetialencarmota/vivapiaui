# Mapeamento de Dados — Viva Piauí

## Legenda

- ✅ Implementado em `database.js`

---

## ✅ `usuarios`

| Campo | Tipo | Origem | Status |
|-------|------|--------|--------|
| `id` | INTEGER PK | Auto incremento | ✅ |
| `nome` | TEXT NOT NULL | `cadastro.html` → input "Nome completo" | ✅ |
| `email` | TEXT UNIQUE NOT NULL | `cadastro.html` → input "E-mail" | ✅ |
| `senha` | TEXT NOT NULL | `cadastro.html` → input "Senha" | ✅ |
| `tipo_perfil` | TEXT CHECK('visitante','artista') | `cadastro.html` → radio "Tipo de perfil" | ✅ |
| `data_cadastro` | DATETIME DEFAULT CURRENT_TIMESTAMP | Auto | ✅ |
| `avatar_url` | TEXT | `perfil-visitante.html` → upload de foto | ✅ |
| `cidade` | TEXT | `perfil-visitante.js` → campo `cidade` | ✅ |
| `bio` | TEXT | `perfil-visitante.js` → campo `bio` | ✅ |

---

## ✅ `perfis_artistas`

| Campo | Tipo | Origem | Status |
|-------|------|--------|--------|
| `id` | INTEGER PK | Auto incremento | ✅ |
| `usuario_id` | INTEGER UNIQUE FK → `usuarios.id` | Relação | ✅ |
| `biografia` | TEXT | `artista-configuracoes.js` → `biografia` | ✅ |
| `especialidade` | TEXT | `perfil-artista.html` → "Mestre da Cerâmica" | ✅ |
| `portfolio_url` | TEXT | Campo genérico | ✅ |
| `redes_sociais` | TEXT (JSON string) | Genérico | ✅ |
| `nome_artistico` | TEXT | `artista-configuracoes.js` → `nome-artistico` | ✅ |
| `chave_pix` | TEXT | `artista-configuracoes.js` → `chave-pix` | ✅ |
| `instagram` | TEXT | `artista-configuracoes.js` → `instagram` | ✅ |
| `whatsapp` | TEXT | `artista-configuracoes.js` → `whatsapp` | ✅ |
| `foto_url` | TEXT | Upload de foto do perfil | ✅ |
| `capa_url` | TEXT | Upload de foto de capa | ✅ |
| `localizacao` | TEXT | `perfil-artista.html` → "Teresina, Piauí" | ✅ |
| `categoria_artistica` | TEXT | `perfil-artista.html` → "Artesanato, Cerâmica" | ✅ |

---

## ✅ `pontos_culturais`

| Campo | Tipo | Origem | Status |
|-------|------|--------|--------|
| `id` | INTEGER PK | Auto incremento | ✅ |
| `nome` | TEXT NOT NULL | `painel-admin.html` → input `nome` | ✅ |
| `descricao` | TEXT | `painel-admin.html` → textarea `descricao` | ✅ |
| `categoria` | TEXT | `painel-admin.html` → select `categoria` (museu, monumento, natureza, teatro) | ✅ |
| `latitude` | REAL | Coordenadas do mapa | ✅ |
| `longitude` | REAL | Coordenadas do mapa | ✅ |
| `endereco` | TEXT | `painel-admin.html` → input `localizacao` | ✅ |
| `imagem_url` | TEXT | Upload de imagem | ✅ |
| `criado_por` | INTEGER FK → `usuarios.id` | Admin que criou | ✅ |
| `tipo` | TEXT ('Lugar','Evento','Artista') | `painel-admin.js` → filtros de tipo | ✅ |
| `status` | TEXT ('Publicado','Rascunho') | `painel-admin.js` → `item.status` | ✅ |
| `data_criacao` | DATETIME DEFAULT CURRENT_TIMESTAMP | Auto | ✅ |
| `data_atualizacao` | DATETIME | Auto | ✅ |

---

## ✅ `obras` (Portfólio do Artista)

| Campo | Tipo | Origem | Status |
|-------|------|--------|--------|
| `id` | INTEGER PK | Auto incremento | ✅ |
| `artista_id` | INTEGER FK → `perfis_artistas.id` ON DELETE CASCADE | Relação | ✅ |
| `titulo` | TEXT NOT NULL | `portfolio-artista.html` → `tituloObra` | ✅ |
| `descricao` | TEXT | `portfolio-artista.html` → `descricaoObra` (max 500 caracteres) | ✅ |
| `categoria` | TEXT NOT NULL | `portfolio-artista.html` → `categoriaObra` (Cerâmicas, Pinturas, Artesanato, Fotografias) | ✅ |
| `status` | TEXT NOT NULL CHECK('Público','Rascunho') | `portfolio-artista.html` → radio `visibilidade` | ✅ |
| `imagem_url` | TEXT | Upload de imagem da obra | ✅ |
| `data_criacao` | DATETIME DEFAULT CURRENT_TIMESTAMP | Auto | ✅ |
| `data_atualizacao` | DATETIME | Auto | ✅ |

**Referência no frontend:** `app.js` → array `obras` (linha 298) e formulário `formNovaObra`

---

## ✅ `mensagens` (Mensagens para Artistas)

| Campo | Tipo | Origem | Status |
|-------|------|--------|--------|
| `id` | INTEGER PK | Auto incremento | ✅ |
| `artista_id` | INTEGER FK → `perfis_artistas.id` ON DELETE CASCADE | Artista destinatário | ✅ |
| `remetente_id` | INTEGER FK → `usuarios.id` | NULL se visitante não logado | ✅ |
| `nome` | TEXT | `perfil-artista.html` → `msg-nome` | ✅ |
| `email` | TEXT | `perfil-artista.html` → `msg-email` | ✅ |
| `mensagem` | TEXT NOT NULL | `perfil-artista.html` → `msg-texto` | ✅ |
| `lida` | INTEGER DEFAULT 0 (0/1) | Controle de leitura | ✅ |
| `data_envio` | DATETIME DEFAULT CURRENT_TIMESTAMP | Auto | ✅ |

**Referência no frontend:** `app.js` → formulário `form-mensagem` (linha 257) e modal `#modal-mensagem`

---

## ✅ `eventos`

| Campo | Tipo | Origem | Status |
|-------|------|--------|--------|
| `id` | INTEGER PK | Auto incremento | ✅ |
| `nome` | TEXT NOT NULL | `eventos.html` → título do evento | ✅ |
| `descricao` | TEXT | `eventos.html` → parágrafo de descrição | ✅ |
| `data_inicio` | TEXT | `eventos.html` → ex: "02 a 12" | ✅ |
| `data_fim` | TEXT | `eventos.html` | ✅ |
| `mes` | TEXT | `eventos.html` → ex: "JUN" | ✅ |
| `local` | TEXT | `eventos.html` → ex: "Piracuruca - PI" | ✅ |
| `endereco` | TEXT | Opcional | ✅ |
| `imagem_url` | TEXT | URL da imagem do evento | ✅ |
| `tags` | TEXT (JSON array) | `eventos.html` → ex: `["Tradição Cultural", "Religioso"]` | ✅ |
| `criado_por` | INTEGER FK → `usuarios.id` | Admin que criou | ✅ |
| `status` | TEXT DEFAULT 'Rascunho' CHECK('Publicado','Rascunho') | Controle de publicação | ✅ |
| `data_criacao` | DATETIME DEFAULT CURRENT_TIMESTAMP | Auto | ✅ |
| `data_atualizacao` | DATETIME | Auto | ✅ |

**Referência no frontend:** `eventos.html` → dados hardcoded no HTML

---

## ✅ `participacoes_eventos` (Relação N:N Artistas ↔ Eventos)

| Campo | Tipo | Origem | Status |
|-------|------|--------|--------|
| `id` | INTEGER PK | Auto incremento | ✅ |
| `artista_id` | INTEGER FK → `perfis_artistas.id` ON DELETE CASCADE | Artista participante | ✅ |
| `evento_id` | INTEGER FK → `eventos.id` ON DELETE CASCADE | Evento | ✅ |
| `status_participacao` | TEXT | `perfil-artista.html` → "Artesã Confirmada" / "Participante" | ✅ |

**Referência no frontend:** `perfil-artista.html` → badges nos cards de evento

---

## ✅ `doacoes` (Apoio via PIX)

| Campo | Tipo | Origem | Status |
|-------|------|--------|--------|
| `id` | INTEGER PK | Auto incremento | ✅ |
| `artista_id` | INTEGER FK → `perfis_artistas.id` ON DELETE CASCADE | Artista beneficiado | ✅ |
| `visitante_id` | INTEGER FK → `usuarios.id` | NULL se não logado (doação anônima) | ✅ |
| `valor` | REAL NOT NULL | Modal PIX → valor selecionado | ✅ |
| `data_doacao` | DATETIME DEFAULT CURRENT_TIMESTAMP | Auto | ✅ |

**Referência no frontend:** `app.js` → Modal PIX (`inicializarModalPix`)

---

## Resumo das Ações

| Tabela | Status | Ação Necessária |
|--------|--------|-----------------|
| `usuarios` | ✅ Completo | — |
| `perfis_artistas` | ✅ Completo | — |
| `pontos_culturais` | ✅ Completo | — |
| `obras` | ✅ Completo | — |
| `mensagens` | ✅ Completo | — |
| `eventos` | ✅ Completo | — |
| `participacoes_eventos` | ✅ Completo | — |
| `doacoes` | ✅ Completo | — |
