let resultadosCompletos = {};
let abaAtual = 'todos';

function getTermoBusca() {
  return new URLSearchParams(window.location.search).get('q') || '';
}

async function realizarBusca() {
  const termo = getTermoBusca();
  if (!termo) {
    document.getElementById('busca-summary').textContent = 'Digite um termo para buscar.';
    document.getElementById('busca-results').innerHTML = '<p class="busca-empty">Nenhum termo informado.</p>';
    return;
  }

  document.getElementById('breadcrumb-text').textContent = 'Busca: ' + termo;
  document.getElementById('busca-summary').textContent = 'Buscando por "' + termo + '"...';

  let input = document.getElementById('busca-input');
  if (input) input.value = termo;

  try {
    let data = await api('/busca?q=' + encodeURIComponent(termo));
    resultadosCompletos = data;
    renderizarResultados();
  } catch (err) {
    document.getElementById('busca-results').innerHTML = '<p class="busca-empty">Erro ao buscar: ' + err.message + '</p>';
  }
}

function renderizarResultados() {
  const { artistas, eventos, pontos } = resultadosCompletos;
  const total = artistas.length + eventos.length + pontos.length;
  document.getElementById('busca-summary').textContent =
    total + ' resultado' + (total !== 1 ? 's' : '') + ' encontrado' + (total !== 1 ? 's' : '') + ' para "' + getTermoBusca() + '"';

  let html = '';
  if (abaAtual === 'todos' || abaAtual === 'artistas') {
    html += renderizarSecao('Artistas', 'fa-user', artistas, 'artista');
  }
  if (abaAtual === 'todos' || abaAtual === 'eventos') {
    html += renderizarSecao('Eventos', 'fa-calendar-alt', eventos, 'evento');
  }
  if (abaAtual === 'todos' || abaAtual === 'pontos') {
    html += renderizarSecao('Pontos Culturais', 'fa-map-marker-alt', pontos, 'ponto');
  }

  if (!html) {
    html = '<p class="busca-empty">Nenhum resultado encontrado.</p>';
  }

  document.getElementById('busca-results').innerHTML = html;
}

function renderizarSecao(titulo, icone, itens, tipo) {
  if (!itens || itens.length === 0) return '';
  let cards = itens.map(function (item) {
    let link = '';
    if (tipo === 'artista') link = 'perfil-artista.html?id=' + item.id;
    else if (tipo === 'evento') link = 'eventos.html?id=' + item.id;
    else if (tipo === 'ponto') link = 'mapa.html?id=' + item.id;

    let img = item.imagem
      ? '<img src="' + item.imagem + '" alt="' + item.nome + '">'
      : '<div class="busca-card-placeholder">' + (item.nome || '?').charAt(0).toUpperCase() + '</div>';

    let subtitulo = '';
    if (tipo === 'artista') subtitulo = item.categoria || '';
    if (tipo === 'evento') subtitulo = item.data_inicio || '';
    if (tipo === 'ponto') subtitulo = item.endereco || item.categoria || '';

    return '<a href="' + link + '" class="busca-card">' +
      '<div class="busca-card-img">' + img + '</div>' +
      '<div class="busca-card-body">' +
        '<h4>' + item.nome + '</h4>' +
        (subtitulo ? '<p class="busca-card-sub">' + subtitulo + '</p>' : '') +
        (item.descricao ? '<p class="busca-card-desc">' + item.descricao.substring(0, 100) + (item.descricao.length > 100 ? '...' : '') + '</p>' : '') +
      '</div>' +
    '</a>';
  }).join('');

  return '<section class="busca-secao">' +
    '<h3><i class="fas ' + icone + '"></i> ' + titulo + ' <span class="busca-count">' + itens.length + '</span></h3>' +
    '<div class="busca-grid">' + cards + '</div>' +
  '</section>';
}

document.addEventListener('DOMContentLoaded', function () {
  /* Tab switching */
  document.querySelector('.busca-tabs')?.addEventListener('click', function (e) {
    let btn = e.target.closest('.tab-btn');
    if (!btn) return;
    document.querySelectorAll('.busca-tabs .tab-btn').forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');
    abaAtual = btn.dataset.tab;
    renderizarResultados();
  });

  realizarBusca();
});
