document.addEventListener('DOMContentLoaded', function () {
  let mapElement = document.getElementById('map');
  if (mapElement) {
    let mapa = L.map('map').setView([-7.5, -42.5], 6);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(mapa);

    fetch('assets/maps/geojs-22-mun.json')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        L.geoJSON(data, {
          style: { color: '#FF7A00', weight: 2, fillOpacity: 0 }
        }).addTo(mapa);
      });

    api('/pontos-culturais?status=Publicado')
      .then(function (pontos) {
        pontos.forEach(function (ponto) {
          if (ponto.latitude && ponto.longitude) {
            let marker = L.marker([ponto.latitude, ponto.longitude]).addTo(mapa);
            let imgHtml = ponto.imagem_url ? '<img src="' + ponto.imagem_url + '" style="width:100%;height:90px;object-fit:cover;border-radius:4px;margin-bottom:6px;">' : '';
            let descHtml = ponto.descricao ? '<p style="font-size:12px;color:#555;margin:4px 0 0;line-height:1.3;">' + ponto.descricao.substring(0, 80) + (ponto.descricao.length > 80 ? '...' : '') + '</p>' : '';
            marker.bindPopup('<div style="width:200px;color:#333;">' + imgHtml + '<strong>' + ponto.nome + '</strong><br><span style="font-size:12px;color:#FF7A00;">' + (ponto.categoria || ponto.tipo) + '</span>' + descHtml + '</div>');
          }
        });
      })
      .catch(function () { });

    api('/eventos?status=Publicado')
      .then(function (eventos) {
        eventos.forEach(function (ev) {
          if (ev.latitude && ev.longitude) {
            let icon = L.icon({
              iconUrl: 'assets/images/marker-evento.svg',
              iconSize: [30, 44],
              iconAnchor: [15, 44],
              popupAnchor: [0, -44]
            });
            let marker = L.marker([ev.latitude, ev.longitude], { icon: icon }).addTo(mapa);
            let imgHtml = ev.imagem_url ? '<img src="' + ev.imagem_url + '" style="width:100%;height:90px;object-fit:cover;border-radius:4px;margin-bottom:6px;">' : '';
            let descHtml = ev.descricao ? '<p style="font-size:12px;color:#555;margin:4px 0 0;line-height:1.3;">' + ev.descricao.substring(0, 80) + (ev.descricao.length > 80 ? '...' : '') + '</p>' : '';
            marker.bindPopup('<div style="width:200px;color:#333;">' + imgHtml + '<strong>' + (ev.titulo || ev.nome) + '</strong><br><span style="font-size:12px;color:#FF7A00;">Evento</span>' + descHtml + '</div>');
          }
        });
      })
      .catch(function () { });
  }
});
