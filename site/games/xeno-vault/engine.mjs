import {sectorEvent,phenomena} from './sector.mjs';
export const species=['Oracle','Warden','Salvager'];
export const names=['Oracle','Warden','Salvager','Moon','Crystal','Beacon','Wild','Portal'];
export const pays=[[6,15,50],[5,12,40],[4,10,35],[3,8,22],[3,7,20],[2,6,18]];
export const lines=[[0,0,0,0,0],[1,1,1,1,1],[2,2,2,2,2],[0,1,2,1,0],[2,1,0,1,2]];
export const bets=[5,10,25,50];
const bag=[0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,3,4,4,4,4,4,5,5,5,5,5,6,7];
export const pick=(items,rng=Math.random)=>items[Math.floor(rng()*items.length)];
export function newGame(){
  return {credits:1000,bet:10,charge:0,free:0,mode:'',locked:[],bonus:false,pods:null,vault:250,best:0,last:0,
    board:Array.from({length:5},(_,c)=>Array.from({length:3},(_,r)=>(c+r*2)%6)),hits:[],message:'Five reels online. Ready to spin.'};
}
export function score(board,bet,factor=1){
  const hits=[];
  for(const [index,line] of lines.entries()){
    const symbols=line.map((row,col)=>board[col][row]);
    const id=symbols.find(s=>s!==6) ?? 0;
    if(id>=6) continue;
    let count=0;
    for(const symbol of symbols){if(symbol!==id && symbol!==6) break;count++;}
    if(count>=3) hits.push({line:index,count,amount:pays[id][count-3]*bet/5*factor});
  }
  return hits;
}
export function spin(s,rng=Math.random){
  if(s.bonus || s.pods || (!s.free && s.credits<s.bet)) return false;
  const free=s.free>0, mode=free?s.mode:'';
  if(free) s.free--; else {s.credits-=s.bet;s.vault+=s.bet/5;}
  s.board=Array.from({length:5},()=>Array.from({length:3},()=>pick(bag,rng)));
  if(mode==='Warden'){
    for(const pos of s.locked) s.board[Math.floor(pos/3)][pos%3]=6;
    const empty=Array.from({length:15},(_,i)=>i).filter(i=>!s.locked.includes(i));
    const pos=pick(empty,rng);
    s.locked.push(pos);s.board[Math.floor(pos/3)][pos%3]=6;
  }
  const factor=mode==='Oracle'?pick([2,3,5],rng):1;
  const original=s.board.map(reel=>[...reel]);
  s.event=free?null:sectorEvent(s,rng);
  s.beforeEvent=s.event?original:null;
  s.hits=score(s.board,s.bet,factor*(s.event?.factor??1));
  s.last=s.hits.reduce((sum,h)=>sum+h.amount,s.event?.credits??0);
  const portals=s.board.flat().filter(id=>id===7).length;
  const jackpot=portals>=4;
  if(jackpot){s.last+=s.vault;s.vault=250;}
  s.credits+=s.last;s.best=Math.max(s.best,s.last);
  if(!free){s.charge++;if(portals>=3 || s.charge>=8){s.charge=0;s.bonus=true;}}
  const details=s.hits.map(h=>'L'+(h.line+1)+' +'+h.amount).join(' · ');
  s.message=[s.event?phenomena[s.event.kind].name:'',jackpot?'Vault opened!':'',mode==='Oracle'?'Oracle ×'+factor:'',s.last?'Won '+s.last+' credits':'No line win',details].filter(Boolean).join(' · ');
  if(!s.free){s.mode='';s.locked=[];}
  return true;
}
export function contact(s,alien,rng=Math.random){
  if(!s.bonus || !species.includes(alien)) return;
  s.bonus=false;s.mode=alien;
  if(alien==='Salvager'){
    const pool=[4,6,8,12,20];s.pods=[];
    while(s.pods.length<3){const i=Math.floor(rng()*pool.length);s.pods.push(pool.splice(i,1)[0]);}
    s.message='Pick one salvage pod.';
  } else {
    s.free=alien==='Oracle'?4:3;s.locked=[];s.message=alien+' online · '+s.free+' free spins';
  }
}
export function openPod(s,i){
  if(!s.pods || !Number.isInteger(i) || i<0 || i>=3) return;
  const factor=s.pods[i];s.last=s.bet*factor;s.credits+=s.last;s.best=Math.max(s.best,s.last);
  s.message='Salvage pod ×'+factor+' · Won '+s.last+' credits';s.pods=null;s.mode='';s.hits=[];
}
