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
