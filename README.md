# Viva Piauí

Plataforma web para divulgação da cultura piauiense. Conecta artistas, pontos culturais e eventos do Piauí, permitindo que visitantes explorem, artistas divulguem seu trabalho e administradores gerenciem o conteúdo.

## Funcionalidades

- Catálogo de pontos culturais com geolocalização
- Agenda de eventos culturais
- Perfis de artistas com portfólio
- Sistema de doações para artistas
- Mensagens entre visitantes e artistas
- Painel administrativo para gestão de conteúdo
- Upload de imagens e avatares
- Autenticação com perfis (visitante, artista, admin)

## Tecnologias

### Backend
- **Node.js** — runtime
- **Express** — framework HTTP
- **SQLite (better-sqlite3)** — banco de dados
- **JWT (jsonwebtoken)** — autenticação
- **bcryptjs** — hash de senhas
- **Multer** — upload de arquivos

### Frontend
- HTML, CSS, JavaScript puro
- Font Awesome — ícones
- Google Fonts (Inter) — tipografia
- Leaflet + OpenStreetMap — mapas
- ViaCEP — busca de endereço

## Pré-requisitos

- Node.js 18+
- npm

## Instalação

```bash
# Instalar dependências
npm install
```

## Execução

```bash
# Modo produção
npm start

# Modo desenvolvimento (com nodemon)
npm run dev
```

O servidor inicia em `http://localhost:3000`.

## Estrutura

```
public/         — Arquivos estáticos (HTML, CSS, JS, imagens)
src/
  controllers/  — Lógica das rotas
  models/       — Operações no banco
  routes/       — Definição das rotas
  middlewares/   — Autenticação e tratamento de erros
  config/       — Configuração do banco de dados
data/           — Banco SQLite
```
