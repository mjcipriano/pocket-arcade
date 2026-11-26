const byId = id => document.getElementById(id);
const frame = document.querySelector('iframe');
let games = [];
let limit = 24;
function node(tag, value, className) {
  const el = document.createElement(tag);
  el.textContent = value;
  if (className) el.className = className;
  return el;
}
function renderMenu() {
  const term = byId('search').value.trim().toLowerCase();
  const matches = games.filter(g => [g.title,g.genre,g.description].join(' ').toLowerCase().includes(term));
  const cards = matches.slice(0,limit).map(g => {
    const link = node('a','','card');
    link.href = '#play/' + g.id;
    const art = node('div',g.mark,'art');
    art.style.setProperty('--ink',g.color);
    art.setAttribute('aria-hidden','true');
    const info = node('div','','info');
    info.append(node('small',g.genre),node('h2',g.title),node('p',g.description));
    link.append(art,info);
    return link;
  });
  byId('cards').replaceChildren(...cards);
  byId('more').hidden = matches.length <= limit;
  byId('empty').hidden = !!matches.length;
}
function route() {
  const game = games.find(g => location.hash === '#play/' + g.id);
  byId('error').textContent = location.hash && !game ? 'Game unavailable. Choose another below.' : '';
  byId('library').hidden = !!game;
  byId('player').hidden = !game;
  frame.src = game ? './games/' + game.id + '/index.html' : 'about:blank';
  byId('title').textContent = game?.title || '';
  frame.title = game?.title || 'Active game';
  document.title = game ? game.title + ' · Pocket Arcade' : 'Pocket Arcade';
  window.scrollTo(0,0);
}
byId('search').oninput = () => { limit = 24; renderMenu(); };
byId('more').onclick = () => { limit += 24; renderMenu(); };
try {
  const response = await fetch('./catalog.json');
  if (!response.ok) throw Error();
  games = await response.json();
  renderMenu();
  route();
  window.addEventListener('hashchange',route);
} catch {
  byId('error').textContent = 'Could not load the game library. Refresh to try again.';
}
