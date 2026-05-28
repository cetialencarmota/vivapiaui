let itensCache = [];
let itensFiltrados = [];
let paginaAtual = 1;
let itensPorPagina = 8;
let tipoFormulario = 'Lugar';
let imagemUploadadaUrl = null;

function atualizarSidebarAdmin() {
  let usuario = getUsuarioLogado();
  if (!usuario) return;

  let sidebarAvatar = document.getElementById('sidebar-avatar');
  let sidebarName = document.getElementById('sidebar-user-name');
  let avatarSrc = usuario.avatar_url || gerarAvatarFallback(usuario.nome, 50);
  if (sidebarAvatar) sidebarAvatar.src = avatarSrc;
  if (sidebarName) sidebarName.textContent = usuario.nome;
}

function renderizarTabela(itens) {
  let tabelaCorpo = document.getElementById('items-table-body');
  if (!tabelaCorpo) return;
  tabelaCorpo.innerHTML = '';

  let inicio = (paginaAtual - 1) * itensPorPagina;
  let fim = inicio + itensPorPagina;
  let paginaItens = itens.slice(inicio, fim);

  paginaItens.forEach(function (item) {
    let tr = document.createElement('tr');
    let statusClass = item.status === 'Publicado' ? 'status-published' : 'status-draft';
    let tipoLabel = item._tipo === 'evento' ? 'Evento' : (item.tipo || item.categoria || '—');
    tr.innerHTML =
      '<td>' + item.nome + '</td>' +
      '<td>' + tipoLabel + '</td>' +
      '<td><span class="status-badge ' + statusClass + '">' + item.status + '</span></td>' +
      '<td>' +
        '<button class="action-btn" onclick="excluirItem(' + item.id + ',\'' + item._tipo + '\')" title="Excluir"><i class="fas fa-trash"></i></button>' +
        '<button class="action-btn" onclick="toggleStatus(' + item.id + ',\'' + item._tipo + '\')" title="Alternar status"><i class="fas fa-sync-alt"></i></button>' +
      '</td>';
    tabelaCorpo.appendChild(tr);
  });

  let total = itens.length;
  let pagInfo = document.getElementById('pagination-info');
  if (pagInfo) {
    if (total === 0) {
      pagInfo.textContent = 'Nenhum item encontrado.';
    } else {
      pagInfo.textContent = 'Mostrando ' + (inicio + 1) + ' a ' + Math.min(fim, total) + ' de ' + total + ' itens';
    }
  }

  let pagNums = document.getElementById('pagination-nums');
  if (pagNums) {
    let totalPaginas = Math.ceil(total / itensPorPagina) || 1;
    pagNums.textContent = paginaAtual + ' / ' + totalPaginas;
  }

}

function filtrarPorBusca() {
  let termo = (document.getElementById('search-input').value || '').toLowerCase();
  itensFiltrados = termo
    ? itensCache.filter(function (item) { return item.nome.toLowerCase().includes(termo); })
    : itensCache.slice();
  paginaAtual = 1;
  renderizarTabela(itensFiltrados);
}

function paginaAnterior() {
  if (paginaAtual > 1) { paginaAtual--; renderizarTabela(itensFiltrados); }
}

function proximaPagina() {
  let totalPaginas = Math.ceil(itensFiltrados.length / itensPorPagina) || 1;
  if (paginaAtual < totalPaginas) { paginaAtual++; renderizarTabela(itensFiltrados); }
}

async function carregarItens() {
  try {
    let [pontos, eventos] = await Promise.all([
      api('/pontos-culturais'),
      api('/eventos')
    ]);
    let pontosComTipo = (pontos || []).map(function (p) { p._tipo = 'ponto'; return p; });
    let eventosComTipo = (eventos || []).map(function (e) { e._tipo = 'evento'; return e; });
    itensCache = pontosComTipo.concat(eventosComTipo);
    itensCache.sort(function (a, b) { return (b.id || 0) - (a.id || 0); });
    itensFiltrados = itensCache.slice();
    paginaAtual = 1;
    renderizarTabela(itensFiltrados);
  } catch (err) {
    console.error('Erro ao carregar itens:', err);
  }
}

async function excluirItem(id, tipo) {
  if (!confirm('Tem certeza que deseja excluir este item?')) return;
  try {
    let endpoint = tipo === 'evento' ? '/eventos/' : '/pontos-culturais/';
      await api(endpoint + id, { method: 'DELETE' });
    carregarItens();
    mostrarToast('Item excluído com sucesso!', 'sucesso');
  } catch (err) {
    mostrarToast('Erro ao excluir: ' + err.message, 'erro');
  }
}

async function toggleStatus(id, tipo) {
  try {
    let item = itensCache.find(function (i) { return i.id === id && i._tipo === tipo; });
    if (!item) return;
    let novoStatus = item.status === 'Publicado' ? 'Rascunho' : 'Publicado';
    let endpoint = tipo === 'evento' ? '/eventos/' : '/pontos-culturais/';
      await api(endpoint + id, {
      method: 'PUT',
      body: JSON.stringify({ status: novoStatus })
    });
    carregarItens();
    mostrarToast('Status alterado para "' + novoStatus + '"!', 'sucesso');
  } catch (err) {
    mostrarToast('Erro ao alterar status: ' + err.message, 'erro');
  }
}

function alternarAba(tipo) {
  tipoFormulario = tipo;
  let tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(function (t) { return t.classList.remove('active'); });
  tabs.forEach(function (t) {
    if ((tipo === 'Lugar' && t.textContent.trim().includes('Lugar')) ||
        (tipo === 'Evento' && t.textContent.trim().includes('Evento'))) {
      t.classList.add('active');
    }
  });

  let lugarFields = document.querySelectorAll('.lugar-field');
  let eventoFields = document.getElementById('evento-fields');
  let geocodeBtn = document.querySelector('.btn-geocode');

  if (tipo === 'Evento') {
    lugarFields.forEach(function (el) { el.style.display = 'none'; });
    if (eventoFields) eventoFields.style.display = 'block';
    if (geocodeBtn) geocodeBtn.style.display = 'none';
  } else {
    lugarFields.forEach(function (el) { el.style.display = ''; });
    if (eventoFields) eventoFields.style.display = 'none';
    if (geocodeBtn) geocodeBtn.style.display = '';
  }
}

function configurarUploadImagem() {
  let input = document.getElementById('imagem-input');
  let dropArea = document.getElementById('drop-area');
  if (!input || !dropArea) return;

  input.addEventListener('change', async function () {
    let file = input.files[0];
    if (!file) return;
    if (!isAuthenticated()) {
      mostrarToast('Faça login para enviar imagens.', 'erro');
      return;
    }
    let formData = new FormData();
    formData.append('imagem', file);
    dropArea.style.opacity = '0.5';
    try {
      let result = await api('/upload/imagem', { method: 'POST', body: formData, raw: true });
      imagemUploadadaUrl = result.imagem_url;
      let preview = document.getElementById('imagem-preview');
      let previewImg = document.getElementById('imagem-preview-img');
      if (preview && previewImg) {
        previewImg.src = imagemUploadadaUrl;
        preview.style.display = 'block';
      }
      document.getElementById('drop-text').textContent = 'Imagem selecionada';
    } catch (err) {
      mostrarToast('Erro ao enviar imagem: ' + err.message, 'erro');
    }
    dropArea.style.opacity = '1';
  });
}

function removerImagem() {
  imagemUploadadaUrl = null;
  let preview = document.getElementById('imagem-preview');
  let input = document.getElementById('imagem-input');
  if (preview) preview.style.display = 'none';
  if (input) input.value = '';
  document.getElementById('drop-text').textContent = 'Arraste e solte uma imagem aqui ou clique para selecionar';
}

function configurarUploadAvatar() {
  let input = document.getElementById('avatar-input');
  if (!input) return;
  input.addEventListener('change', async function () {
    let file = input.files[0];
    if (!file) return;
    let formData = new FormData();
    formData.append('avatar', file);
    try {
      let result = await api('/upload/avatar', {
        method: 'POST',
        body: formData,
        raw: true
      });
      setUsuarioLogado(result.usuario);
      atualizarSidebarAdmin();
      mostrarToast('Foto atualizada com sucesso!', 'sucesso');
    } catch (err) {
      mostrarToast('Erro ao enviar foto: ' + err.message, 'erro');
    }
    input.value = '';
  });
}

function configurarFormulario() {
  let form = document.getElementById('add-item-form');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (!isAuthenticated()) {
      mostrarToast('Faça login como administrador para cadastrar itens.', 'erro');
      return;
    }

    let nome = document.getElementById('nome').value;
    let categoria = document.getElementById('categoria').value;
    let descricao = document.getElementById('descricao').value;
    let endereco = document.getElementById('localizacao').value;

    if (tipoFormulario === 'Lugar') {
      let latitude = parseFloat(document.getElementById('latitude').value);
      let longitude = parseFloat(document.getElementById('longitude').value);
      if (isNaN(latitude) || isNaN(longitude)) {
        mostrarToast('Informe latitude e longitude válidas.', 'erro');
        return;
      }
      try {
        await api('/pontos-culturais', {
          method: 'POST',
          body: JSON.stringify({
            nome: nome,
            categoria: categoria,
            descricao: descricao,
            endereco: endereco,
            latitude: latitude,
            longitude: longitude,
            imagem_url: imagemUploadadaUrl,
            tipo: 'Lugar',
            status: 'Publicado'
          })
        });
        mostrarToast('"' + nome + '" cadastrado com sucesso!', 'sucesso');
        form.reset();
        removerImagem();
        carregarItens();
      } catch (err) {
        mostrarToast('Erro ao cadastrar: ' + err.message, 'erro');
      }
    } else {
      let dataInicio = document.getElementById('data-inicio').value;
      let dataFim = document.getElementById('data-fim').value;
      let tags = document.getElementById('tags').value;
      let latEvento = parseFloat(document.getElementById('latitude').value);
      let lngEvento = parseFloat(document.getElementById('longitude').value);
      if (!dataInicio) {
        mostrarToast('Informe a data de início do evento.', 'erro');
        return;
      }
      try {
        await api('/eventos', {
          method: 'POST',
          body: JSON.stringify({
            nome: nome,
            titulo: nome,
            descricao: descricao,
            local: endereco,
            data_inicio: dataInicio,
            data_fim: dataFim || null,
            latitude: isNaN(latEvento) ? null : latEvento,
            longitude: isNaN(lngEvento) ? null : lngEvento,
            tags: tags ? tags.split(',').map(function (t) { return t.trim(); }) : [],
            imagem_url: imagemUploadadaUrl,
            status: 'Publicado'
          })
        });
        mostrarToast('"' + nome + '" cadastrado com sucesso!', 'sucesso');
        form.reset();
        removerImagem();
        carregarItens();
      } catch (err) {
        mostrarToast('Erro ao cadastrar: ' + err.message, 'erro');
      }
    }
  });
}

async function buscarCoordenadas() {
  let endereco = document.getElementById('localizacao').value;
  if (!endereco) {
    mostrarToast('Digite o endereço primeiro.', 'erro');
    return;
  }
  let btn = document.querySelector('.btn-geocode');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Buscando...';
  try {
    let response = await fetch('https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(endereco + ', Piauí, Brasil') + '&limit=1');
    let data = await response.json();
    if (data && data.length > 0) {
      document.getElementById('latitude').value = data[0].lat;
      document.getElementById('longitude').value = data[0].lon;
      mostrarToast('Coordenadas encontradas: ' + data[0].lat + ', ' + data[0].lon, 'sucesso');
    } else {
      mostrarToast('Endereço não encontrado. Insira as coordenadas manualmente.', 'erro');
    }
  } catch (err) {
    mostrarToast('Erro ao buscar coordenadas: ' + err.message, 'erro');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-map-pin"></i> Buscar coordenadas pelo endereço';
  }
}

function configurarAbas() {
  let tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      if (tab.textContent.trim().includes('Lugar')) alternarAba('Lugar');
      else if (tab.textContent.trim().includes('Evento')) alternarAba('Evento');
    });
  });
}

function configurarFiltros() {
  let filtros = document.querySelectorAll('.filter-btn');
  filtros.forEach(function (filtro) {
    filtro.addEventListener('click', function () {
      filtros.forEach(function (f) { return f.classList.remove('active'); });
      filtro.classList.add('active');
      let label = filtro.innerText;
      if (label === 'Todos') {
        itensFiltrados = itensCache.slice();
      } else if (label === 'Lugares') {
        itensFiltrados = itensCache.filter(function (item) { return item._tipo === 'ponto'; });
      } else if (label === 'Eventos') {
        itensFiltrados = itensCache.filter(function (item) { return item._tipo === 'evento'; });
      }
      paginaAtual = 1;
      renderizarTabela(itensFiltrados);
    });
  });
}

function configurarLogout() {
  let links = document.querySelectorAll('.btn-logout, a.btn-logout');
  links.forEach(function (el) {
    if (el.textContent.trim().toLowerCase().includes('sair')) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        clearToken();
        clearUsuarioLogado();
        let href = el.getAttribute('href') || 'login.html';
        window.location.href = href;
      });
    }
  });
}

function configurarHamburger() {
  let btn = document.getElementById('hamburgerBtn');
  let sidebar = document.querySelector('.sidebar');
  if (!btn || !sidebar) return;
  btn.addEventListener('click', function () {
    btn.classList.toggle('active');
    let isVisible = sidebar.style.display === 'flex';
    sidebar.style.display = isVisible ? 'none' : 'flex';
  });
}

document.addEventListener('DOMContentLoaded', function () {
  atualizarSidebarAdmin();
  configurarLogout();
  configurarUploadAvatar();
  configurarUploadImagem();
  carregarItens();
  configurarFormulario();
  configurarAbas();
  configurarFiltros();
  configurarHamburger();
});
