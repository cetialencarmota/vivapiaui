(function () {
  var perfisPermitidos = window._GUARD_PERFIS || null;

  if (!isAuthenticated()) {
    window.location.href = 'login.html';
    return;
  }

  if (perfisPermitidos) {
    var usuario = getUsuarioLogado();
    if (!usuario || perfisPermitidos.indexOf(usuario.tipo_perfil) === -1) {
      window.location.href = '../index.html';
      return;
    }
  }
})();
