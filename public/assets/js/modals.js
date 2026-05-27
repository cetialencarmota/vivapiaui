function inicializarModalPix() {
  let btnApoiar = document.querySelectorAll('button');
  btnApoiar = Array.from(btnApoiar).filter(function (btn) {
    return btn.textContent.trim().includes('Apoiar');
  });
  if (!btnApoiar.length) return;

  let modal = document.getElementById('modal-pix');
  let artistaId = modal ? modal.dataset.artistaId : null;

  if (!modal) return;

  let btnClose = document.getElementById('close-modal');
  let valueButtons = document.querySelectorAll('.val-btn');
  let btnCopy = document.querySelector('.btn-copy-pix');
  let valorSelecionado = 50;

  btnApoiar.forEach(function (btn) {
    btn.addEventListener('click', function () {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  function fecharModalPix() {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }

  if (btnClose) btnClose.addEventListener('click', fecharModalPix);
  modal.addEventListener('click', function (e) {
    if (e.target === modal) fecharModalPix();
  });

  valueButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!btn.classList.contains('outline')) {
        valueButtons.forEach(function (b) { return b.classList.remove('active'); });
        btn.classList.add('active');
        valorSelecionado = parseInt(btn.textContent.replace('R$', '').trim());
      } else {
        let customVal = prompt('Digite o valor que deseja doar:');
        if (customVal) valorSelecionado = parseFloat(customVal);
      }
    });
  });

  if (btnCopy) {
    btnCopy.addEventListener('click', async function () {
      let artistaId = modal.dataset.artistaId;
      if (!artistaId) { alert('Artista não identificado.'); return; }
      try {
        await api('/doacoes', {
          method: 'POST',
          body: JSON.stringify({ artista_id: parseInt(artistaId), valor: valorSelecionado })
        });
        alert('Doação registrada com sucesso! Obrigado por apoiar a cultura do Piauí.');
        fecharModalPix();
      } catch (err) {
        alert('Erro ao registrar doação: ' + err.message);
      }
    });
  }
}

function preencherDadosUsuario() {
  let usuario = getUsuarioLogado();
  if (!usuario) return;
  let nomeInput = document.getElementById('msg-nome');
  let emailInput = document.getElementById('msg-email');
  if (nomeInput && !nomeInput.value) nomeInput.value = usuario.nome || '';
  if (emailInput && !emailInput.value) emailInput.value = usuario.email || '';
}

function inicializarModalMensagem() {
  let modalMsg = document.getElementById('modal-mensagem');
  let botaoMensagem = document.getElementById('btn-mensagem-artista');
  let btnCloseMsg = document.getElementById('close-modal-msg');
  let btnCancelarMsg = document.getElementById('btn-cancelar-msg');
  let formMsg = document.getElementById('form-mensagem');

  if (!modalMsg || !botaoMensagem) return;

  function fecharModalMsg() {
    modalMsg.classList.remove('active');
    document.body.style.overflow = 'auto';
  }

  botaoMensagem.addEventListener('click', function () {
    preencherDadosUsuario();
    modalMsg.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  if (btnCloseMsg) btnCloseMsg.addEventListener('click', fecharModalMsg);
  if (btnCancelarMsg) btnCancelarMsg.addEventListener('click', fecharModalMsg);
  modalMsg.addEventListener('click', function (e) {
    if (e.target === modalMsg) fecharModalMsg();
  });

  if (formMsg) {
    formMsg.addEventListener('submit', async function (e) {
      e.preventDefault();

      let artistaId = modalMsg.dataset.artistaId;
      if (!artistaId) { alert('Artista não identificado.'); return; }

      let nomeInput = document.getElementById('msg-nome');
      let emailInput = document.getElementById('msg-email');
      let textoInput = document.getElementById('msg-texto');
      let nome = nomeInput.value.trim();
      let email = emailInput.value.trim();
      let mensagem = textoInput.value.trim();

      if (!nome) { alert('Por favor, informe seu nome.'); nomeInput.focus(); return; }
      if (!mensagem) { alert('Por favor, escreva sua mensagem.'); textoInput.focus(); return; }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert('Por favor, informe um e-mail válido.');
        emailInput.focus();
        return;
      }

      let btnSubmit = formMsg.querySelector('.btn-publish');
      let textoOriginal = btnSubmit.innerHTML;
      btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
      btnSubmit.disabled = true;

      try {
        await api('/mensagens', {
          method: 'POST',
          body: JSON.stringify({
            artista_id: parseInt(artistaId),
            nome: nome,
            email: email || null,
            mensagem: mensagem
          })
        });
        btnSubmit.innerHTML = '<i class="fas fa-check"></i> Enviada!';
        setTimeout(function () {
          fecharModalMsg();
          formMsg.reset();
          btnSubmit.innerHTML = textoOriginal;
          btnSubmit.disabled = false;
        }, 1500);
      } catch (err) {
        alert('Erro ao enviar mensagem: ' + err.message);
        btnSubmit.innerHTML = textoOriginal;
        btnSubmit.disabled = false;
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', function () {
  inicializarModalPix();
  inicializarModalMensagem();
});
