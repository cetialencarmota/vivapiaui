let abaDestaqueAtual = 'artistas';

async function carregarStats() {
  try {
    let [pontos, eventos, artistas] = await Promise.all([
      api('/pontos-culturais?status=Publicado'),
      api('/eventos?status=Publicado'),
      api('/artistas')
    ]);
    let raCount = document.querySelectorAll('.ra-card').length;
    let stats = [
      { icon: 'fa-landmark', label: 'Lugares históricos', count: (pontos || []).length },
      { icon: 'fa-music', label: 'Eventos culturais', count: (eventos || []).length },
      { icon: 'fa-paint-brush', label: 'Artistas locais', count: (artistas || []).length },
      { icon: 'fas fa-vr-cardboard', label: 'Experiências em RA', count: raCount }
    ];
    let lista = document.querySelector('.stats-list');
    if (!lista) return;
    lista.innerHTML = '';
    stats.forEach(function (s) {
      let li = document.createElement('li');
      li.innerHTML = '<i class="fas ' + s.icon + '"></i> ' + s.label + ' <span>' + s.count + '</span>';
      lista.appendChild(li);
    });
  } catch (err) {
    console.error('Erro ao carregar stats:', err);
  }
}

function renderizarMiniCardsArtistas(artistas, container) {
  container.innerHTML = '';
  (artistas || []).slice(0, 3).forEach(function (artista) {
    let img = artista.foto_url || artista.avatar_url;
    let letra = (artista.nome_artistico || artista.nome || '?').charAt(0).toUpperCase();
    let imgHtml = img
      ? '<img src="' + img + '" alt="' + (artista.nome_artistico || artista.nome) + '">'
      : '<div class="mini-card-placeholder">' + letra + '</div>';
    let card = document.createElement('div');
    card.className = 'mini-card';
    card.innerHTML =
      imgHtml +
      '<div class="mini-card-info">' +
        '<h4>' + (artista.nome_artistico || artista.nome) + '</h4>' +
        '<p>' + (artista.categoria_artistica || 'Artista Piauiense') + '</p>' +
        '<a href="pages/perfil-artista.html?id=' + artista.id + '">Ver perfil</a>' +
      '</div>';
    container.appendChild(card);
  });
}

function renderizarMiniCardsEventos(eventos, container) {
  container.innerHTML = '';
  (eventos || []).slice(0, 3).forEach(function (ev) {
    let img = ev.imagem_url || ev.capa_url;
    let dataHtml = '';
    if (ev.data_inicio) {
      let d = new Date(ev.data_inicio);
      let dia = String(d.getDate()).padStart(2, '0');
      let meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
      dataHtml = '<span class="day">' + dia + '</span><span class="month">' + meses[d.getMonth()] + '</span>';
    }
    let imgHtml = img
      ? '<img src="' + img + '" alt="' + (ev.titulo || ev.nome) + '" style="border-radius:8px;width:60px;height:60px;object-fit:cover;flex-shrink:0;">'
      : '<div class="mini-card-placeholder">' + (ev.titulo || ev.nome || '?').charAt(0).toUpperCase() + '</div>';
    let card = document.createElement('div');
    card.className = 'mini-card';
    card.innerHTML =
      '<div class="event-date" style="flex-direction:column;align-items:center;min-width:50px;">' + dataHtml + '</div>' +
      '<div class="mini-card-info" style="flex:1;">' +
        '<h4>' + (ev.titulo || ev.nome) + '</h4>' +
        '<p><i class="fas fa-map-marker-alt"></i> ' + (ev.local || ev.localizacao || 'Local não informado') + '</p>' +
        '<a href="pages/eventos.html">Ver evento</a>' +
      '</div>';
    container.appendChild(card);
  });
}

async function carregarDestaques(tipo) {
  tipo = tipo || abaDestaqueAtual;
  abaDestaqueAtual = tipo;
  let container = document.querySelector('.highlight-cards');
  if (!container) return;
  try {
    if (tipo === 'eventos') {
      let eventos = await api('/eventos?status=Publicado');
      renderizarMiniCardsEventos(eventos, container);
    } else {
      let artistas = await api('/artistas');
      renderizarMiniCardsArtistas(artistas, container);
    }
  } catch (err) {
    console.error('Erro ao carregar destaques:', err);
  }
}

async function carregarEventoDestaque() {
  try {
    let eventos = await api('/eventos?status=Publicado');
    let banner = document.querySelector('.event-banner-small');
    if (!banner || !eventos || eventos.length === 0) {
      if (banner) banner.innerHTML = '';
      return;
    }
    let ev = eventos[0];
    let dataHtml = '';
    if (ev.data_inicio) {
      let d = new Date(ev.data_inicio);
      let dia = String(d.getDate()).padStart(2, '0');
      let meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
      dataHtml = '<span class="day">' + dia + '</span><span class="month">' + meses[d.getMonth()] + '</span>';
    }
    let tagsHtml = '';
    if (ev.tags) {
      let tagArr = typeof ev.tags === 'string' ? JSON.parse(ev.tags) : ev.tags;
      if (Array.isArray(tagArr)) {
        tagsHtml = tagArr.slice(0, 2).map(function (t) { return '<span>' + t + '</span>'; }).join('');
      }
    }
    banner.innerHTML =
      '<div class="event-date">' + dataHtml + '</div>' +
      '<div class="event-info">' +
        '<h4>' + (ev.titulo || ev.nome) + '</h4>' +
        '<p><i class="fas fa-map-marker-alt"></i> ' + (ev.local || ev.localizacao || 'Local não informado') + '</p>' +
        '<div class="event-tags">' + tagsHtml + '</div>' +
      '</div>' +
      '<button class="btn-orange-small" onclick="window.location.href=\'pages/eventos.html\'">Ver evento</button>';
  } catch (err) {
    console.error('Erro ao carregar evento em destaque:', err);
  }
}

async function carregarArtistasHome() {
  try {
    let artistas = await api('/artistas');
    let grid = document.querySelector('.artists-cards-grid');
    if (!grid) return;
    grid.innerHTML = '';
    (artistas || []).slice(0, 4).forEach(function (artista) {
      let img = artista.foto_url || artista.avatar_url;
      let letra = (artista.nome_artistico || artista.nome || '?').charAt(0).toUpperCase();
      let card = document.createElement('div');
      card.className = 'artist-card';
      let imgHtml = img
        ? '<div class="card-img" style="background-image: url(\'' + img + '\')"></div>'
        : '<div class="card-img card-img-placeholder-home">' + letra + '</div>';
      card.innerHTML =
        imgHtml +
        '<div class="card-content">' +
          '<h4>' + (artista.nome_artistico || artista.nome) + '</h4>' +
          '<p class="loc">' + (artista.localizacao || 'Piauí') + '</p>' +
          '<button class="support-btn" onclick="window.location.href=\'pages/perfil-artista.html?id=' + artista.id + '\'"><i class="fas fa-heart"></i> Apoiar</button>' +
        '</div>';
      grid.appendChild(card);
    });
  } catch (err) {
    console.error('Erro ao carregar artistas home:', err);
  }
}

function configurarAbasDestaques() {
  let tabs = document.querySelectorAll('.highlight-tabs .tab-btn');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { return t.classList.remove('active'); });
      tab.classList.add('active');
      let tipo = tab.textContent.trim().toLowerCase();
      carregarDestaques(tipo);
    });
  });
}

document.addEventListener('DOMContentLoaded', function () {
  carregarStats();
  carregarDestaques('artistas');
  carregarEventoDestaque();
  carregarArtistasHome();
  configurarAbasDestaques();
});
