let novaFotoAvatar = null;

function gerenciarDropdown() {
  let avatar = document.getElementById('avatar-dropdown');
  let menu = document.getElementById('dropdownMenu');
  if (!avatar || !menu) return;
  avatar.addEventListener('click', function (e) {
    e.stopPropagation();
    menu.classList.toggle('ativo');
  });
  document.addEventListener('click', function () {
    menu.classList.remove('ativo');
  });
}

function formatarData(dataISO) {
  if (!dataISO) return 'Data desconhecida';
  let meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  let d = new Date(dataISO);
  return meses[d.getMonth()] + ' de ' + d.getFullYear();
}

function formatarDataCurta(dataISO) {
  if (!dataISO) return '';
  let d = new Date(dataISO);
  let dia = String(d.getDate()).padStart(2, '0');
  let meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
  return '<span>' + dia + '</span><span>' + meses[d.getMonth()] + '</span>';
}

function formatarDataApoio(dataISO) {
  if (!dataISO) return '';
  let d = new Date(dataISO);
  let dia = String(d.getDate()).padStart(2, '0');
  let mes = String(d.getMonth() + 1).padStart(2, '0');
  let ano = d.getFullYear();
  return dia + '/' + mes + '/' + ano;
}

async function carregarDadosVisitante() {
  let usuario = getUsuarioLogado();
  if (!usuario) return;

  try {
    let authData = await api('/auth/me');
    if (authData && authData.usuario) {
      usuario = authData.usuario;
      setUsuarioLogado(usuario);
    }
  } catch (e) {}

  let nomeEl = document.getElementById('nome-visitante');
  let bioEl = document.getElementById('bio-visitante');
  let cidadeEl = document.getElementById('cidade-visitante');
  let avatarEl = document.getElementById('avatar-grande');
  let memberSinceEl = document.getElementById('member-since');
  let avatarEdit = document.getElementById('avatar-edit');

  if (nomeEl) nomeEl.textContent = usuario.nome;
  if (bioEl) bioEl.textContent = usuario.bio || 'Nenhuma biografia cadastrada.';
  if (cidadeEl) cidadeEl.innerHTML = '<i class="fas fa-map-marker-alt"></i> ' + (usuario.cidade || 'Não informada');
  if (avatarEl) avatarEl.src = usuario.avatar_url || 'https://via.placeholder.com/300x300?text=' + encodeURIComponent(usuario.nome.charAt(0));
  if (avatarEdit) avatarEdit.src = usuario.avatar_url || 'https://via.placeholder.com/300x300?text=' + encodeURIComponent(usuario.nome.charAt(0));
  if (memberSinceEl) memberSinceEl.innerHTML = '<i class="fas fa-calendar-alt"></i> Membro desde: ' + formatarData(usuario.data_cadastro);

  let nomeInput = document.getElementById('nome');
  let bioInput = document.getElementById('bio');
  let cidadeInput = document.getElementById('cidade');
  if (nomeInput) nomeInput.value = usuario.nome;
  if (bioInput) bioInput.value = usuario.bio || '';
  if (cidadeInput) cidadeInput.value = usuario.cidade || '';
}

async function carregarFavoritos() {
  try {
    let favoritos = await api('/favoritos');
    favoritosCache = (favoritos || []).map(function (f) { return f.artista_id; });
    let grid = document.getElementById('favoritos-grid');
    if (!grid) return;
    if (!favoritos || favoritos.length === 0) {
      grid.innerHTML = '<p class="sem-dados">Nenhum artista favoritado ainda.</p>';
      return;
    }
    grid.innerHTML = '';
    favoritos.forEach(function (fav) {
      let card = document.createElement('div');
      card.className = 'card-artista';
      card.style.cursor = 'pointer';
      let imgSrc = fav.foto_url || fav.avatar_url;
      let letra = (fav.nome_artistico || '?').charAt(0).toUpperCase();
      let imgHtml = imgSrc
        ? '<img src="' + imgSrc + '" alt="' + fav.nome_artistico + '" class="img-card">'
        : '<div class="img-card img-card-placeholder">' + letra + '</div>';
      card.innerHTML = '<button class="btn-fav-coracao ativo" title="Remover dos favoritos"><i class="fas fa-heart"></i></button>' + imgHtml + '<div class="info-card"><h3>' + fav.nome_artistico + '</h3><p>' + (fav.categoria_artistica || 'Artista') + '</p><p><i class="fas fa-map-marker-alt"></i> ' + (fav.localizacao || 'Local não informado') + '</p></div>';
      let heartBtn = card.querySelector('.btn-fav-coracao');
      if (heartBtn) {
        heartBtn.addEventListener('click', async function (e) {
          e.stopPropagation();
          let resultado = await toggleFavoritar(fav.artista_id, heartBtn);
          if (resultado !== undefined && !resultado) {
            card.remove();
            if (grid.children.length === 0) {
              grid.innerHTML = '<p class="sem-dados">Nenhum artista favoritado ainda.</p>';
            }
          }
        });
      }
      card.addEventListener('click', function () {
        window.location.href = 'perfil-artista.html?id=' + fav.artista_id;
      });
      grid.appendChild(card);
    });
  } catch (err) {
    console.error('Erro ao carregar favoritos:', err);
  }
}

async function carregarEventos() {
  try {
    let eventos = await api('/eventos?status=Publicado');
    let lista = document.getElementById('eventos-lista');
    if (!lista) return;

    let hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    let proximos = (eventos || []).filter(function (ev) {
      return ev.data_inicio && new Date(ev.data_inicio) >= hoje;
    });
    proximos.sort(function (a, b) {
      return new Date(a.data_inicio) - new Date(b.data_inicio);
    });

    if (proximos.length === 0) {
      lista.innerHTML = '<p class="sem-dados">Nenhum evento futuro disponível no momento.</p>';
      return;
    }
    lista.innerHTML = '';
    proximos.forEach(function (ev) {
      let item = document.createElement('div');
      item.className = 'item-evento';
      let dataEl = formatarDataCurta(ev.data_inicio || ev.data_evento);
      item.innerHTML = '<div class="data-evento">' + dataEl + '</div><div class="info-evento"><h4>' + (ev.titulo || ev.nome) + '</h4><p><i class="fas fa-map-marker-alt"></i> ' + (ev.local || ev.endereco || 'Local não informado') + '</p><span class="tag-evento">' + (ev.categoria || ev.tipo || 'Evento') + '</span></div><img src="' + (ev.imagem_url || ev.capa_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=200') + '" alt="' + (ev.titulo || ev.nome) + '" class="img-evento">';
      lista.appendChild(item);
    });
  } catch (err) {
    console.error('Erro ao carregar eventos:', err);
  }
}

async function carregarApoios() {
  try {
    let doacoes = await api('/doacoes');
    let tabela = document.getElementById('apoios-tabela');
    if (!tabela) return;
    if (!doacoes || doacoes.length === 0) {
      tabela.innerHTML = '<tr><td colspan="3"><p class="sem-dados">Nenhum apoio realizado ainda.</p></td></tr>';
      return;
    }
    tabela.innerHTML = '';
    doacoes.forEach(function (d) {
      let tr = document.createElement('tr');
      tr.innerHTML = '<td><div class="apoio-artista"><img src="' + (d.foto_url || 'https://via.placeholder.com/100x100?text=' + encodeURIComponent(d.nome_artistico)) + '" alt="' + d.nome_artistico + '" class="avatar-apoio"><div><div class="nome-apoio">' + d.nome_artistico + '</div><div class="categoria-apoio">' + (d.categoria_artistica || 'Artista') + '</div></div></div></td><td><span class="local-apoio"><i class="fas fa-map-marker-alt"></i> ' + (d.localizacao || 'Local não informado') + '</span></td><td class="data-apoio"><span class="coracao-apoio"><i class="fas fa-heart"></i></span> Apoiou em ' + formatarDataApoio(d.data_doacao) + ' <i class="fas fa-chevron-right"></i></td>';
      tabela.appendChild(tr);
    });
  } catch (err) {
    console.error('Erro ao carregar apoios:', err);
    let tabela = document.getElementById('apoios-tabela');
    if (tabela) {
      tabela.innerHTML = '<tr><td colspan="3"><p class="sem-dados">Erro ao carregar apoios.</p></td></tr>';
    }
  }
}

let modal = document.getElementById('modalEditarPerfil');

function abrirModal() {
  if (modal) {
    novaFotoAvatar = null;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}

function fecharModal() {
  if (modal) {
    novaFotoAvatar = null;
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

document.addEventListener('click', function (event) {
  if (event.target == modal) fecharModal();
});

/* Avatar upload */
let btnAlterarFoto = document.getElementById('btnAlterarFoto');
let inputAvatar = document.getElementById('inputAvatarEdit');
if (btnAlterarFoto && inputAvatar) {
  btnAlterarFoto.addEventListener('click', function () { inputAvatar.click(); });
  inputAvatar.addEventListener('change', function () {
    let file = inputAvatar.files[0];
    if (!file) return;
    let tipos = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!tipos.includes(file.type)) {
      mostrarToast('Formato não aceito. Use JPG, PNG, GIF ou WebP.', 'erro');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      mostrarToast('A imagem deve ter no máximo 10 MB.', 'erro');
      return;
    }
    novaFotoAvatar = file;
    let reader = new FileReader();
    reader.onload = function (e) {
      let preview = document.getElementById('avatar-edit');
      if (preview) preview.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

let formEditar = document.getElementById('formEditarPerfil');
if (formEditar) {
  formEditar.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (!isAuthenticated()) {
      mostrarToast('Faça login para editar seu perfil.', 'erro');
      return;
    }
    let btnSalvar = formEditar.querySelector('.btn-salvar');
    let textoOriginal = btnSalvar.innerHTML;
    btnSalvar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
    btnSalvar.disabled = true;

    try {
      let avatarUrl = null;
      if (novaFotoAvatar) {
        let formData = new FormData();
        formData.append('avatar', novaFotoAvatar);
        let uploadResult = await api('/upload/avatar', {
          method: 'POST',
          body: formData,
          raw: true
        });
        avatarUrl = uploadResult.avatar_url;
      }

      let payload = {
        nome: document.getElementById('nome').value,
        bio: document.getElementById('bio').value,
        cidade: document.getElementById('cidade').value
      };
      if (avatarUrl) payload.avatar_url = avatarUrl;

      let result = await api('/auth/me', {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      setUsuarioLogado(result.usuario);
      carregarDadosVisitante();
      atualizarHeaderLogado();
      fecharModal();
      mostrarToast('Perfil atualizado com sucesso!', 'sucesso');
      btnSalvar.innerHTML = textoOriginal;
      btnSalvar.disabled = false;
    } catch (err) {
      mostrarToast('Erro ao salvar: ' + err.message, 'erro');
      btnSalvar.innerHTML = textoOriginal;
      btnSalvar.disabled = false;
    }
  });
}

function atualizarHeaderLogado() {
  let usuario = getUsuarioLogado();
  let profileMini = document.querySelector('.user-profile-mini');
  if (!profileMini) return;

  if (!usuario) {
    let navActions = document.querySelector('.nav-actions');
    if (navActions) {
      let loginHref = window.location.pathname.includes('/pages/') ? 'login.html' : 'pages/login.html';
      navActions.innerHTML = '<input type="text" class="search-bar" placeholder="Buscar lugares, eventos, artistas..."><a href="' + loginHref + '" class="btn-login-header"><i class="fas fa-user"></i> Entrar</a>';
    }
    return;
  }

  let img = profileMini.querySelector('img');
  if (img) img.src = usuario.avatar_url || 'https://via.placeholder.com/32x32?text=' + usuario.nome.charAt(0);
}

function configurarLogout() {
  let links = document.querySelectorAll('.dropdown-item, .btn-logout, a.btn-logout');
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

document.addEventListener('DOMContentLoaded', function () {
  atualizarHeaderLogado();
  configurarLogout();
  gerenciarDropdown();
  carregarDadosVisitante();
  carregarFavoritos();
  carregarEventos();
  carregarApoios();
});
