const CATEGORIAS_CONHECIDAS = [
  'Artesanato', 'Música', 'Artes Visuais', 'Literatura', 'Gastronomia',
  'Dança', 'Teatro', 'Fotografia'
];

const ICONES_CATEGORIA = {
  'Artesanato': 'fa-hands',
  'Música': 'fa-music',
  'Artes Visuais': 'fa-paint-brush',
  'Literatura': 'fa-book',
  'Gastronomia': 'fa-utensils',
  'Dança': 'fa-shoe-prints',
  'Teatro': 'fa-masks-theater',
  'Fotografia': 'fa-camera',
  'Outros': 'fa-th-large'
};

let todosArtistas = [];
let filtroCategoria = null;
let termoBusca = '';
let ordenacaoAtual = 'recentes';

function categoriaParaGrupo(cat) {
  if (!cat) return 'Outros';
  if (CATEGORIAS_CONHECIDAS.includes(cat)) return cat;
  return 'Outros';
}

async function inicializarPaginaArtistas() {
  let grid = document.querySelector('.artists-grid-main');
  let contador = document.querySelector('.results-header span');
  if (!grid) return;

  let params = new URLSearchParams(window.location.search);
  let buscaParam = params.get('busca');
  if (buscaParam) {
    termoBusca = buscaParam.toLowerCase();
    let searchInput = document.querySelector('.search-bar input');
    if (searchInput) searchInput.value = buscaParam;
  }

  try {
    let artistas = await api('/artistas');
    todosArtistas = artistas || [];
    if (isAuthenticated()) await carregarIdsFavoritos();
    renderizarCategorias(todosArtistas);
    aplicarFiltros();
  } catch (err) {
    console.error('Erro ao carregar artistas:', err);
  }

  let searchInput = document.querySelector('.search-bar input');
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      termoBusca = this.value.toLowerCase();
      aplicarFiltros();
    });
  }

  let filterList = document.querySelector('.filter-list');
  if (filterList) {
    filterList.addEventListener('click', function (e) {
      let li = e.target.closest('li');
      if (!li) return;
      let cat = li.dataset.categoria || '';
      filterList.querySelectorAll('li').forEach(function (el) { el.classList.remove('active'); });
      li.classList.add('active');
      filtroCategoria = cat || null;
      aplicarFiltros();
    });
  }

  let sortSelect = document.getElementById('ordenar-artistas');
  if (sortSelect) {
    sortSelect.addEventListener('change', function () {
      ordenacaoAtual = this.value;
      aplicarFiltros();
    });
  }
}

function renderizarCategorias(artistas) {
  let map = {};
  artistas.forEach(function (a) {
    let grupo = categoriaParaGrupo(a.categoria_artistica);
    if (!map[grupo]) map[grupo] = 0;
    map[grupo]++;
  });

  let html = '<li class="active" data-categoria=""><i class="fas fa-th-large"></i> Todos <span>' + artistas.length + '</span></li>';

  CATEGORIAS_CONHECIDAS.forEach(function (cat) {
    let qtd = map[cat] || 0;
    if (qtd === 0) return;
    let icon = ICONES_CATEGORIA[cat] || 'fa-star';
    html += '<li data-categoria="' + cat.replace(/"/g, '&quot;') + '"><i class="fas ' + icon + '"></i> ' + cat + ' <span>' + qtd + '</span></li>';
  });

  let qtdOutros = map['Outros'] || 0;
  if (qtdOutros > 0) {
    html += '<li data-categoria="Outros"><i class="fas ' + ICONES_CATEGORIA['Outros'] + '"></i> Outros <span>' + qtdOutros + '</span></li>';
  }

  let filterList = document.querySelector('.filter-list');
  if (filterList) filterList.innerHTML = html;
}

function aplicarFiltros() {
  let filtrados = todosArtistas.filter(function (a) {
    if (filtroCategoria) {
      let grupo = categoriaParaGrupo(a.categoria_artistica);
      if (grupo !== filtroCategoria) return false;
    }
    if (termoBusca) {
      let nome = (a.nome_artistico || a.nome || '').toLowerCase();
      let cat = (a.categoria_artistica || '').toLowerCase();
      if (nome.indexOf(termoBusca) === -1 && cat.indexOf(termoBusca) === -1) return false;
    }
    return true;
  });

  if (ordenacaoAtual === 'nome') {
    filtrados.sort(function (a, b) {
      return (a.nome_artistico || a.nome || '').localeCompare(b.nome_artistico || b.nome || '');
    });
  } else if (ordenacaoAtual === 'apoiados') {
    filtrados.sort(function (a, b) {
      return (b.total_doacoes || 0) - (a.total_doacoes || 0);
    });
  } else {
    filtrados.sort(function (a, b) { return (b.id || 0) - (a.id || 0); });
  }

  let contador = document.querySelector('.results-header span');
  if (contador) contador.textContent = filtrados.length + ' artistas encontrados';

  renderizarArtistas(filtrados);
}

/* Override the "Apoiar" button behavior from favoritos.js */
function apoiarArtista(artistaId) {
  window.location.href = 'perfil-artista.html?id=' + artistaId;
}

document.addEventListener('DOMContentLoaded', inicializarPaginaArtistas);
