document.addEventListener('DOMContentLoaded', async function () {
  let params = new URLSearchParams(window.location.search);
  let artistaId = params.get('id');
  if (!artistaId) {
    document.querySelector('.breadcrumb span').textContent = 'Artista não encontrado';
    return;
  }

  /* Attach click handler immediately — before the async API call — to avoid a race
     condition where the button is visible but has no listener yet. */
  let btnFav = document.getElementById('btn-favoritar-artista');
  if (btnFav) {
    btnFav.addEventListener('click', async function () {
      let id = Number(btnFav.dataset.artistaId);
      if (!id) return;
      let resultado = await toggleFavoritar(id, btnFav);
      if (resultado !== undefined) {
        btnFav.innerHTML = resultado ? '<i class="fas fa-heart"></i> Favoritado' : '<i class="far fa-heart"></i> Favoritar';
      }
    });
  }

  try {
    let data = await api('/artistas/' + artistaId);
    if (!data || data.error) {
      document.querySelector('.breadcrumb span').textContent = 'Artista não encontrado';
      return;
    }

    let nome = data.nome_artistico || data.nome;
    let foto = data.foto_url || data.avatar_url;

    /* Breadcrumb */
    let bcSpan = document.querySelector('.breadcrumb span');
    if (bcSpan) bcSpan.textContent = nome;

    /* Hero background */
    let heroBg = document.querySelector('.profile-hero-bg');
    if (heroBg && data.capa_url) {
      heroBg.style.backgroundImage = 'linear-gradient(rgba(10,11,20,0.7),rgba(10,11,20,0.9)), url("' + data.capa_url + '")';
    }

    /* Profile pic */
    let pic = document.querySelector('.profile-pic');
    if (pic) {
      if (foto) pic.src = foto;
      pic.alt = nome;
    }

    /* Name */
    let h1 = document.querySelector('.artist-info h1');
    if (h1) h1.textContent = nome;

    /* Title */
    let title = document.querySelector('.artist-title');
    if (title) title.textContent = data.categoria_artistica || 'Artista Piauiense';

    /* Location */
    let loc = document.querySelector('.artist-location');
    if (loc) loc.innerHTML = '<i class="fas fa-map-marker-alt"></i> ' + (data.localizacao || 'Piauí');

    /* Social links */
    let socialContainer = document.querySelector('.social-links');
    if (socialContainer) {
      socialContainer.innerHTML = '';
      if (data.instagram) {
        let a = document.createElement('a');
        a.href = 'https://instagram.com/' + data.instagram.replace('@', '');
        a.target = '_blank';
        a.innerHTML = '<i class="fab fa-instagram"></i>';
        socialContainer.appendChild(a);
      }
      if (data.whatsapp) {
        let a = document.createElement('a');
        a.href = 'https://wa.me/' + data.whatsapp.replace(/\D/g, '');
        a.target = '_blank';
        a.innerHTML = '<i class="fab fa-whatsapp"></i>';
        socialContainer.appendChild(a);
      }
      if (data.portfolio_url) {
        let a = document.createElement('a');
        a.href = data.portfolio_url;
        a.target = '_blank';
        a.innerHTML = '<i class="fas fa-globe"></i>';
        socialContainer.appendChild(a);
      }
    }

    /* About card */
    let aboutCard = document.querySelector('.about-card');
    if (aboutCard) {
      aboutCard.innerHTML = '<h3><i class="fas fa-sun"></i> Sobre ' + (data.nome_artistico || 'o Artista') + '</h3>';
      if (data.biografia) {
        let paras = data.biografia.split('\n\n');
        paras.forEach(function (p) {
          if (p.trim()) {
            let para = document.createElement('p');
            para.textContent = p.trim();
            aboutCard.appendChild(para);
          }
        });
      } else {
        let p = document.createElement('p');
        p.textContent = 'Este artista ainda não cadastrou uma biografia.';
        p.style.color = '#888';
        aboutCard.appendChild(p);
      }
    }

    /* Support card */
    let supportTitle = document.querySelector('.support-card .support-text h4');
    if (supportTitle) supportTitle.textContent = 'Apoie o trabalho de ' + nome;
    let supportBtn = document.querySelector('.support-card .btn-primary');
    if (supportBtn) supportBtn.textContent = 'Apoiar Artista';

    /* Artist details */
    let detailItems = document.querySelectorAll('.detail-item');
    if (detailItems.length >= 1) {
      if (data.tempo_atuacao) {
        detailItems[0].style.display = '';
        detailItems[0].querySelector('.detail-value').textContent = data.tempo_atuacao;
      } else {
        detailItems[0].style.display = 'none';
      }
    }
    if (detailItems.length >= 3) {
      detailItems[2].style.display = 'none';
    }

    /* Works grid */
    let worksGrid = document.querySelector('.works-grid');
    if (worksGrid) {
      worksGrid.innerHTML = '';
      let obras = data.obras || [];
      obras.forEach(function (obra) {
        let card = document.createElement('div');
        card.className = 'work-card';
        card.dataset.id = obra.id;

        let imgHtml;
        if (obra.imagem_url) {
          imgHtml = '<img src="' + obra.imagem_url + '" alt="' + (obra.titulo || 'Obra') + '" loading="lazy">';
        } else {
          let letra = (obra.titulo || 'O').charAt(0).toUpperCase();
          imgHtml = '<div class="work-card-placeholder">' + letra + '</div>';
        }

        card.innerHTML =
          '<div class="work-card-img">' + imgHtml + '</div>' +
          '<div class="work-card-body">' +
            '<h4 class="work-card-titulo">' + (obra.titulo || '') + '</h4>' +
            '<p class="work-card-descricao">' + (obra.descricao || '') + '</p>' +
          '</div>';

        card.addEventListener('click', function () {
          abrirModalObra(obra);
        });
        worksGrid.appendChild(card);
      });
    }

    /* Hide works section if no obras */
    let worksHeader = document.querySelector('.profile-content > .section-header:first-of-type');
    if (worksHeader && (!data.obras || data.obras.length === 0)) {
      worksHeader.style.display = 'none';
      if (worksGrid) worksGrid.style.display = 'none';
    }

    /* Hide events section (no artist filter endpoint yet) */
    let eventsHeader = document.querySelector('.profile-content > .section-header.mt-4');
    let eventsRow = document.querySelector('.events-row');
    if (eventsHeader) eventsHeader.style.display = 'none';
    if (eventsRow) eventsRow.style.display = 'none';

    /* Modals - update name */
    let modalMsgNome = document.querySelector('#modal-mensagem .modal-header h2 span');
    if (modalMsgNome) modalMsgNome.textContent = nome;
    let modalPixNome = document.querySelector('#modal-pix .modal-header h2 span');
    if (modalPixNome) modalPixNome.textContent = nome;
    let modalMsgNome2 = document.querySelector('#modal-mensagem .modal-header p');
    if (modalMsgNome2) modalMsgNome2.textContent = 'Preencha os campos abaixo para entrar em contato.';

    /* Painel do Artista + ocultar apoio no próprio perfil */
    let usuarioLogado = getUsuarioLogado();
    let isProprioArtista = usuarioLogado && data.usuario_id == usuarioLogado.id;

    let painelCard = document.querySelector('.painel-artista-card');
    if (painelCard) {
      painelCard.style.display = isProprioArtista ? '' : 'none';
    }

    if (isProprioArtista) {
      let heroBtn = document.querySelector('.profile-hero-actions .btn-primary');
      if (heroBtn) heroBtn.style.display = 'none';

      let btnMsg = document.getElementById('btn-mensagem-artista');
      if (btnMsg) btnMsg.style.display = 'none';

      let btnFav = document.getElementById('btn-favoritar-artista');
      if (btnFav) btnFav.style.display = 'none';

      let supportCards = document.querySelectorAll('.support-card:not(.painel-artista-card)');
      supportCards.forEach(function (c) { c.style.display = 'none'; });
    }



    /* Sync favorite button state after artist data loads */
    if (btnFav) {
      btnFav.dataset.artistaId = artistaId;
      if (isAuthenticated()) {
        await carregarIdsFavoritos();
        let fav = isFavoritado(Number(artistaId));
        alternarIconeHeart(btnFav, fav);
        btnFav.innerHTML = fav ? '<i class="fas fa-heart"></i> Favoritado' : '<i class="far fa-heart"></i> Favoritar';
      }
    }

    /* Set artista_id on modals */
    let modalPix = document.getElementById('modal-pix');
    if (modalPix) modalPix.dataset.artistaId = artistaId;
    let modalMsg = document.getElementById('modal-mensagem');
    if (modalMsg) modalMsg.dataset.artistaId = artistaId;

    window._artistaData = data;

  } catch (err) {
    console.error('Erro ao carregar perfil do artista:', err);
    let bcSpan = document.querySelector('.breadcrumb span');
    if (bcSpan) bcSpan.textContent = 'Erro ao carregar';
  }
});

/* Modal de detalhes da obra */
function abrirModalObra(obra) {
  var modal = document.getElementById('modal-obra-detalhe');
  if (!modal) return;

  document.getElementById('modalObraImg').src = obra.imagem_url || 'https://via.placeholder.com/600x600?text=Sem+Imagem';
  document.getElementById('modalObraImg').alt = obra.titulo || 'Obra';
  document.getElementById('modalObraTitulo').textContent = obra.titulo || '';
  document.getElementById('modalObraCategoria').textContent = obra.categoria || '';
  document.getElementById('modalObraDescricao').textContent = obra.descricao || '';

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function fecharModalObra() {
  var modal = document.getElementById('modal-obra-detalhe');
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', function () {
  var btnClose = document.getElementById('close-modal-obra');
  if (btnClose) {
    btnClose.addEventListener('click', fecharModalObra);
  }

  var modalObra = document.getElementById('modal-obra-detalhe');
  if (modalObra) {
    modalObra.addEventListener('click', function (e) {
      if (e.target === modalObra) fecharModalObra();
    });
  }
});
