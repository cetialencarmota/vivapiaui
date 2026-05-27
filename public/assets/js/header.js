function gerenciarDropdown() {
  let profile = document.querySelector('.user-profile-mini');
  let menu = document.getElementById('dropdownMenu');
  if (!profile || !menu) return;
  profile.addEventListener('click', function (e) {
    e.stopPropagation();
    menu.classList.toggle('ativo');
  });
  document.addEventListener('click', function () {
    menu.classList.remove('ativo');
  });
}

function atualizarHeaderLogado() {
  let usuario = getUsuarioLogado();
  let profileMini = document.querySelector('.user-profile-mini');
  if (!profileMini) return;

  if (!usuario) {
    let userActions = document.querySelector('.user-actions');
    if (userActions) {
      let loginHref = window.location.pathname.includes('/pages/') ? 'login.html' : 'pages/login.html';
      userActions.innerHTML = '<a href="' + loginHref + '" class="btn-login-header"><i class="fas fa-user"></i> Entrar</a>';
    }
    return;
  }

  let img = profileMini.querySelector('img');
  if (img) img.src = usuario.avatar_url || 'https://via.placeholder.com/32x32?text=' + usuario.nome.charAt(0);

  let nameSpan = profileMini.querySelector(':scope > span');
  if (nameSpan) {
    nameSpan.innerHTML = usuario.nome.split(' ')[0] + ' <i class="fas fa-chevron-down"></i>';
  }

  let prefix = window.location.pathname.includes('/pages/') ? '' : 'pages/';
  let perfilLink = profileMini.querySelector('.dropdown-item .fa-user');
  if (perfilLink) {
    let parent = perfilLink.closest('a');
    if (parent) {
      parent.href = prefix + (usuario.tipo_perfil === 'artista' ? 'dashboard-artista.html' : usuario.tipo_perfil === 'admin' ? 'painel-admin.html' : 'perfil-visitante.html');
    }
  }

  let configItem = profileMini.querySelector('.dropdown-item .fa-cog');
  if (configItem) {
    let configParent = configItem.closest('a');
    if (configParent) {
      configParent.style.display = usuario.tipo_perfil === 'artista' ? '' : 'none';
    }
  }
}

function configurarLogout() {
  let links = document.querySelectorAll('.dropdown-item, .btn-logout, a.btn-logout');
  links.forEach(function (el) {
    if (el.textContent.trim().toLowerCase().includes('sair')) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        clearToken();
        clearUsuarioLogado();
        localStorage.removeItem('artista_perfil');
        let href = el.getAttribute('href') || 'login.html';
        window.location.href = href;
      });
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  atualizarHeaderLogado();
  configurarLogout();

  let searchInput = document.querySelector('.search-bar input');
  if (searchInput) {
    searchInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        let termo = this.value.trim();
        if (termo) {
          let prefix = window.location.pathname.includes('/pages/') ? '' : 'pages/';
          window.location.href = prefix + 'busca.html?q=' + encodeURIComponent(termo);
        }
      }
    });
  }

  let tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      tabButtons.forEach(function (b) { return b.classList.remove('active'); });
      btn.classList.add('active');
    });
  });

  gerenciarDropdown();
});
