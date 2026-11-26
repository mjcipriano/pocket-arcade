const board = document.querySelector('.board');
const status = document.querySelector('#status');
const reset = document.querySelector('#reset');
let sequence = [], cursor = 0, accepting = false, timers = [];
function later(fn, delay) { timers.push(setTimeout(fn,delay)); }
function input(enabled) {
  accepting=enabled;
  pads.forEach(p => p.disabled=!enabled);
}
const pads = ['✦','☾','☀','◇'].map((mark,i) => {
  const p=document.createElement('button');
  p.textContent=mark;
  p.setAttribute('aria-label',['Star','Moon','Sun','Diamond'][i]);
  p.onclick=() => guess(i);
  board.append(p);
  return p;
});
function next() {
  input(false);
  cursor=0;
  sequence.push(Math.floor(Math.random()*4));
  status.textContent='Watch · Round ' + sequence.length;
  sequence.forEach((i,n) => {
    later(() => pads[i].classList.add('lit'),400+n*650);
    later(() => pads[i].classList.remove('lit'),840+n*650);
  });
  later(() => { timers=[]; input(true); status.textContent='Your turn · Repeat the signal'; },400+sequence.length*650);
}
function guess(i) {
  if (!accepting) return;
  if (i!==sequence[cursor]) {
    input(false);
    status.textContent='Signal lost · Rounds cleared: ' + (sequence.length-1);
    reset.textContent='Play again';
    return;
  }
  cursor++;
  if (cursor===sequence.length) {
    input(false);
    status.textContent='Signal matched!';
    later(next,650);
  } else status.textContent='Matched ' + cursor + ' of ' + sequence.length;
}
reset.onclick=() => {
  timers.forEach(clearTimeout); timers=[]; sequence=[];
  pads.forEach(p => p.classList.remove('lit'));
  reset.textContent='Restart';
  next();
};
input(false);
