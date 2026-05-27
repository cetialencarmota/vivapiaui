function selectProfile(tipo) {
  let cards = document.querySelectorAll('.profile-card');
  cards.forEach(function (card) {
    card.classList.remove('active');
    let radio = card.querySelector('input[type="radio"]');
    if (radio) radio.checked = false;
    if (card.getAttribute('onclick').includes(tipo)) {
      card.classList.add('active');
      if (radio) radio.checked = true;
    }
  });
}
