function mostrarToast(mensagem, tipo) {
  tipo = tipo || 'erro';
  var container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  var toast = document.createElement('div');
  toast.className = 'toast toast-' + tipo;

  var iconMap = { erro: 'fa-exclamation-circle', sucesso: 'fa-check-circle', info: 'fa-info-circle' };
  toast.innerHTML =
    '<div class="toast-icon"><i class="fas ' + (iconMap[tipo] || iconMap.info) + '"></i></div>' +
    '<span class="toast-message">' + mensagem + '</span>' +
    '<button class="toast-close">&times;</button>';

  toast.querySelector('.toast-close').addEventListener('click', function () {
    fecharToast(toast);
  });

  container.appendChild(toast);
  setTimeout(function () { toast.classList.add('toast-show'); }, 10);

  var timeout = tipo === 'sucesso' ? 3000 : 5000;
  setTimeout(function () { fecharToast(toast); }, timeout);
}

function fecharToast(toast) {
  if (!toast || toast.classList.contains('toast-hiding')) return;
  toast.classList.add('toast-hiding');
  toast.classList.remove('toast-show');
  setTimeout(function () {
    if (toast.parentNode) toast.parentNode.removeChild(toast);
  }, 300);
}
