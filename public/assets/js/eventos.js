let todosEventos = [];
let filtroAtivo = 'proximos';
let termoBuscaEvento = '';
let ordenacaoEvento = 'proximos';
let mesCalendario = new Date().getMonth();
let anoCalendario = new Date().getFullYear();

function formatarDataEvento(dataISO) {
  if (!dataISO) return '';
  let d = new Date(dataISO);
  let dia = String(d.getDate()).padStart(2, '0');
  let meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
  return '<span class="day">' + dia + '</span><span class="month">' + meses[d.getMonth()] + '</span>';
}

function formatarPeriodo(dataInicio, dataFim) {
  if (!dataInicio) return '';
  let di = parseDataLocal(dataInicio);
  let df = dataFim ? parseDataLocal(dataFim) : null;
  if (!di) return '';
  let meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
  let diaI = String(di.getDate()).padStart(2, '0');
  let mesI = meses[di.getMonth()];
  if (df && di.getMonth() === df.getMonth() && di.getFullYear() === df.getFullYear()) {
    let diaF = String(df.getDate()).padStart(2, '0');
    return '<span class="day">' + diaI + ' a ' + diaF + '</span><span class="month">' + mesI + '</span>';
  }
  return '<span class="day">' + diaI + '</span><span class="month">' + mesI + '</span>';
}

function extrairTags(eventos) {
  let mapa = {};
  eventos.forEach(function (ev) {
    if (!ev.tags) return;
    try {
      let arr = typeof ev.tags === 'string' ? JSON.parse(ev.tags) : ev.tags;
      if (Array.isArray(arr)) {
        arr.forEach(function (t) {
          if (!mapa[t]) mapa[t] = 0;
          mapa[t]++;
        });
      }
    } catch (e) {}
  });
  return mapa;
}

function renderizarEventoDestaque(eventos) {
  let banner = document.querySelector('.featured-event-banner');
  if (!banner) return;

  let proximos = eventos.filter(function (ev) {
    return ev.data_inicio && new Date(ev.data_inicio) >= new Date();
  });
  proximos.sort(function (a, b) {
    return new Date(a.data_inicio) - new Date(b.data_inicio);
  });
  let destaque = proximos[0] || eventos[0];
  if (!destaque) {
    banner.style.display = 'none';
    return;
  }
  banner.style.display = '';

  let dayEl = banner.querySelector('.event-date-large .day');
  let monthEl = banner.querySelector('.event-date-large .month');
  let titleEl = banner.querySelector('.featured-text h2');
  let locationEl = banner.querySelector('.featured-text .location');
  let descEl = banner.querySelector('.featured-text .description');
  let tagsEl = banner.querySelector('.event-tags');
  let imgEl = banner.querySelector('.featured-image img');

  if (destaque.data_inicio && destaque.data_fim) {
    let di = parseDataLocal(destaque.data_inicio);
    let df = parseDataLocal(destaque.data_fim);
    if (di && df) {
      let meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
      if (di.getMonth() === df.getMonth() && di.getFullYear() === df.getFullYear()) {
        if (dayEl) dayEl.textContent = String(di.getDate()) + ' a ' + String(df.getDate());
        if (monthEl) monthEl.textContent = meses[di.getMonth()];
      } else {
        if (dayEl) dayEl.textContent = String(di.getDate());
        if (monthEl) monthEl.textContent = meses[di.getMonth()];
      }
    }
  } else if (destaque.data_inicio) {
    let d = parseDataLocal(destaque.data_inicio);
    if (d) {
      let meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
      if (dayEl) dayEl.textContent = String(d.getDate());
      if (monthEl) monthEl.textContent = meses[d.getMonth()];
    }
  }

  if (titleEl) titleEl.textContent = destaque.titulo || destaque.nome || 'Evento';
  if (locationEl) locationEl.innerHTML = '<i class="fas fa-map-marker-alt"></i> ' + (destaque.local || destaque.endereco || 'Local não informado');
  if (descEl) descEl.textContent = destaque.descricao || '';

  if (tagsEl) {
    try {
      let tagArr = typeof destaque.tags === 'string' ? JSON.parse(destaque.tags) : (destaque.tags || []);
      if (Array.isArray(tagArr) && tagArr.length) {
        tagsEl.innerHTML = tagArr.map(function (t) { return '<span class="tag">' + t + '</span>'; }).join('');
      }
    } catch (e) {}
  }

  if (imgEl) {
    imgEl.src = destaque.imagem_url || destaque.capa_url || 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&w=800&q=80';
    imgEl.alt = destaque.titulo || destaque.nome || 'Evento em destaque';
  }
}

async function carregarEventos() {
  try {
    let eventos = await api('/eventos?status=Publicado');
    todosEventos = eventos || [];
    renderizarEventoDestaque(todosEventos);
    renderizarFiltros(todosEventos);
    renderizarCalendario();
    aplicarFiltros();
  } catch (err) {
    console.error('Erro ao carregar eventos:', err);
  }
}

function renderizarFiltros(eventos) {
  let container = document.getElementById('filterOptions');
  if (!container) return;

  let tags = extrairTags(eventos);
  let html = '';
  html += '<li class="' + (filtroAtivo === 'proximos' ? 'active' : '') + '" data-filtro="proximos"><i class="far fa-clock"></i> Próximos</li>';
  html += '<li class="' + (filtroAtivo === 'todos' ? 'active' : '') + '" data-filtro="todos"><i class="fa fa-list"></i> Todos</li>';

  let icones = {
    'Religioso': 'fa-pray',
    'Festival': 'fa-mask',
    'Feira': 'fa-store',
    'Tradição Cultural': 'fa-landmark',
    'Música': 'fa-music',
    'Gastronomia': 'fa-utensils',
    'Artesanato': 'fa-hands'
  };

  Object.keys(tags).sort().forEach(function (tag) {
    let icon = icones[tag] || 'fa-tag';
    let ativo = filtroAtivo === tag ? 'active' : '';
    html += '<li class="' + ativo + '" data-filtro="' + tag.replace(/"/g, '&quot;') + '"><i class="fas ' + icon + '"></i> ' + tag + ' <span>' + tags[tag] + '</span></li>';
  });

  container.innerHTML = html;

  container.querySelectorAll('[data-filtro]').forEach(function (li) {
    li.addEventListener('click', function () {
      container.querySelectorAll('[data-filtro]').forEach(function (el) { el.classList.remove('active'); });
      this.classList.add('active');
      filtroAtivo = this.dataset.filtro;
      aplicarFiltros();
    });
  });
}

function aplicarFiltros() {
  let filtradas = todosEventos.filter(function (ev) {
    if (filtroAtivo === 'proximos') {
      if (ev.data_inicio) {
        let agora = new Date();
        let dataEvento = new Date(ev.data_inicio);
        if (dataEvento < agora) return false;
      }
    } else if (filtroAtivo !== 'todos') {
      try {
        let arr = typeof ev.tags === 'string' ? JSON.parse(ev.tags) : (ev.tags || []);
        if (!Array.isArray(arr) || arr.indexOf(filtroAtivo) === -1) return false;
      } catch (e) { return false; }
    }

    if (termoBuscaEvento) {
      let titulo = (ev.titulo || ev.nome || '').toLowerCase();
      let desc = (ev.descricao || '').toLowerCase();
      if (titulo.indexOf(termoBuscaEvento) === -1 && desc.indexOf(termoBuscaEvento) === -1) return false;
    }
    return true;
  });

  if (ordenacaoEvento === 'nome') {
    filtradas.sort(function (a, b) {
      let nomeA = a.titulo || a.nome || '';
      let nomeB = b.titulo || b.nome || '';
      let cmp = nomeA.localeCompare(nomeB);
      if (cmp !== 0) return cmp;
      let da = a.data_inicio ? new Date(a.data_inicio) : new Date('2099-12-31');
      let db = b.data_inicio ? new Date(b.data_inicio) : new Date('2099-12-31');
      return da - db;
    });
  } else {
    filtradas.sort(function (a, b) {
      let da = a.data_inicio ? new Date(a.data_inicio) : new Date('2099-12-31');
      let db = b.data_inicio ? new Date(b.data_inicio) : new Date('2099-12-31');
      if (da - db !== 0) return da - db;
      let nomeA = a.titulo || a.nome || '';
      let nomeB = b.titulo || b.nome || '';
      return nomeA.localeCompare(nomeB);
    });
  }

  renderizarEventos(filtradas);
  let contador = document.querySelector('.header-title p');
  if (contador) {
    contador.textContent = filtradas.length + ' evento' + (filtradas.length !== 1 ? 's' : '') + ' encontrado' + (filtradas.length !== 1 ? 's' : '');
  }
}

function renderizarEventos(eventos) {
  let lista = document.querySelector('.events-list');
  if (!lista) return;

  if (!eventos || eventos.length === 0) {
    lista.innerHTML = '<p style="text-align:center;padding:3rem;color:#888;">Nenhum evento encontrado.</p>';
    return;
  }

  lista.innerHTML = '';
  eventos.forEach(function (ev) {
    let item = document.createElement('div');
    item.className = 'event-list-item';
    let dataHtml = formatarPeriodo(ev.data_inicio, ev.data_fim) || formatarDataEvento(ev.data_evento);
    let tagsHtml = '';
    if (ev.tags) {
      try {
        let tagArr = typeof ev.tags === 'string' ? JSON.parse(ev.tags) : ev.tags;
        if (Array.isArray(tagArr)) {
          tagsHtml = tagArr.map(function (t) { return '<span class="tag">' + t + '</span>'; }).join('');
        }
      } catch (e) {}
    }
    item.innerHTML =
      '<div class="item-image">' +
        '<img src="' + (ev.imagem_url || ev.capa_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400') + '" alt="' + (ev.titulo || ev.nome) + '">' +
      '</div>' +
      '<div class="item-date">' + dataHtml + '</div>' +
      '<div class="item-info">' +
        '<h4>' + (ev.titulo || ev.nome) + '</h4>' +
        '<p class="location"><i class="fas fa-map-marker-alt"></i> ' + (ev.local || ev.endereco || 'Local não informado') + '</p>' +
        '<p class="desc">' + (ev.descricao || '') + '</p>' +
        '<div class="item-tags">' + tagsHtml + '</div>' +
      '</div>' +
      '<button class="btn-map-link" onclick="verNoMapa(\'' + (ev.latitude || '') + '\',\'' + (ev.longitude || '') + '\')"><i class="fas fa-map-marked-alt"></i> Ver no Mapa</button>';
    lista.appendChild(item);
  });
}

function verNoMapa(lat, lng) {
  if (lat && lng) {
    window.location.href = '../index.html?lat=' + lat + '&lng=' + lng;
  } else {
    window.location.href = '../index.html';
  }
}

function parseDataLocal(str) {
  if (!str) return null;
  let partes = str.split('-');
  if (partes.length === 3) return new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));
  return new Date(str);
}

function obterDiasComEvento(eventos) {
  let dias = {};
  eventos.forEach(function (ev) {
    if (ev.data_inicio) {
      let d = parseDataLocal(ev.data_inicio);
      if (d) {
        let chave = d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate();
        dias[chave] = true;
      }
    }
    if (ev.data_fim) {
      let d = parseDataLocal(ev.data_fim);
      if (d) {
        let chave = d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate();
        dias[chave] = true;
      }
    }
  });
  return dias;
}

function renderizarCalendario() {
  let grid = document.getElementById('calendarGrid');
  let titulo = document.getElementById('currentMonth');
  if (!grid || !titulo) return;

  let meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  titulo.textContent = meses[mesCalendario] + ' ' + anoCalendario;

  let diasComEvento = obterDiasComEvento(todosEventos);
  let hoje = new Date();
  let hojeChave = hoje.getFullYear() + '-' + hoje.getMonth() + '-' + hoje.getDate();

  let primeiroDia = new Date(anoCalendario, mesCalendario, 1);
  let ultimoDia = new Date(anoCalendario, mesCalendario + 1, 0);
  let inicioSemana = primeiroDia.getDay();
  let totalDias = ultimoDia.getDate();

  let diasMesAnterior = new Date(anoCalendario, mesCalendario, 0).getDate();

  let html = '';
  let diasNome = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  diasNome.forEach(function (nome) {
    html += '<div class="cal-day-name">' + nome + '</div>';
  });

  for (var i = inicioSemana - 1; i >= 0; i--) {
    html += '<div class="cal-day muted">' + (diasMesAnterior - i) + '</div>';
  }

  for (var d = 1; d <= totalDias; d++) {
    let chave = anoCalendario + '-' + mesCalendario + '-' + d;
    let classes = 'cal-day';
    if (chave === hojeChave) classes += ' active';
    if (diasComEvento[chave]) classes += ' active-event';
    html += '<div class="' + classes + '" data-dia="' + d + '">' + d + '</div>';
  }

  let totalCelulas = inicioSemana + totalDias;
  let resto = totalCelulas % 7;
  if (resto > 0) {
    for (var p = 1; p <= 7 - resto; p++) {
      html += '<div class="cal-day muted">' + p + '</div>';
    }
  }

  grid.innerHTML = html;

  grid.querySelectorAll('.cal-day:not(.muted)').forEach(function (el) {
    el.addEventListener('click', function () {
      let dia = this.dataset.dia;
      if (!dia) return;
      grid.querySelectorAll('.cal-day').forEach(function (c) { c.classList.remove('active'); });
      this.classList.add('active');
      filtrarPorDia(parseInt(dia));
    });
  });
}

function filtrarPorDia(dia) {
  filtroAtivo = 'todos';
  let filterOptions = document.getElementById('filterOptions');
  if (filterOptions) {
    filterOptions.querySelectorAll('[data-filtro]').forEach(function (el) { el.classList.remove('active'); });
    let todosEl = filterOptions.querySelector('[data-filtro="todos"]');
    if (todosEl) todosEl.classList.add('active');
  }

  let filtradas = todosEventos.filter(function (ev) {
    if (!ev.data_inicio) return false;
    let d = parseDataLocal(ev.data_inicio);
    return d && d.getFullYear() === anoCalendario && d.getMonth() === mesCalendario && d.getDate() === dia;
  });

  renderizarEventos(filtradas);
  let contador = document.querySelector('.header-title p');
  if (contador) contador.textContent = filtradas.length + ' evento' + (filtradas.length !== 1 ? 's' : '') + ' encontrado' + (filtradas.length !== 1 ? 's' : '');
}

document.addEventListener('DOMContentLoaded', function () {
  if (typeof atualizarHeaderLogado === 'function') atualizarHeaderLogado();
  if (typeof configurarLogout === 'function') configurarLogout();
  carregarEventos();

  let searchInput = document.querySelector('.search-bar input');
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      termoBuscaEvento = this.value.toLowerCase().trim();
      aplicarFiltros();
    });
  }

  let sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', function () {
      ordenacaoEvento = this.value;
      aplicarFiltros();
    });
  }

  let clearBtn = document.querySelector('.clear-filters');
  if (clearBtn) {
    clearBtn.addEventListener('click', function (e) {
      e.preventDefault();
      filtroAtivo = 'proximos';
      termoBuscaEvento = '';
      ordenacaoEvento = 'proximos';
      if (searchInput) searchInput.value = '';
      if (sortSelect) sortSelect.value = 'proximos';
      carregarEventos();
    });
  }

  let btnPrev = document.getElementById('calPrev');
  let btnNext = document.getElementById('calNext');
  if (btnPrev) btnPrev.addEventListener('click', function () { mesCalendario--; if (mesCalendario < 0) { mesCalendario = 11; anoCalendario--; } renderizarCalendario(); });
  if (btnNext) btnNext.addEventListener('click', function () { mesCalendario++; if (mesCalendario > 11) { mesCalendario = 0; anoCalendario++; } renderizarCalendario(); });
});
