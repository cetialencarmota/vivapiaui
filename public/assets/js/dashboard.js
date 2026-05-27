function editarObra(id) {
  window.location.href = 'portfolio-artista.html?editar=' + id;
}

async function excluirObra(id) {
  if (!confirm('Tem certeza que deseja excluir esta obra do seu portfólio?')) return;
  try {
    await api('/obras/' + id, { method: 'DELETE' });
    carregarObras();
  } catch (err) {
    alert('Erro ao excluir obra: ' + err.message);
  }
}

function atualizarSidebarArtista(artista) {
  let nome = artista.nome_artistico || artista.nome || 'Artista';
  let foto = artista.foto_url || '';

  let sidebarImg = document.querySelector('.artist-profile .profile-img');
  if (sidebarImg && foto) sidebarImg.src = foto;
  let sidebarName = document.querySelector('.artist-profile .profile-info h3');
  if (sidebarName) sidebarName.textContent = nome;

  let avatar = document.querySelector('.avatar-container .avatar');
  if (avatar && foto) avatar.src = foto;
  let infoName = document.querySelector('.info-artista h3');
  if (infoName) infoName.textContent = nome;

  let sidebarFoto = document.getElementById('sidebar-foto');
  if (sidebarFoto && foto) sidebarFoto.src = foto;
  let nomeMini = document.querySelector('.nome-mini');
  if (nomeMini) nomeMini.textContent = nome;

  let greeting = document.querySelector('.content-header h2');
  if (greeting) greeting.textContent = 'Olá, ' + nome + '! 👋';
}

function carregarDashboard() {
  let statObras = document.getElementById('statObras');
  let statApoios = document.getElementById('statApoios');
  if (!statObras && !statApoios) return;
  if (!isAuthenticated()) return;

  let cached = localStorage.getItem('artista_perfil');
  if (cached) {
    try { atualizarSidebarArtista(JSON.parse(cached)); } catch (e) {}
  }

  api('/artistas/me').then(function (data) {
    if (!data) return;
    atualizarSidebarArtista(data);
    localStorage.setItem('artista_perfil', JSON.stringify(data));
    api('/auth/me').then(function (auth) {
      if (auth && auth.usuario) setUsuarioLogado(auth.usuario);
    }).catch(function () {});

    let obras = data.obras || [];
    if (statObras) statObras.textContent = obras.length;
    if (statApoios) statApoios.textContent = data.total_doacoes > 0 ? "R$ " + data.total_doacoes : '0';

    let portfolioGrid = document.querySelector('.portfolio-grid');
    if (portfolioGrid && data.obras) {
      let categorias = {};
      data.obras.forEach(function (obra) {
        let cat = obra.categoria || 'Outros';
        if (!categorias[cat]) categorias[cat] = { count: 0, image: obra.imagem_url };
        categorias[cat].count++;
        if (!categorias[cat].image && obra.imagem_url) categorias[cat].image = obra.imagem_url;
      });

      let addCard = portfolioGrid.querySelector('.add-card');
      portfolioGrid.innerHTML = '';

      Object.keys(categorias).forEach(function (cat) {
        let card = document.createElement('div');
        card.className = 'portfolio-card';
        let img = categorias[cat].image || 'https://images.unsplash.com/photo-1520408222757-6f9f95d87d5d?auto=format&fit=crop&w=400&q=80';
        card.innerHTML = '<img src="' + img + '" alt="' + cat + '"><div class="card-info"><h4>' + cat + '</h4><p>' + categorias[cat].count + ' obras</p></div>';
        card.addEventListener('click', function () { window.location.href = 'portfolio-artista.html'; });
        portfolioGrid.appendChild(card);
      });

      if (addCard) {
        addCard.addEventListener('click', function () { window.location.href = 'portfolio-artista.html'; });
        portfolioGrid.appendChild(addCard);
      }
    }
  }).catch(function () { });
}

function formatarTempoMensagem(dataISO) {
  if (!dataISO) return '';
  let agora = new Date();
  let data = new Date(dataISO);
  let diffMs = agora - data;
  let diffMin = Math.floor(diffMs / 60000);
  let diffHoras = Math.floor(diffMs / 3600000);
  let diffDias = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Agora';
  if (diffMin < 60) return 'Há ' + diffMin + ' min';
  if (diffHoras < 24) return 'Há ' + diffHoras + 'h';
  if (diffDias < 7) return 'Há ' + diffDias + ' dias';
  return data.toLocaleDateString('pt-BR');
}

function obterAvatarUrl(msg) {
  if (msg.avatar_url) return msg.avatar_url;
  return 'https://i.pravatar.cc/150?u=' + encodeURIComponent(msg.nome || msg.remetente_nome || 'anonimo');
}

function abrirModalMensagem(msg) {
  let modal = document.getElementById('modal-ver-mensagem');
  if (!modal) return;

  document.getElementById('msgViewAvatar').src = obterAvatarUrl(msg);
  document.getElementById('msgViewAvatar').alt = msg.nome || msg.remetente_nome || 'Anônimo';
  document.getElementById('msgViewName').textContent = msg.nome || msg.remetente_nome || 'Anônimo';
  document.getElementById('msgViewEmail').textContent = msg.email || '';
  document.getElementById('msgViewDate').textContent = msg.data_envio ? new Date(msg.data_envio).toLocaleString('pt-BR') : '';
  document.getElementById('msgViewText').textContent = msg.mensagem;

  let badge = document.getElementById('msgViewUnread');
  let btnLida = document.getElementById('btnMarcarLida');
  if (badge) {
    badge.style.display = msg.lida ? 'none' : 'inline';
  }
  if (btnLida) {
    btnLida.disabled = !!msg.lida;
    btnLida.style.opacity = msg.lida ? '0.5' : '1';
    btnLida.dataset.msgId = msg.id;
  }

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function fecharModalMensagem() {
  let modal = document.getElementById('modal-ver-mensagem');
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = 'auto';
}

let mensagensCache = [];
let mostrarTodasMensagens = false;

function renderizarMensagens() {
  let messagesList = document.querySelector('.messages-list');
  let linkVerTodas = document.getElementById('link-ver-todas-msg');
  if (!messagesList) return;

  let total = mensagensCache.length;
  let limite = mostrarTodasMensagens ? total : 5;
  let exibir = mensagensCache.slice(0, limite);

  messagesList.innerHTML = '';
  exibir.forEach(function (msg) {
    let div = document.createElement('div');
    div.className = 'message-item';
    let avatarSrc = obterAvatarUrl(msg);
    let nome = msg.nome || msg.remetente_nome || 'Anônimo';
    let preview = msg.mensagem ? msg.mensagem.substring(0, 60) + (msg.mensagem.length > 60 ? '...' : '') : '';
    let tempo = formatarTempoMensagem(msg.data_envio);
    div.innerHTML =
      '<div class="user-avatar">' +
        (msg.lida ? '' : '<span class="status-dot"></span>') +
        '<img src="' + avatarSrc + '" alt="' + nome + '">' +
      '</div>' +
      '<div class="message-content">' +
        '<span class="user-name">' + nome + '</span>' +
        '<p class="message-text">' + preview + '</p>' +
      '</div>' +
      '<div class="message-meta">' +
        '<span class="time">' + tempo + '</span>' +
        '<span class="arrow">›</span>' +
      '</div>';
    div.addEventListener('click', function () { abrirModalMensagem(msg); });
    messagesList.appendChild(div);
  });

  if (linkVerTodas) {
    if (total > 5) {
      linkVerTodas.style.display = '';
      linkVerTodas.textContent = mostrarTodasMensagens ? 'Mostrar menos −' : 'Ver todas (' + total + ') ↗';
    } else {
      linkVerTodas.style.display = 'none';
    }
  }
}

function carregarMensagens() {
  if (!isAuthenticated()) return;

  api('/mensagens').then(function (mensagens) {
    if (!mensagens || mensagens.length === 0) {
      let messagesList = document.querySelector('.messages-list');
      if (messagesList) {
        messagesList.innerHTML = '<div class="message-item"><div class="message-content"><p class="message-text">Nenhuma mensagem recebida ainda.</p></div></div>';
      }
      let linkVerTodas = document.getElementById('link-ver-todas-msg');
      if (linkVerTodas) linkVerTodas.style.display = 'none';
      return;
    }
    mensagensCache = mensagens;
    mostrarTodasMensagens = false;
    renderizarMensagens();
  }).catch(function () { });
}

let obrasCache = [];

function carregarObras() {
  let gridObras = document.getElementById('gridObras');
  if (!gridObras) return;
  if (!isAuthenticated()) {
    obrasMock(gridObras);
    return;
  }

  api('/artistas/me').then(function (artista) {
    if (artista) {
      atualizarSidebarArtista(artista);
      obrasCache = artista.obras || [];
    }
    renderizarObras(obrasCache);
  }).catch(function () {
    obrasMock(gridObras);
  });
}

function obrasMock(gridObras) {
  obrasCache = [
    { id: 1, titulo: "Vasos da Tradição", categoria: "Cerâmicas", status: "Público", imagem_url: "https://images.unsplash.com/photo-1520408222757-6f9f95d87d5d?auto=format&fit=crop&w=600&q=80" },
    { id: 2, titulo: "Memórias em Cores", categoria: "Pinturas", status: "Público", imagem_url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80" },
    { id: 3, titulo: "Tramas do Cerrado", categoria: "Artesanato", status: "Público", imagem_url: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=600&q=80" },
    { id: 4, titulo: "Fé e Devoção", categoria: "Fotografias", status: "Público", imagem_url: "https://images.unsplash.com/photo-1590422443890-2a39620b8524?auto=format&fit=crop&w=600&q=80" },
    { id: 5, titulo: "Boi de Barro", categoria: "Cerâmicas", status: "Público", imagem_url: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80" },
    { id: 6, titulo: "Pôr do Sol no Parnaíba", categoria: "Pinturas", status: "Público", imagem_url: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=600&q=80" },
    { id: 7, titulo: "Cestaria do Piauí", categoria: "Artesanato", status: "Público", imagem_url: "https://images.unsplash.com/photo-1596438413002-393282460662?auto=format&fit=crop&w=600&q=80" },
    { id: 8, titulo: "Azulejos da Nossa Terra", categoria: "Pinturas", status: "Público", imagem_url: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&w=600&q=80" }
  ];
  renderizarObras(obrasCache);
}

function renderizarObras(lista) {
  let gridObras = document.getElementById('gridObras');
  if (!gridObras) return;
  gridObras.innerHTML = '';
  (lista || []).forEach(function (obra) {
    let card = document.createElement('div');
    card.className = 'card-obra';
    card.innerHTML =
      '<img src="' + (obra.imagem_url || 'https://via.placeholder.com/600x400?text=Sem+Imagem') + '" alt="' + obra.titulo + '" class="card-img">' +
      '<div class="card-info">' +
        '<h3>' + obra.titulo + '</h3>' +
        '<p class="card-categoria">' + obra.categoria + '</p>' +
        '<div class="card-status"><span class="dot-status"></span> ' + obra.status + '</div>' +
          '<div class="card-acoes">' +
          '<button class="btn-acao" onclick="editarObra(' + obra.id + ')"><i class="fas fa-edit"></i> Editar</button>' +
          '<button class="btn-acao excluir" onclick="excluirObra(' + obra.id + ')"><i class="fas fa-trash"></i> Excluir</button>' +
        '</div>' +
      '</div>';
    gridObras.appendChild(card);
  });
}

function iniciarModalObra() {
  let modalObra = document.getElementById('modalObra');
  let btnAbrirModal = document.querySelector('.btn-adicionar');
  if (!modalObra || !btnAbrirModal) return;

  let btnFecharModal = document.getElementById('btnFecharModal');
  let btnCancelarModal = document.getElementById('btnCancelarModal');
  let formNovaObra = document.getElementById('formNovaObra');
  let uploadArea = document.getElementById('uploadArea');
  let inputImagem = document.getElementById('inputImagem');
  let descricaoObra = document.getElementById('descricaoObra');
  let contadorCaracteres = document.querySelector('.contador-caracteres');
  let filtros = document.querySelectorAll('.filtro-item');

  btnAbrirModal.addEventListener('click', function () {
    modalObra.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  function fecharModalObra() {
    modalObra.classList.remove('active');
    document.body.style.overflow = 'auto';
    if (formNovaObra) formNovaObra.reset();
    if (contadorCaracteres) contadorCaracteres.textContent = '0/500';
  }

  if (btnFecharModal) btnFecharModal.addEventListener('click', fecharModalObra);
  if (btnCancelarModal) btnCancelarModal.addEventListener('click', fecharModalObra);

  modalObra.addEventListener('click', function (e) {
    if (e.target === modalObra) fecharModalObra();
  });

  if (descricaoObra && contadorCaracteres) {
    descricaoObra.addEventListener('input', function () {
      contadorCaracteres.textContent = descricaoObra.value.length + '/500';
    });
  }

  if (uploadArea && inputImagem) {
    uploadArea.addEventListener('click', function () { inputImagem.click(); });
  }

  if (formNovaObra) {
    formNovaObra.addEventListener('submit', async function (e) {
      e.preventDefault();
      let novaObra = {
        titulo: document.getElementById('tituloObra').value,
        categoria: document.getElementById('categoriaObra').value,
        status: document.querySelector('input[name="visibilidade"]:checked').value,
        descricao: document.getElementById('descricaoObra').value
      };

      if (!isAuthenticated()) {
        alert('Faça login como artista para adicionar obras.');
        return;
      }

      try {
        let obra = await api('/obras', {
          method: 'POST',
          body: JSON.stringify(novaObra)
        });
        obrasCache.unshift(obra);
        renderizarObras(obrasCache);
        fecharModalObra();
      } catch (err) {
        alert('Erro ao adicionar obra: ' + err.message);
      }
    });
  }

  filtros.forEach(function (botao) {
    botao.addEventListener('click', function () {
      filtros.forEach(function (b) { return b.classList.remove('active'); });
      botao.classList.add('active');
      let categoria = botao.textContent;
      if (categoria === 'Todas') {
        renderizarObras(obrasCache);
      } else {
        renderizarObras(obrasCache.filter(function (o) { return o.categoria === categoria; }));
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', function () {
  let portfolioCards = document.querySelectorAll('.portfolio-card');
  portfolioCards.forEach(function (card) {
    card.addEventListener('click', function () {
      window.location.href = 'portfolio-artista.html';
    });
  });

  let addCard = document.querySelector('.add-card');
  if (addCard) {
    addCard.addEventListener('click', function () {
      window.location.href = 'portfolio-artista.html';
    });
  }

  carregarDashboard();
  carregarMensagens();
  carregarObras();
  iniciarModalObra();

  /* Ver todas mensagens toggle */
  let linkVerTodas = document.getElementById('link-ver-todas-msg');
  if (linkVerTodas) {
    linkVerTodas.addEventListener('click', function (e) {
      e.preventDefault();
      mostrarTodasMensagens = !mostrarTodasMensagens;
      renderizarMensagens();
    });
  }

  /* Modal ver mensagem */
  let modalMsgView = document.getElementById('modal-ver-mensagem');
  let btnCloseMsgView = document.getElementById('close-modal-msg-view');
  let btnFecharMsgView = document.getElementById('btnFecharMsgView');
  let btnMarcarLida = document.getElementById('btnMarcarLida');

  function fecharViewMsg() {
    fecharModalMensagem();
  }

  if (btnCloseMsgView) btnCloseMsgView.addEventListener('click', fecharViewMsg);
  if (btnFecharMsgView) btnFecharMsgView.addEventListener('click', fecharViewMsg);
  if (modalMsgView) {
    modalMsgView.addEventListener('click', function (e) {
      if (e.target === modalMsgView) fecharViewMsg();
    });
  }

  if (btnMarcarLida) {
    btnMarcarLida.addEventListener('click', async function () {
      let id = this.dataset.msgId;
      if (!id) return;
      try {
        await api('/mensagens/' + id + '/lida', { method: 'PATCH' });
        this.disabled = true;
        this.style.opacity = '0.5';
        document.getElementById('msgViewUnread').style.display = 'none';
        carregarMensagens();
      } catch (err) {
        alert('Erro ao marcar como lida: ' + err.message);
      }
    });
  }
});
