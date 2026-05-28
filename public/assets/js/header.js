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
  if (img) img.src = usuario.avatar_url || gerarAvatarFallback(usuario.nome, 32);

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

function montarMenuMobile() {
  let btn = document.getElementById('hamburgerBtn');
  if (!btn) return;
  if (document.getElementById('mobileMenu')) return;

  let prefix = window.location.pathname.includes('/pages/') ? '' : 'pages/';

  let menu = document.createElement('nav');
  menu.className = 'mobile-menu';
  menu.id = 'mobileMenu';

  var links = [
    { href: '../index.html', icon: 'fa-home', label: 'In\u00edcio' },
    { href: prefix + 'artistas.html', icon: 'fa-users', label: 'Artistas' },
    { href: prefix + 'eventos.html', icon: 'fa-calendar-alt', label: 'Eventos' },
    { href: prefix + 'sobre.html', icon: 'fa-info-circle', label: 'Sobre' }
  ];

  links.forEach(function (link) {
    var a = document.createElement('a');
    a.href = link.href;
    a.innerHTML = '<i class="fas ' + link.icon + '"></i> ' + link.label;
    menu.appendChild(a);
  });

  var searchDiv = document.createElement('div');
  searchDiv.className = 'mobile-search';
  searchDiv.innerHTML = '<i class="fas fa-search"></i><input type="text" placeholder="Buscar..." id="mobileSearchInput">';
  menu.appendChild(searchDiv);

  btn.parentNode.insertBefore(menu, btn.nextSibling);

  btn.addEventListener('click', function () {
    btn.classList.toggle('active');
    menu.classList.toggle('open');
    document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
  });

  menu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      btn.classList.remove('active');
      menu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  var searchInput = menu.querySelector('#mobileSearchInput');
  if (searchInput) {
    searchInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        var termo = this.value.trim();
        if (termo) {
          window.location.href = prefix + 'busca.html?q=' + encodeURIComponent(termo);
        }
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', function () {
  montarMenuMobile();
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
