/**
 * Gerenciamento de favoritos do visitante.
 * 
 * favoritosCache (global compartilhado): IDs dos artistas favoritados.
 * Persistido entre páginas via carregarIdsFavoritos().
 * 
 * Fluxo: carregarIdsFavoritos() -> toggleFavoritar(id, btn)
 * 
 * Dependências: api.js (isAuthenticated, api), toast.js (mostrarToast)
 */
let favoritosCache = [];
let artistasCache = [];
var _meuArtistaId = undefined; // undefined = not checked, null = not artist, number = artist ID

function getMeuArtistaId() {
  if (_meuArtistaId !== undefined) return _meuArtistaId;
  _meuArtistaId = null;
  try {
    var usuario = JSON.parse(localStorage.getItem('usuario'));
    if (usuario && usuario.tipo_perfil === 'artista') {
      var cached = JSON.parse(localStorage.getItem('artista_perfil'));
      if (cached && cached.id) _meuArtistaId = cached.id;
    }
  } catch (e) {}
  return _meuArtistaId;
}

async function carregarIdsFavoritos() {
  if (!isAuthenticated()) { favoritosCache = []; return; }
  try {
    let favs = await api('/favoritos');
    favoritosCache = (favs || []).map(function (f) { return f.artista_id; });
  } catch (err) {
    if (err.message.includes('401') || err.message.includes('403')) favoritosCache = [];
    else console.error('Erro ao carregar favoritos:', err);
  }
}

function isFavoritado(artistaId) {
  return favoritosCache.indexOf(artistaId) !== -1;
}

function alternarIconeHeart(btn, favoritado) {
  let icon = btn.querySelector('i');
  if (icon) {
    icon.className = favoritado ? 'fas fa-heart' : 'far fa-heart';
  }
  btn.classList.toggle('ativo', favoritado);
}

async function toggleFavoritar(artistaId, btn) {
  if (!isAuthenticated()) {
    let loginHref = window.location.pathname.includes('/pages/') ? 'login.html' : 'pages/login.html';
    mostrarToast('Faça login para favoritar artistas.', 'erro');
    window.location.href = loginHref;
    return;
  }
  if (getMeuArtistaId() === artistaId) {
    mostrarToast('Você não pode favoritar seu próprio perfil.', 'erro');
    return;
  }
  let favoritado = isFavoritado(artistaId);
  try {
    if (favoritado) {
      await api('/favoritos/' + artistaId, { method: 'DELETE' });
      favoritosCache = favoritosCache.filter(function (id) { return id !== artistaId; });
    } else {
      await api('/favoritos', {
        method: 'POST',
        body: JSON.stringify({ artista_id: artistaId })
      });
      favoritosCache.push(artistaId);
    }
    if (btn) alternarIconeHeart(btn, !favoritado);
    return !favoritado;
  } catch (err) {
    mostrarToast('Erro ao ' + (favoritado ? 'remover' : 'adicionar') + ' favorito: ' + err.message, 'erro');
  }
}

async function carregarArtistas() {
  let grid = document.querySelector('.artists-grid-main');
  let contador = document.querySelector('.results-header span');
  if (!grid) return;

  try {
    let artistas = await api('/artistas');
    artistasCache = artistas || [];
    if (isAuthenticated()) await carregarIdsFavoritos();
    if (contador) contador.textContent = artistasCache.length + ' artistas encontrados';
    renderizarArtistas(artistasCache);
  } catch (err) {
    console.error('Erro ao carregar artistas:', err);
  }
}

function renderizarArtistas(artistas) {
  let grid = document.querySelector('.artists-grid-main');
  if (!grid) return;
  grid.innerHTML = '';

  artistas.forEach(function (artista) {
    let artistaId = artista.id;
    let favoritado = isFavoritado(artistaId);
      let ehMeuPerfil = getMeuArtistaId() === artistaId;
      let artistaImg = artista.foto_url || artista.avatar_url;
      let artistaLetra = (artista.nome_artistico || artista.nome || '?').charAt(0).toUpperCase();
      let artistaImgHtml = artistaImg
        ? '<img src="' + artistaImg + '" alt="' + (artista.nome_artistico || artista.nome) + '">'
        : '<div class="card-img-placeholder">' + artistaLetra + '</div>';
      let card = document.createElement('div');
      card.className = 'artist-card-full';
      card.innerHTML =
        '<div class="card-img-wrapper">' +
          artistaImgHtml +
        (!ehMeuPerfil ? '<button class="like-btn' + (favoritado ? ' ativo' : '') + '"><i class="' + (favoritado ? 'fas' : 'far') + ' fa-heart"></i></button>' : '') +
      '</div>' +
      '<div class="card-body">' +
        '<h4>' + (artista.nome_artistico || artista.nome) + '</h4>' +
        '<p class="tagline">' + (artista.categoria_artistica || 'Artista Piauiense') + '</p>' +
        '<p class="desc">' + (artista.biografia ? artista.biografia.substring(0, 60) + '...' : '') + '</p>' +
        '<div class="card-actions">' +
          '<button class="btn-support-small" onclick="(window.apoiarArtista || function(id){mostrarToast(\'Funcionalidade em breve!\', \'info\')})(' + artistaId + ')"><i class="fas fa-heart"></i> Apoiar</button>' +
          '<a href="perfil-artista.html?id=' + artistaId + '" class="btn-outline-small">Ver perfil</a>' +
        '</div>' +
      '</div>';
    let likeBtn = card.querySelector('.like-btn');
    if (likeBtn) {
      likeBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleFavoritar(artistaId, likeBtn);
      });
    }
    grid.appendChild(card);
  });
}
