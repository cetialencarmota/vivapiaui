let fotoFile = null;
let capaFile = null;

function toggleSenha(id, el) {
  let input = document.getElementById(id);
  if (input.type === 'password') {
    input.type = 'text';
    el.classList.remove('fa-eye');
    el.classList.add('fa-eye-slash');
  } else {
    input.type = 'password';
    el.classList.remove('fa-eye-slash');
    el.classList.add('fa-eye');
  }
}

function mostrarErroGlobal(msg) {
  mostrarToast(msg, 'erro');
}

function configurarLogout() {
  let links = document.querySelectorAll('.btn-logout, a.btn-logout, .dropdown-item');
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

function configurarUpload(inputId, btnId, previewId, onFileChange) {
  let input = document.getElementById(inputId);
  let btn = document.getElementById(btnId);
  let preview = document.getElementById(previewId);
  if (!input || !btn || !preview) return;
  btn.addEventListener('click', function () { input.click(); });
  input.addEventListener('change', function (e) {
    let file = e.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      mostrarErroGlobal('Formato não aceito. Use JPG ou PNG.');
      input.value = '';
      return;
    }
    onFileChange(file);
    let reader = new FileReader();
    reader.onload = function (ev) { preview.src = ev.target.result; };
    reader.readAsDataURL(file);
  });
}

async function fazerUpload(file, endpoint) {
  let formData = new FormData();
  formData.append('imagem', file);
  let result = await api(endpoint, {
    method: 'POST',
    body: formData,
    raw: true
  });
  return result.imagem_url;
}

document.addEventListener('DOMContentLoaded', function () {
  configurarLogout();

  configurarUpload('input-foto', 'btn-upload-foto', 'preview-foto', function (file) {
    fotoFile = file;
  });
  configurarUpload('input-capa', 'btn-upload-capa', 'preview-capa', function (file) {
    capaFile = file;
  });

  let btnSenha = document.getElementById('btn-alterar-senha');
  let formSenha = document.getElementById('form-alterar-senha');
  if (btnSenha && formSenha) {
    btnSenha.addEventListener('click', function () {
      formSenha.style.display = formSenha.style.display === 'none' ? 'block' : 'none';
    });
  }

  let btnSalvarSenha = document.getElementById('btn-salvar-senha');
  if (btnSalvarSenha) {
    btnSalvarSenha.addEventListener('click', async function () {
      let novaSenha = document.getElementById('nova-senha').value;
      let confirmarSenha = document.getElementById('confirmar-senha').value;

      if (!novaSenha || !confirmarSenha) {
        mostrarToast('Preencha todos os campos de senha.', 'erro');
        return;
      }
      if (novaSenha.length < 6) {
        mostrarToast('A nova senha deve ter no mínimo 6 caracteres.', 'erro');
        return;
      }
      if (novaSenha !== confirmarSenha) {
        mostrarToast('A nova senha e a confirmação não conferem.', 'erro');
        return;
      }

      btnSalvarSenha.disabled = true;
      btnSalvarSenha.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Alterando...';
      try {
        await api('/auth/password', {
          method: 'PUT',
          body: JSON.stringify({ nova_senha: novaSenha })
        });
        btnSalvarSenha.innerHTML = '<i class="fas fa-check"></i> Senha alterada!';
        btnSalvarSenha.style.backgroundColor = '#2ecc71';
        document.getElementById('nova-senha').value = '';
        document.getElementById('confirmar-senha').value = '';
        mostrarToast('Senha alterada com sucesso!', 'sucesso');
        setTimeout(function () {
          btnSalvarSenha.innerHTML = '<i class="fas fa-check"></i> Salvar senha';
          btnSalvarSenha.style.backgroundColor = '';
          btnSalvarSenha.disabled = false;
          formSenha.style.display = 'none';
        }, 2000);
      } catch (err) {
        mostrarToast(err.message, 'erro');
        btnSalvarSenha.innerHTML = '<i class="fas fa-check"></i> Salvar senha';
        btnSalvarSenha.style.backgroundColor = '';
        btnSalvarSenha.disabled = false;
      }
    });
  }

  let formulario = document.getElementById('form-configuracoes');
  let campoBiografia = document.getElementById('biografia');
  let contadorBio = document.querySelector('.contador-caracteres');

  if (campoBiografia && contadorBio) {
    campoBiografia.addEventListener('input', function () {
      contadorBio.textContent = this.value.length + '/' + this.getAttribute('maxlength');
    });
  }

  carregarDadosArtista();

  if (formulario) {
    formulario.addEventListener('submit', async function (evento) {
      evento.preventDefault();


      if (!isAuthenticated()) {
        mostrarErroGlobal('Faça login para salvar as configurações.');
        return;
      }

      let botaoSalvar = document.querySelector('.footer-acoes .btn-salvar');
      let textoOriginal = botaoSalvar.innerHTML;
      botaoSalvar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
      botaoSalvar.disabled = true;

      try {
        let fotoUrl = null;
        let capaUrl = null;

        if (fotoFile) {
          fotoUrl = await fazerUpload(fotoFile, '/upload/imagem');
          fotoFile = null;
        }
        if (capaFile) {
          capaUrl = await fazerUpload(capaFile, '/upload/imagem');
          capaFile = null;
        }

        let dados = {
          nome_artistico: document.getElementById('nome-artistico').value,
          biografia: document.getElementById('biografia').value,
          chave_pix: document.getElementById('chave-pix').value,
          instagram: document.getElementById('instagram').value,
          whatsapp: document.getElementById('whatsapp').value
        };
        if (fotoUrl) {
          dados.foto_url = fotoUrl;
          await api('/auth/me', {
            method: 'PUT',
            body: JSON.stringify({ avatar_url: fotoUrl })
          });
        }
        if (capaUrl) dados.capa_url = capaUrl;

        await api('/artistas/me', {
          method: 'PUT',
          body: JSON.stringify(dados)
        });

        let [artistaAtualizado, authData] = await Promise.all([
          api('/artistas/me'),
          api('/auth/me')
        ]);
        if (authData && authData.usuario) {
          setUsuarioLogado(authData.usuario);
        }
        localStorage.setItem('artista_perfil', JSON.stringify(artistaAtualizado));
        let sidebarFoto = document.getElementById('sidebar-foto');
        if (sidebarFoto) {
          sidebarFoto.src = artistaAtualizado.foto_url || 'https://via.placeholder.com/150';
          sidebarFoto.alt = artistaAtualizado.nome_artistico || 'Sua foto';
        }
        if (document.querySelector('.nome-mini')) {
          document.querySelector('.nome-mini').textContent = artistaAtualizado.nome_artistico || artistaAtualizado.nome || 'Artista';
        }

        mostrarToast('Alterações salvas com sucesso!', 'sucesso');
        botaoSalvar.innerHTML = textoOriginal;
        botaoSalvar.style.backgroundColor = '';
        botaoSalvar.disabled = false;
      } catch (err) {
        mostrarErroGlobal('Erro ao salvar: ' + err.message);
        botaoSalvar.innerHTML = textoOriginal;
        botaoSalvar.disabled = false;
      }
    });
  }
});

async function carregarDadosArtista() {
  if (!isAuthenticated()) return;
  try {
    let [artista, authData] = await Promise.all([
      api('/artistas/me'),
      api('/auth/me')
    ]);
    if (!artista) return;
    if (authData && authData.usuario) {
      setUsuarioLogado(authData.usuario);
    }
    localStorage.setItem('artista_perfil', JSON.stringify(artista));
    if (document.getElementById('nome-artistico')) document.getElementById('nome-artistico').value = artista.nome_artistico || '';
    if (document.getElementById('biografia')) document.getElementById('biografia').value = artista.biografia || '';
    if (document.getElementById('chave-pix')) document.getElementById('chave-pix').value = artista.chave_pix || '';
    if (document.getElementById('instagram')) document.getElementById('instagram').value = artista.instagram || '';
    if (document.getElementById('whatsapp')) document.getElementById('whatsapp').value = artista.whatsapp || '';
    let sidebarFoto = document.getElementById('sidebar-foto');
    if (sidebarFoto) {
      sidebarFoto.src = artista.foto_url || 'https://via.placeholder.com/150';
      sidebarFoto.alt = artista.nome_artistico || 'Sua foto';
    }
    if (document.querySelector('.nome-mini')) document.querySelector('.nome-mini').textContent = artista.nome_artistico || artista.nome || 'Artista';
    let previewFoto = document.getElementById('preview-foto');
    if (previewFoto) {
      previewFoto.src = artista.foto_url || 'https://via.placeholder.com/150';
      previewFoto.alt = 'Preview da foto de perfil';
    }
    if (document.getElementById('preview-capa')) document.getElementById('preview-capa').src = artista.capa_url || 'https://via.placeholder.com/600x200';
    let bio = document.getElementById('biografia');
    let contador = document.querySelector('.contador-caracteres');
    if (bio && contador) contador.textContent = bio.value.length + '/' + bio.getAttribute('maxlength');
  } catch (err) {
    console.error('Erro ao carregar dados do artista:', err);
  }
}
