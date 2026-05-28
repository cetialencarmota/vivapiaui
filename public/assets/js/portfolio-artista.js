let imagemFile = null;
let obraEditandoId = null;
let todasObras = [];
let filtroCategoriaObra = null;
let termoBuscaObra = '';
let paginaAtual = 1;
let itensPorPagina = 8;

var isPublicView = new URLSearchParams(window.location.search).has('id');
var artistaIdPublic = new URLSearchParams(window.location.search).get('id');

function mostrarErro(msg) {
  mostrarToast(msg, 'erro');
}

function configurarLogout() {
  let btn = document.querySelector('.btn-logout');
  if (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      clearToken();
      clearUsuarioLogado();
      localStorage.removeItem('artista_perfil');
      window.location.href = 'login.html';
    });
  }
}

function atualizarSidebar(artista) {
  let img = document.querySelector('.avatar');
  if (img) {
    let nome = artista.nome_artistico || artista.nome || 'Artista';
    if (artista.foto_url) img.src = artista.foto_url;
    img.alt = nome;
  }

  let nome = document.querySelector('.info-artista h3');
  if (nome) nome.textContent = artista.nome_artistico || artista.nome || 'Artista';
}

function carregarSidebar() {
  let cached = localStorage.getItem('artista_perfil');
  if (cached) {
    try { atualizarSidebar(JSON.parse(cached)); } catch (e) {}
  }
  if (!isAuthenticated()) return;
  api('/artistas/me').then(function (artista) {
    if (artista) {
      atualizarSidebar(artista);
      localStorage.setItem('artista_perfil', JSON.stringify(artista));
    }
  }).catch(function () {});
}

function abrirModal() {
  obraEditandoId = null;
  document.getElementById('modalTitulo').textContent = 'Adicionar Nova Obra';
  document.getElementById('modalSubtitulo').textContent = 'Compartilhe sua arte com o mundo.';
  document.getElementById('btnSubmitIcon').textContent = '+';
  document.getElementById('btnSubmitTexto').textContent = 'Adicionar ao Portfólio';
  document.getElementById('formNovaObra').reset();
  document.getElementById('previewObra').style.display = 'none';
  document.querySelector('.upload-placeholder').style.display = 'flex';
  imagemFile = null;
  document.getElementById('modalObra').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function fecharModal() {
  obraEditandoId = null;
  document.getElementById('modalObra').classList.remove('active');
  document.body.style.overflow = '';
  document.getElementById('formNovaObra').reset();
  resetarPreviewModal();
}

function renderObras(obras) {
  let grid = document.getElementById('gridObras');
  if (!grid) return;
  if (!obras || obras.length === 0) {
    grid.innerHTML = '<p class="vazio">Nenhuma obra encontrada.</p>';
    return;
  }
  grid.innerHTML = obras.map(function (obra) {
    let imgSrc = obra.imagem_url || 'https://via.placeholder.com/300x400?text=Sem+Imagem';
    let badgeHtml;
    if (isPublicView) {
      badgeHtml = '<span class="card-badge">' + (obra.categoria || '') + '</span>';
    } else {
      let badgeClass = obra.status === 'Público' ? 'badge-publico' : 'badge-rascunho';
      badgeHtml = '<span class="card-badge ' + badgeClass + '">' + obra.status + '</span>';
    }
    let html = '<div class="card-obra" data-id="' + obra.id + '">' +
      '<div class="card-img-wrapper">' +
        '<img src="' + imgSrc + '" alt="' + obra.titulo + '" class="card-img" loading="lazy">' +
        badgeHtml +
      '</div>' +
      '<div class="card-info">' +
        '<h3>' + obra.titulo + '</h3>' +
        '<p class="card-categoria">' + (isPublicView ? (obra.descricao || '') : (obra.categoria || '')) + '</p>' +
      '</div>';
    if (!isPublicView) {
      html += '<div class="card-acoes">' +
        '<button class="btn-acao" onclick="abrirModalEdicao(' + obra.id + ')"><i class="fas fa-edit"></i> Editar</button>' +
        '<button class="btn-acao excluir" onclick="excluirObra(' + obra.id + ')"><i class="fas fa-trash"></i> Excluir</button>' +
      '</div>';
    }
    html += '</div>';
    return html;
  }).join('');
}

async function carregarObras() {
  try {
    let obras = await api('/obras');
    todasObras = obras || [];
    paginaAtual = 1;
    renderizarFiltros(todasObras);
    aplicarFiltrosObras();
  } catch (err) {
    console.error('Erro ao carregar obras:', err);
  }
}

async function carregarObrasPublicas(artistaId) {
  try {
    let data = await api('/artistas/' + artistaId);
    if (!data || data.error) {
      mostrarErro('Artista não encontrado');
      return;
    }
    let nomeArtista = data.nome_artistico || data.nome || 'Artista';
    document.title = nomeArtista + ' - Obras - Viva Piauí';
    let topHeader = document.getElementById('topHeaderPublic');
    if (topHeader) topHeader.style.display = 'flex';
    let bcNome = document.getElementById('bcArtistaNome');
    if (bcNome) bcNome.textContent = nomeArtista;
    let tituloSecao = document.querySelector('.titulo-secao h1');
    if (tituloSecao) tituloSecao.textContent = 'Obras de ' + nomeArtista;
    let subtitulo = document.querySelector('.titulo-secao p');
    if (subtitulo) subtitulo.textContent = 'Conheça o portfólio completo do artista.';
    todasObras = data.obras || [];
    paginaAtual = 1;
    renderizarFiltros(todasObras);
    aplicarFiltrosObras();
  } catch (err) {
    console.error('Erro ao carregar obras públicas:', err);
  }
}

function renderizarFiltros(obras) {
  let nav = document.getElementById('filtrosPortfolio');
  if (!nav) return;
  let cats = {};
  obras.forEach(function (o) {
    let c = o.categoria || 'Outros';
    if (!cats[c]) cats[c] = 0;
    cats[c]++;
  });
  let html = '<button class="filtro-item active" data-categoria="">Todas <span>' + obras.length + '</span></button>';
  Object.keys(cats).sort().forEach(function (cat) {
    html += '<button class="filtro-item" data-categoria="' + cat.replace(/"/g, '&quot;') + '">' + cat + ' <span>' + cats[cat] + '</span></button>';
  });
  nav.innerHTML = html;

  nav.querySelectorAll('.filtro-item').forEach(function (btn) {
    btn.addEventListener('click', function () {
      nav.querySelectorAll('.filtro-item').forEach(function (b) { b.classList.remove('active'); });
      this.classList.add('active');
      filtroCategoriaObra = this.dataset.categoria || null;
      paginaAtual = 1;
      aplicarFiltrosObras();
    });
  });
}

function aplicarFiltrosObras() {
  let filtradas = todasObras.filter(function (obra) {
    if (filtroCategoriaObra && (obra.categoria || 'Outros') !== filtroCategoriaObra) return false;
    if (termoBuscaObra) {
      let titulo = (obra.titulo || '').toLowerCase();
      let desc = (obra.descricao || '').toLowerCase();
      if (titulo.indexOf(termoBuscaObra) === -1 && desc.indexOf(termoBuscaObra) === -1) return false;
    }
    return true;
  });

  let totalPaginas = Math.max(1, Math.ceil(filtradas.length / itensPorPagina));
  if (paginaAtual > totalPaginas) paginaAtual = totalPaginas;

  let inicio = (paginaAtual - 1) * itensPorPagina;
  let paginaObras = filtradas.slice(inicio, inicio + itensPorPagina);

  renderObras(paginaObras);

  let contador = document.getElementById('contadorObras');
  if (contador) {
    if (filtradas.length === 0) {
      contador.textContent = 'Nenhuma obra encontrada';
    } else {
      let ate = Math.min(inicio + itensPorPagina, filtradas.length);
      contador.textContent = 'Mostrando ' + (inicio + 1) + ' a ' + ate + ' de ' + filtradas.length + ' obra' + (filtradas.length !== 1 ? 's' : '');
    }
  }

  renderizarPaginacao(totalPaginas, filtradas.length);
}

function renderizarPaginacao(totalPaginas, totalFiltradas) {
  let container = document.getElementById('paginacao');
  let footer = document.getElementById('footerListagem');
  if (!container) return;
  if (!footer) return;

  if (totalFiltradas === 0) {
    container.innerHTML = '';
    footer.style.display = 'none';
    return;
  }
  footer.style.display = '';

  if (totalPaginas <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = '';

  let prevDisabled = paginaAtual <= 1;
  html += '<button class="pag-btn" data-pagina="' + (paginaAtual - 1) + '"' + (prevDisabled ? ' disabled' : '') + '>&laquo;</button>';

  for (var i = 1; i <= totalPaginas; i++) {
    if (totalPaginas > 7 && i > 2 && i < totalPaginas - 1 && Math.abs(i - paginaAtual) > 2) {
      if (i === 3 || i === totalPaginas - 2) html += '<span class="pag-ellipsis">...</span>';
      continue;
    }
    html += '<button class="pag-btn' + (i === paginaAtual ? ' active' : '') + '" data-pagina="' + i + '">' + i + '</button>';
  }

  let nextDisabled = paginaAtual >= totalPaginas;
  html += '<button class="pag-btn" data-pagina="' + (paginaAtual + 1) + '"' + (nextDisabled ? ' disabled' : '') + '>&raquo;</button>';

  container.innerHTML = html;

  container.querySelectorAll('.pag-btn[data-pagina]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      let pg = parseInt(this.dataset.pagina);
      if (pg < 1 || pg > totalPaginas) return;
      paginaAtual = pg;
      aplicarFiltrosObras();
    });
  });
}

async function fazerUpload(file) {
  let formData = new FormData();
  formData.append('imagem', file);
  let result = await api('/upload/imagem', {
    method: 'POST',
    body: formData,
    raw: true
  });
  return result.imagem_url;
}

async function abrirModalEdicao(obraId) {
  try {
    let obra = await api('/obras/' + obraId);
    obraEditandoId = obra.id;
    document.getElementById('modalTitulo').textContent = 'Editar Obra';
    document.getElementById('modalSubtitulo').textContent = 'Atualize as informações da sua obra.';
    document.getElementById('btnSubmitIcon').textContent = '';
    document.getElementById('btnSubmitTexto').textContent = 'Salvar Alterações';

    document.getElementById('tituloObra').value = obra.titulo || '';
    document.getElementById('descricaoObra').value = obra.descricao || '';
    document.getElementById('categoriaObra').value = obra.categoria || '';

    let radios = document.querySelectorAll('input[name="visibilidade"]');
    radios.forEach(function (r) {
      r.checked = r.value === obra.status;
    });

    let preview = document.getElementById('previewObra');
    let placeholder = document.querySelector('.upload-placeholder');
    if (obra.imagem_url) {
      preview.src = obra.imagem_url;
      preview.style.display = 'block';
      placeholder.style.display = 'none';
    } else {
      preview.style.display = 'none';
      placeholder.style.display = 'flex';
    }
    imagemFile = null;

    let campoDescricao = document.getElementById('descricaoObra');
    let contador = document.querySelector('.contador-caracteres');
    if (contador) contador.textContent = (obra.descricao || '').length + '/500';

    document.getElementById('modalObra').classList.add('active');
    document.body.style.overflow = 'hidden';
  } catch (err) {
    mostrarErro('Erro ao carregar obra: ' + err.message);
  }
}

async function excluirObra(obraId) {
  if (!confirm('Tem certeza que deseja excluir esta obra? Esta ação não pode ser desfeita.')) return;
  try {
    await api('/obras/' + obraId, { method: 'DELETE' });
    carregarObras();
    mostrarToast('Obra excluída com sucesso!', 'sucesso');
  } catch (err) {
    mostrarErro('Erro ao excluir obra: ' + err.message);
  }
}

function resetarPreviewModal() {
  document.getElementById('previewObra').style.display = 'none';
  document.querySelector('.upload-placeholder').style.display = 'flex';
  imagemFile = null;
}

function configurarUpload() {
  let uploadArea = document.getElementById('uploadArea');
  let input = document.getElementById('inputImagem');
  let placeholder = document.querySelector('.upload-placeholder');
  let preview = document.getElementById('previewObra');

  if (!uploadArea || !input) return;

  uploadArea.addEventListener('click', function () { input.click(); });

  uploadArea.addEventListener('dragover', function (e) {
    e.preventDefault();
    uploadArea.style.borderColor = '#ff7a00';
    uploadArea.style.background = 'rgba(255,122,0,0.05)';
  });

  uploadArea.addEventListener('dragleave', function () {
    uploadArea.style.borderColor = '';
    uploadArea.style.background = '';
  });

  uploadArea.addEventListener('drop', function (e) {
    e.preventDefault();
    uploadArea.style.borderColor = '';
    uploadArea.style.background = '';
    let file = e.dataTransfer.files[0];
    if (file) validarEProcessar(file, placeholder, preview);
  });

  input.addEventListener('change', function () {
    let file = input.files[0];
    if (file) validarEProcessar(file, placeholder, preview);
  });
}

function validarEProcessar(file, placeholder, preview) {
  let tiposValidos = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!tiposValidos.includes(file.type)) {
    mostrarErro('Formato não aceito. Use JPG, PNG, GIF ou WebP.');
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    mostrarErro('A imagem deve ter no máximo 10 MB.');
    return;
  }
  processarArquivo(file, placeholder, preview);
}

function processarArquivo(file, placeholder, preview) {
  imagemFile = file;
  let reader = new FileReader();
  reader.onload = function (e) {
    preview.src = e.target.result;
    preview.style.display = 'block';
    placeholder.style.display = 'none';
  };
  reader.readAsDataURL(file);
}

document.addEventListener('DOMContentLoaded', function () {
  if (isPublicView) {
    document.body.classList.add('public-mode');
    document.getElementById('sidebarPainel').style.display = 'none';
    document.getElementById('acoesHeader').style.display = 'none';
    carregarObrasPublicas(artistaIdPublic);
    return;
  }

  configurarLogout();
  carregarSidebar();
  configurarUpload();
  carregarObras();

  let btnAdicionar = document.querySelector('.btn-adicionar');
  if (btnAdicionar) btnAdicionar.addEventListener('click', abrirModal);

  let btnFechar = document.getElementById('btnFecharModal');
  if (btnFechar) btnFechar.addEventListener('click', fecharModal);

  let btnCancelar = document.getElementById('btnCancelarModal');
  if (btnCancelar) btnCancelar.addEventListener('click', fecharModal);

  let overlay = document.getElementById('modalObra');
  if (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) fecharModal();
    });
  }

  let form = document.getElementById('formNovaObra');
  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      let titulo = document.getElementById('tituloObra').value.trim();
      let descricao = document.getElementById('descricaoObra').value.trim();
      let categoria = document.getElementById('categoriaObra').value;

      if (!titulo || !descricao || !categoria) {
        mostrarErro('Preencha todos os campos obrigatórios.');
        return;
      }

      let btnSubmit = form.querySelector('.btn-confirmar-add');
      let textoOriginal = btnSubmit.innerHTML;
      btnSubmit.innerHTML = '<span class="fas fa-spinner fa-spin"></span> Salvando...';
      btnSubmit.disabled = true;

      try {
        let imagemUrl = null;
        if (imagemFile) {
          imagemUrl = await fazerUpload(imagemFile);
        }

        let visibilidade = form.querySelector('input[name="visibilidade"]:checked');
        let payload = {
          titulo: titulo,
          descricao: descricao,
          categoria: categoria,
          status: visibilidade ? visibilidade.value : 'Público'
        };
        if (imagemUrl) payload.imagem_url = imagemUrl;

        if (obraEditandoId) {
          await api('/obras/' + obraEditandoId, {
            method: 'PUT',
            body: JSON.stringify(payload)
          });
        } else {
          await api('/obras', {
            method: 'POST',
            body: JSON.stringify(payload)
          });
        }

        fecharModal();
        carregarObras();
        mostrarToast('Obra ' + (obraEditandoId ? 'atualizada' : 'adicionada') + ' com sucesso!', 'sucesso');

        btnSubmit.innerHTML = textoOriginal;
        btnSubmit.disabled = false;
      } catch (err) {
        mostrarErro('Erro ao ' + (obraEditandoId ? 'atualizar' : 'adicionar') + ' obra: ' + err.message);
        btnSubmit.innerHTML = textoOriginal;
        btnSubmit.disabled = false;
      }
    });
  }

  let campoDescricao = document.getElementById('descricaoObra');
  let contador = document.querySelector('.contador-caracteres');
  if (campoDescricao && contador) {
    campoDescricao.addEventListener('input', function () {
      contador.textContent = this.value.length + '/500';
    });
  }

  let searchInput = document.getElementById('searchObra');
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      termoBuscaObra = this.value.toLowerCase().trim();
      paginaAtual = 1;
      aplicarFiltrosObras();
    });
  }

  let selectItens = document.getElementById('selectItensPorPagina');
  if (selectItens) {
    selectItens.addEventListener('change', function () {
      itensPorPagina = parseInt(this.value);
      paginaAtual = 1;
      aplicarFiltrosObras();
    });
  }
});
