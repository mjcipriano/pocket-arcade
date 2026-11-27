import {charts,startRun,tiles,sail,canMove,canDock,cost} from './voyage.mjs';
const $=id=>document.getElementById(id),key='pocket-arcade.tideline.v2';
let landed=[],route=[],records=[0,0,0],banked=false;
try{
 const data=JSON.parse(localStorage.getItem(key));
 if(data&&Array.isArray(data.landed)&&data.landed.length<charts.length&&data.landed.every((v,i)=>Number.isInteger(v)&&v>=charts[i].quota)){
  landed=data.landed;route=Array.isArray(data.route)?data.route:[];banked=data.banked===true;
  if(Array.isArray(data.records))records=charts.map((_,i)=>Number.isInteger(data.records[i])?data.records[i]:0);
 }
}catch{}
const chart=()=>charts[landed.length];
function replay(){
 let run=startRun(chart()),valid=[];
 for(const n of route){
  if(!Number.isInteger(n)||!canMove(chart(),run,n))break;
  run=sail(chart(),run,n);valid.push(n);
 }
 route=valid;
 if(banked&&canDock(chart(),run))run.phase='landed';
 banked=run.phase==='landed';return run;
}
let run=replay();
function save(){try{localStorage.setItem(key,JSON.stringify({route,landed,records,banked}))}catch{}}
function refresh(){if(run.phase==='landed'){banked=true;records[landed.length]=Math.max(records[landed.length],run.pearls)}save();draw()}
function move(n){
 if(!canMove(chart(),run,n))return;
 route.push(n);run=sail(chart(),run,n);refresh();
}
function symbol(t,empty){
 if(t==='H')return ['⚓','Harbor','harbor'];
 if(t==='#')return ['▲','Reef','rock'];
 if(t==='~')return ['≈','Shallows','shallow'];
 if(!empty&&t==='B')return ['⚑','Supply buoy','buoy'];
 if(!empty&&/\d/.test(t))return ['● '+t,t+' pearls','pearl'];
 return ['∿','Open water','water'];
}
function draw(){
 const c=chart(),map=tiles(c),won=run.phase==='landed',failed=run.phase==='stranded',last=landed.length===charts.length-1;
 $('name').textContent=c.name;$('leg').textContent=(landed.length+1)+' / 3';$('haul').textContent=run.pearls+' / '+c.quota;$('time').textContent=run.time;
 $('objective').textContent='Deliver '+c.quota+' pearls to ⚓ harbor. Gold haul: '+c.gold+'.';
 $('extraKey').textContent=map.includes('B')?'≈ Shallows · ⚑ Supply buoy':'▲ Reef';
 $('board').replaceChildren(...Array.from(map,(t,n)=>{
  const boat=n===run.pos,[mark,label,kind]=symbol(t,run.taken.includes(n)),legal=canMove(c,run,n);
  const b=document.createElement('button');b.className='tile '+(boat?'boat':kind)+(legal?' move':'');b.disabled=!legal;
  b.textContent=boat?'⛵':mark;b.setAttribute('aria-label',(boat?'Your boat on ':'')+label+', row '+(1+Math.floor(n/5))+', column '+(1+n%5)+(legal?', costs '+cost(t)+' tide':''));b.onclick=()=>move(n);return b;
 }));
 const dock=canDock(c,run),needed=Math.max(0,c.quota-run.pearls),primary=$('primary');
 primary.hidden=!won&&!dock;primary.textContent=won?(last?'Start another expedition':'Sail to '+charts[landed.length+1].name):'Dock & bank '+run.pearls;
 $('undo').disabled=won||route.length===0;$('retry').hidden=won;
 let heading,detail;
 if(won){
  heading=last?'Expedition complete':run.pearls>=c.gold?'Gold haul landed!':'Cargo delivered!';
  const cargo=[...landed,run.pearls];
  detail=last?cargo.reduce((a,b)=>a+b,0)+' pearls banked across three charts · '+cargo.filter((v,i)=>v>=charts[i].gold).length+'/3 gold hauls.':run.pearls+' pearls safely banked. '+(run.pearls>=c.gold?'You reached the gold target.':'Gold target was '+c.gold+'.');
 }else if(failed){heading='Caught by the tide';detail=(needed?'Still needed '+needed+' more pearls.':'Your hold met quota, but you needed to reach harbor.')+' Undo a move or try this chart again.'}
 else if(dock){heading='Safe in harbor';detail='Bank this haul, or spend your remaining tide chasing '+(run.pearls<c.gold?'gold.':'a bigger catch.')}
 else if(!route.length){heading='Cast off';detail=landed.length?'Shallows cost 2 tide. A buoy restores 3 after you reach it.':'Tap an outlined neighbor. Collect numbered pearls and reach the anchor before your 8 tide runs out.'}
 else{
  const tile=map[run.pos],first=!route.slice(0,-1).includes(run.pos);
  heading=tile==='H'?'Harbor reached':first&&/\d/.test(tile)?'Gathered '+tile+' pearls':first&&tile==='B'?'Buoy supplied +3 tide':tile==='~'?'Crossed shallows · −2 tide':'Sailing';
  detail=needed?'Collect '+needed+' more pearl'+(needed===1?'':'s')+' and reach harbor.':'Quota aboard. Reach the anchor to bank your haul.';
 }
 $('headline').textContent=heading;$('detail').textContent=detail;
 $('record').textContent='Best hauls · '+records.map(v=>v||'—').join(' / ');
}
$('primary').onclick=()=>{
 if(canDock(chart(),run)){run={...run,phase:'landed'};refresh();return}
 if(run.phase!=='landed')return;
 landed=landed.length===charts.length-1?[]:[...landed,run.pearls];
 route=[];banked=false;run=startRun(chart());refresh();
};
$('undo').onclick=()=>{if(!banked&&route.length){route.pop();run=replay();refresh()}};
$('retry').onclick=()=>$('confirm').showModal();$('keep').onclick=()=>$('confirm').close();
$('restart').onclick=()=>{route=[];banked=false;run=startRun(chart());$('confirm').close();refresh()};
$('guide').onclick=()=>$('manual').showModal();$('close').onclick=()=>$('manual').close();
refresh();
