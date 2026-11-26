const board = document.querySelector('.board');
let values, position, visited, score;
function adjacent(i) {
  return Math.abs(i%4-position%4) + Math.abs(Math.floor(i/4)-Math.floor(position/4)) === 1;
}
function draw() {
  const moves = 7-visited.size;
  const options = values.map((_,i) => moves > 0 && adjacent(i) && !visited.has(i));
  const done = !options.includes(true);
  document.querySelector('#status').textContent = done ? 'Tide ended · ' + score + ' pearls collected' : score + ' pearls · ' + moves + ' moves left';
  board.replaceChildren(...values.map((value,i) => {
    const cell = document.createElement('button');
    cell.disabled = !options[i];
    const current = i === position;
    cell.textContent = current ? '⚓' : visited.has(i) ? '·' : value;
    cell.className = current ? 'current' : '';
    cell.setAttribute('aria-label',current ? 'Your boat' : visited.has(i) ? 'Visited tile' : value + ' pearls, row ' + (1+Math.floor(i/4)) + ', column ' + (1+i%4));
    cell.onclick = () => { position=i; visited.add(i); score+=value; draw(); };
    return cell;
  }));
}
function start() {
  values = Array.from({length:16},() => 1+Math.floor(Math.random()*9));
  position=12; visited=new Set([position]); score=0; draw();
}
document.querySelector('#reset').onclick=start;
start();
