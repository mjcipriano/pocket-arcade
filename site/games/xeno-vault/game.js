import {phenomena} from './sector.mjs';
import {animateField} from './effects.js';
import {art} from './art.js';
import {bets,contact,lines,names,newGame,openPod,pays,species,spin} from './engine.mjs?v=sector1';
const $=id=>document.getElementById(id);
const key='pocket-arcade.xeno-vault.v1';
let state=newGame(),sound=false,turbo=false,busy=false,context;
try{
  const saved=JSON.parse(localStorage.getItem(key));
  if(saved && bets.includes(saved.state?.bet) && saved.state.board?.length===5){
    state=saved.state;sound=saved.sound===true;turbo=saved.turbo===true;
  }
}catch{}
function save(){try{localStorage.setItem(key,JSON.stringify({state,sound,turbo}));}catch{}}
function tone(hz,duration=.1){
  if(!sound || !context || context.state!=='running')return;
  const oscillator=context.createOscillator(),gain=context.createGain();
  oscillator.type='sine';oscillator.frequency.value=hz;gain.gain.value=.045;
  gain.gain.exponentialRampToValueAtTime(.001,context.currentTime+duration);
  oscillator.connect(gain).connect(context.destination);oscillator.start();oscillator.stop(context.currentTime+duration);
}
function wakeAudio(){
  if(!sound)return;
  try{const Audio=window.AudioContext||window.webkitAudioContext;context??=new Audio();context.resume().catch(()=>{});}catch{}
}
function sprite(id){const img=new Image();img.src=art[id];img.alt=names[id];return img;}
const columns=Array.from({length:5},()=>{
  const col=document.createElement('div');col.className='reel';$('reels').append(col);
  for(let i=0;i<3;i++){const cell=document.createElement('div');cell.className='cell';col.append(cell);}
  return col;
});
function drawReel(c,board=state.board){
  Array.from(columns[c].children).forEach((cell,r)=>{
    const won=board===state.board && state.hits.some(h=>h.count>c && lines[h.line][c]===r);
    cell.className='cell'+(won?' win':'')+(state.locked.includes(c*3+r)?' lock':'');
    cell.replaceChildren(sprite(board[c][r]));
  });
}
function choices(){
  const show=state.bonus || !!state.pods;
  $('encounter').hidden=!show;$('choices').replaceChildren();
  if(!show)return;
  $('prompt').textContent=state.pods?'Salvager cache · Pick a pod':'First contact · Choose your ally';
  const descriptions=['4 free spins with 2–5× line wins','3 free spins with stacking wilds','Pick a pod worth 4–20× your bet'];
  species.forEach((alien,i)=>{
    const button=document.createElement('button'),title=document.createElement('b'),description=document.createElement('small');
    title.textContent=state.pods?'Pod '+(i+1):alien;
    description.textContent=state.pods?'Open cache':descriptions[i];
    button.append(sprite(state.pods?7:i),title,description);
    button.onclick=()=>{if(state.pods)openPod(state,i);else contact(state,alien);save();tone(620,.2);render();};
    $('choices').append(button);
  });
}
function render(){
  columns.forEach((_,i)=>drawReel(i));
  for(const id of ['credits','vault','last','best'])$(id).textContent=state[id].toLocaleString();
  $('charge').textContent=state.charge+'/8';$('meter').replaceChildren();
  for(let i=0;i<8;i++){const bar=document.createElement('i');bar.className=i<state.charge?'on':'';$('meter').append(bar);}
  const event=state.event && phenomena[state.event.kind];
  const step=state.sectorStep??0;
  const until=step<2?2-step:3-(step-2)%3;
  $('sectorTitle').textContent=state.mode || event?.name || 'Outer orbit';
  $('sectorNote').textContent=state.free?'Bonus flight':('Next anomaly in '+until+(until===1?' spin':' spins'));
  $('status').textContent=state.message;
  $('bet').querySelector('b').textContent=state.bet;
  $('bet').disabled=busy || !!(state.free||state.bonus||state.pods);
  $('spin').disabled=busy || !!(state.bonus||state.pods);
  $('spin').textContent=state.free?state.mode+' spin · '+state.free+' left':state.credits<state.bet?'Refill free credits':'Spin reels';
  $('sound').textContent=sound?'Sound on':'Sound off';$('turbo').textContent=turbo?'Turbo on':'Turbo off';
  $('sound').setAttribute('aria-pressed',sound);$('turbo').setAttribute('aria-pressed',turbo);choices();
}
let flareTimer;
function clearFlare(){
  clearTimeout(flareTimer);$('flare').hidden=true;
}
function celebrate(){
  const jackpot=state.board.flat().filter(symbol=>symbol===7).length>=4;
  if(!jackpot && state.last<state.bet*10)return;
  const label=jackpot?'VAULT OPEN':state.last>=state.bet*30?'SUPERNOVA WIN':'BIG WIN';
  $('flare').textContent=label+'  +'+state.last.toLocaleString();
  $('flare').hidden=false;
  flareTimer=setTimeout(clearFlare,1450);
}
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
$('spin').onclick=async()=>{
  if(busy || state.bonus || state.pods)return;
  clearFlare();wakeAudio();
  if(!state.free && state.credits<state.bet){state.credits+=1000;state.message='Refilled 1,000 free credits.';save();render();return;}
  const flight=state.free?state.mode:null;
  if(!spin(state))return;
  busy=true;save();$('spin').disabled=true;$('bet').disabled=true;$('status').textContent='Scanning the sector…';
  const quick=turbo || matchMedia('(prefers-reduced-motion: reduce)').matches;
  const viewport=document.querySelector('.viewport');
  viewport.classList.remove('active');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const strips=columns.map(col=>{
    col.classList.remove('landed');col.classList.add('roll');
    const strip=document.createElement('div');strip.className='strip';strip.setAttribute('aria-hidden','true');
    if(!quick){
      for(let n=0;n<5;n++){
        const tile=document.createElement('div');tile.append(sprite(Math.floor(Math.random()*8)));strip.append(tile);
      }
      col.append(strip);
    }
    return strip;
  });
  for(const [c,col] of columns.entries()){
    await delay(quick?24:c===0?230:135);strips[c].remove();drawReel(c,state.beforeEvent??state.board);col.classList.remove('roll');col.classList.add('landed');tone(220+c*50,.06);
  }
  const event=state.event;
  if(event){
    const info=phenomena[event.kind];
    document.body.style.setProperty('--event-color',info.color);viewport.classList.add('active');
    $('sectorTitle').textContent=info.name;$('sectorNote').textContent='Sector anomaly';
    $('status').textContent=info.rule;
    tone({meteor:150,tractor:370,wormhole:490,solar:730}[event.kind],.35);
    if(!reduced)await animateField($('fx'),event.kind,event.targets,info.color,turbo?280:1050);
    columns.forEach((_,c)=>drawReel(c));
    event.targets.forEach(pos=>columns[Math.floor(pos/3)].children[pos%3].classList.add('affected'));
    if(!quick)await delay(330);
  }
  if(flight && !reduced){
    const wilds=state.board.flat().flatMap((id,pos)=>id===6?[pos]:[]);
    await animateField($('fx'),flight,wilds,flight==='Oracle'?'#c89aff':'#71f4d3',turbo?160:640);
  }
  if(state.hits.length && !reduced){
    const paths=state.hits.map(hit=>lines[hit.line].slice(0,hit.count).map((row,c)=>c*3+row));
    await animateField($('fx'),'line',[],'#ffe697',turbo?150:550,paths);
  }
  busy=false;render();celebrate();if(state.bonus || state.last)tone(state.bonus?820:660,.24);
};
$('bet').onclick=()=>{state.bet=bets[(bets.indexOf(state.bet)+1)%bets.length];save();render();};
$('sound').onclick=()=>{sound=!sound;wakeAudio();save();$('sound').textContent=sound?'Sound on':'Sound off';$('sound').setAttribute('aria-pressed',sound);};
$('turbo').onclick=()=>{turbo=!turbo;save();$('turbo').textContent=turbo?'Turbo on':'Turbo off';$('turbo').setAttribute('aria-pressed',turbo);};
for(const info of Object.values(phenomena)){
  const item=document.createElement('li');item.textContent=info.name+' — '+info.rule;$('eventRules').append(item);
}
const manual=document.querySelector('dialog');
$('guide').onclick=()=>manual.showModal();$('close').onclick=()=>manual.close();
for(const line of lines){
  const shape=document.createElement('span');
  for(let r=0;r<3;r++)for(let c=0;c<5;c++){const dot=document.createElement('i');if(line[c]===r)dot.className='on';shape.append(dot);}
  $('lines').append(shape);
}
pays.forEach((pay,id)=>{
  const row=document.querySelector('tbody').insertRow();const label=row.insertCell(),img=sprite(id);img.alt='';
  label.append(img,names[id]);pay.forEach(value=>row.insertCell().textContent=value);
});
render();
