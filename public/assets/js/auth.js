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

document.addEventListener('DOMContentLoaded', function () {
  let loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      let email = document.getElementById('login-email').value;
      let senha = document.getElementById('login-senha').value;
      try {
        let data = await api('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: email, senha: senha })
        });
        setToken(data.token);
        setUsuarioLogado(data.usuario);
        window.location.href = data.usuario.tipo_perfil === 'admin' ? 'painel-admin.html' : '../index.html';
      } catch (err) {
        mostrarToast('Erro ao entrar: ' + err.message, 'erro');
      }
    });
  }

  let signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      let nome = document.getElementById('cadastro-nome').value;
      let email = document.getElementById('cadastro-email').value;
      let senha = document.getElementById('cadastro-senha').value;
      let confirmar = document.getElementById('cadastro-confirmar-senha').value;
      if (senha !== confirmar) {
        mostrarToast('As senhas não conferem.', 'erro');
        return;
      }
      let tipoPerfil = document.querySelector('input[name="perfil"]:checked');
      if (!tipoPerfil) {
        mostrarToast('Selecione um tipo de perfil.', 'erro');
        return;
      }
      try {
        let data = await api('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ nome: nome, email: email, senha: senha, tipo_perfil: tipoPerfil.value })
        });
        setToken(data.token);
        setUsuarioLogado(data.usuario);
        if (data.usuario.tipo_perfil === 'artista') {
          window.location.href = 'dashboard-artista.html';
        } else {
          window.location.href = '../index.html';
        }
      } catch (err) {
        mostrarToast('Erro ao cadastrar: ' + err.message, 'erro');
      }
    });
  }
});
