const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

function isAuthenticated() {
  return !!getToken();
}

function setToken(token) {
  localStorage.setItem('token', token);
}

function clearToken() {
  localStorage.removeItem('token');
}

function getUsuarioLogado() {
  const raw = localStorage.getItem('usuario');
  return raw ? JSON.parse(raw) : null;
}

function setUsuarioLogado(usuario) {
  localStorage.setItem('usuario', JSON.stringify(usuario));
}

function clearUsuarioLogado() {
  localStorage.removeItem('usuario');
}

function gerarAvatarFallback(nome, tamanho = 50) {
  const letra = (nome || '?').charAt(0).toUpperCase();
  const cores = ['#4A90D9','#E74C3C','#2ECC71','#F39C12','#9B59B6','#1ABC9C','#E67E22','#3498DB','#E91E63','#00BCD4'];
  const indice = (nome || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % cores.length;
  const cor = cores[indice];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${tamanho}" height="${tamanho}" viewBox="0 0 ${tamanho} ${tamanho}"><rect width="${tamanho}" height="${tamanho}" fill="${cor}" rx="${tamanho * 0.16}"/><text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" fill="white" font-size="${tamanho * 0.48}" font-family="sans-serif" font-weight="bold">${letra}</text></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

async function api(path, options = {}) {
  const token = getToken();
  const headers = {};
  if (token) headers['Authorization'] = 'Bearer ' + token;
  if (!options.raw) headers['Content-Type'] = 'application/json';

  const response = await fetch(API_BASE + path, { ...options, headers });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message = body.error?.message || `Erro ${response.status}`;
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}
