const fs = require('fs');
const path = require('path');

const cssDir = path.resolve(__dirname, 'public/assets/css');
const source = path.join(cssDir, 'style.css');

const content = fs.readFileSync(source, 'utf8');
const lines = content.split('\n');

function extract(start, end) {
  return lines.slice(start - 1, end).join('\n');
}

function extractToEnd(start) {
  return lines.slice(start - 1).join('\n');
}

// auth.css (37-386)
fs.writeFileSync(path.join(cssDir, 'auth.css'), extract(37, 386));

// home.css (526-924)
fs.writeFileSync(path.join(cssDir, 'home.css'), extract(526, 924));

// artists.css (958-1207)
fs.writeFileSync(path.join(cssDir, 'artists.css'), extract(958, 1207));

// events.css (1208-1417)
fs.writeFileSync(path.join(cssDir, 'events.css'), extract(1208, 1417));

// about.css (1437-1679)
fs.writeFileSync(path.join(cssDir, 'about.css'), extract(1437, 1679));

// perfil-artista.css (1680-2122)
fs.writeFileSync(path.join(cssDir, 'perfil-artista.css'), extract(1680, 2122));

// modals.css (2169-2471)
fs.writeFileSync(path.join(cssDir, 'modals.css'), extract(2169, 2471));

// dashboard.css (2472+)
fs.writeFileSync(path.join(cssDir, 'dashboard.css'), extractToEnd(2472));

// Rewrite style.css: keep only lines 1-36, 387-525, 925-957, 1418-1436, 2123-2168
const kept = [
  extract(1, 36),
  extract(387, 525),
  extract(925, 957),
  extract(1418, 1436),
  extract(2123, 2168),
].join('\n\n');

fs.writeFileSync(source, kept);

console.log('OK');
