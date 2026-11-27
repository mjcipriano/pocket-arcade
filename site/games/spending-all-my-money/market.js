
const rows = [
['🔦','Flashlight',16],['🪑','Folding chair',32,2],['🧊','Picnic cooler',48,2],
['☕','Coffee mug',12],['🫘','Coffee beans',18],['🫖','Gooseneck kettle',42,2],
['🧤','Garden gloves',14],['🪴','Basil plant',20],['🚿','Watering can',24],
['🎧','Headphones',56],['📻','Pocket radio',36],['🎙️','Microphone',44],
['🎲','Dice set',8],['🃏','Playing cards',10],['♟️','Chess set',28,2],
['🖌️','Paintbrush kit',16],['🎨','Watercolors',26],['📓','Sketchbook',12],
['🍳','Cast iron skillet',50,2],['🧂','Pepper mill',22],['🥄','Wooden spoons',10],
['🕶️','Sunglasses',18],['🏖️','Beach umbrella',60,2],['🩴','Flip-flops',14],
['🛠️','Tool kit',64,2],['📏','Tape measure',12],['🔩','Jar of bolts',8],
['📸','Film camera',76],['🖼️','Picture frame',14],['🎞️','Film roll',18],
['🧣','Wool scarf',24],['🧢','Ball cap',16],['🧦','Lucky socks',10],
['📚','Mystery novels',18,2],['🕯️','Reading candle',14],['💡','Desk lamp',36,2]
];
const collections=['Ready for a Camping Trip','Coffee Break','Kitchen Garden','Radio Hour','Game Night','Art Afternoon','Sunday Supper','Beach Day','Garage Workshop','Photo Walk','Cozy Weekend','Reading Nook'];
const tiers=[['Suitcase',6],['Closet',16,100],['Garage',40,250],['Warehouse',100,600],['Freight depot',160,1800],['Distribution hall',240,4500],['Bonded vault',360,11000],['Collector’s estate',540,26000]];
const key='pocketArcade.spending.v1', $=id=>document.getElementById(id);
const jobs=[['Errand runner',20,0],['Shop assistant',35,70],['Shift lead',55,150],['Store manager',85,300],['Market director',130,600]];
const departments=['Outdoor gear','Coffee','Gardening','Audio','Tabletop','Art supplies','Kitchenware','Beachwear','Hardware','Photography','Clothing','Books'];
extraDepartments.forEach(([set,dept,products])=>{collections.push(set);departments.push(dept);rows.push(...products)});
const group=id=>Math.floor(id/3);
const albums=collections.map((name,g)=>({name,needs:[0,1,2].map(j=>({id:g*3+j})),bonus:Math.ceil(rows.slice(g*3,g*3+3).reduce((sum,r)=>sum+r[2],0)/10)*5}));
for(const [name,pieces,bonus] of [
 ['Rain on Fleet Street',[[36,2],[37,3],[38,0]],185],['Gallery Noir',[[39,0],[40,1],[41,0]],225],
 ['Centre Court Whites',[[51,1],[52,1],[53,4]],180],['Plum Overnight',[[48,5],[49,5],[50,1]],180],
 ['Forest Ranger',[[60,2],[62,2],[38,3]],200],['Cherry on Top',[[31,7],[40,7],[52,0]],150],
 ['Golden Hour',[[27,6],[21,6],[48,3]],215],['Ocean Commute',[[42,4],[43,1],[44,4]],300],
 ['Archival Audio',[[54,null,2],[56,null,2],[9,null,2]],400]
])albums.push({name,needs:pieces.map(([id,color,min])=>({id,color,min})),bonus});
const originalCount=rows.length;
collectorReleases.forEach(([name,dept,requires,products])=>{
 const first=rows.length;rows.push(...products);collections.push(name);departments.push(dept);
 albums.push({name,requires,needs:products.map((_,j)=>({id:first+j})),bonus:products.reduce((sum,r)=>sum+r[2],0)});
});
const fiveMinutes=300000,boardInterval=3*fiveMinutes;
const clockSlot=(now=Date.now())=>Math.floor(now/fiveMinutes);
const boardSlot=(now=Date.now())=>Math.floor(now/boardInterval);
const localTime=t=>new Date(t).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});
function rareOffset(id){return (id-originalCount)%3}
function onShelf(id,slot=clockSlot()){return id<originalCount||rareOffset(id)===slot%3}
function nextOpening(id,slot=clockSlot()){return (slot+(rareOffset(id)-slot%3+3)%3)*fiveMinutes}
const rotatingThemes=[
 ['Sunday listening session',[54,56,72]],['Garden party',[69,70,8]],['Tea tasting',[75,76,3]],
 ['Street photography',[67,29,27]],['Repair café',[78,80,24]],['Map room',[81,82,35]]
];
function guestSet(slot){const [name,ids]=rotatingThemes[slot%rotatingThemes.length];return {name,needs:ids.map(id=>({id})),bonus:150+ids.reduce((n,id)=>n+rows[id][2],0)}}
const fading=new Set([4,7,29,34,66,69,75]);
const collectible=new Set([27,54,67,72,78,81]);
function vintage(x,now=Date.now()){return !fading.has(x.id)&&(collectible.has(x.id)||x.grade===3)&&now-x.boughtAt>=5400000}
function heldGrade(x){return Math.max(x.grade??0,vintage(x)?2:0)}
function resale(x,now=Date.now()){
 const age=Math.max(0,now-x.boughtAt),base=Math.floor(x.paid/2);
 if(fading.has(x.id)){const steps=Math.min(8,Math.floor(age/600000));return {value:Math.floor(base*(10-steps)/10),label:'Perishable · offer falls every 10 min, down to 20% of the opening offer.'}}
 if(collectible.has(x.id)||x.grade===3){const steps=Math.min(12,Math.floor(age/900000));return {value:Math.floor(x.paid*(5+steps)/10),label:(steps>=6?'Vintage · ':'Collector piece · ')+'offer rises every 15 min, up to 170% of what you paid.'}}
 return {value:base,label:'Everyday resale · stable offer.'}
}
function difference(paid,value){const delta=value-paid;return delta===0?'break even':'$'+Math.abs(delta)+' '+(delta>0?'profit':'loss')}
const fresh=()=>({job:0,rewarded:[],sound:false,cash:80,spent:0,tier:0,bag:[],sets:[],start:Date.now(),delivery:0,seed:Math.floor(Math.random()*4294967296),advanced:false,shifts:0,sort:'packed',order:0,ready:false,guestReady:null,guestClaimed:null,club:null});
let state=fresh();
try{const s=JSON.parse(localStorage.getItem(key));if(s&&Array.isArray(s.bag)&&tiers[s.tier])Object.assign(state,s)}catch{}
for(const item of state.bag)if(!Number.isFinite(item.boughtAt))item.boughtAt=Date.now();
const ranks=[
 ['Browser',0,0],['Regular',15,10],['Insider',40,20],['Curator',85,35],['Market patron',160,50]
];
const contacts=[
 {key:'dealer',name:'Dealer introduction',description:'Save another 20% on your next 3 purchases, including sale items.',rank:0,cost:6,uses:3},
 {key:'broker',name:'Private buyer',description:'Earn 50% more on your next 2 sales.',rank:1,cost:10,uses:2},
 {key:'preview',name:'Backroom invitation',description:'Buy 1 timed release from the upcoming shelf before it opens. Regular shelf purchases keep the invitation.',rank:2,cost:12,uses:1}
];
function enroll(){
 if(state.club)return;
 const seen=[...new Set(state.bag.map(x=>x.id))];
 const total=seen.length*2+state.rewarded.length*10+state.order*8+(state.guestClaimed==null?0:12)+state.shifts*2;
 state.club={rank:0,points:total,lifetime:total,seen,dealer:0,broker:0,preview:0};
}
enroll();
function earn(points){state.club.points+=points;state.club.lifetime+=points}
function claimPoints(i){return i===-2?12:i===-1?8:10}
function purse(a){return Math.round(a.bonus*(1+ranks[state.club.rank][2]/100))}
function early(id,slot=clockSlot()){return state.club.preview>0&&!onShelf(id,slot)&&onShelf(id,slot+1)}
function netOffer(x){const offer=resale(x);return state.club.broker?{value:Math.floor(offer.value*1.5),label:offer.label+' Private buyer adds 50%.'}:offer}
function promoteRank(){
 const next=ranks[state.club.rank+1];if(!next||state.club.points<next[1])return;
 state.club.points-=next[1];state.club.rank++;clubUpdate('Promoted to '+next[0]+'. Your collection cash bonus is now '+next[2]+'%.');
}
function hire(c){
 const club=state.club;if(club.rank<c.rank||club.points<c.cost||club[c.key])return;
 club.points-=c.cost;club[c.key]=c.uses;clubUpdate(c.name+' active. '+c.description);
}
function clubUpdate(message){save();catalog();render();paintClub();$('clubMessage').textContent=message;chime('upgrade')}
function paintClub(){
 const c=state.club,[title,,bonus]=ranks[c.rank],next=ranks[c.rank+1];
 $('clubTitle').textContent=title;$('standing').textContent=c.points+' points available · '+c.lifetime+' earned';
 $('standingPerk').textContent=bonus?'Permanent collection cash bonus +'+bonus+'%.':'Earn points by discovering products and completing collections or Advanced shifts.';
 const btn=$('rankUp');btn.hidden=!next;
 if(next){btn.disabled=c.points<next[1];btn.textContent='Become '+next[0]+' · '+next[1]+' pts';$('nextPerk').textContent='Next rank pays +'+next[2]+'% collection cash'+(c.rank<2?' and unlocks '+contacts[c.rank+1].name:'')+'.'}else $('nextPerk').textContent='Highest collector status reached.';
 $('contacts').replaceChildren(...contacts.map(contact=>{
  const row=document.createElement('article'),title=document.createElement('strong'),detail=document.createElement('small'),button=document.createElement('button');
  title.textContent=contact.name;detail.textContent=contact.description;
  const active=c[contact.key],locked=c.rank<contact.rank;
  button.textContent=active?active+' uses left':locked?'Unlock at '+ranks[contact.rank][0]:'Hire · '+contact.cost+' pts';
  button.disabled=Boolean(active||locked||c.points<contact.cost);button.onclick=()=>hire(contact);row.append(title,detail,button);return row;
 }));
}
$('clubOpen').onclick=()=>{paintClub();$('clubMessage').textContent='';$('clubDialog').showModal()};
$('rankUp').onclick=promoteRank;$('clubClose').onclick=()=>$('clubDialog').close();
const variant=id=>{const v=lot(id,state.delivery,state.seed);if(id>=originalCount)v.grade=Math.max(2,v.grade);return v};
let lastSlot=clockSlot();
function syncClock(){const slot=clockSlot();if(slot===lastSlot)return;lastSlot=slot;unlock();save();catalog();render()}

const regular=id=>Math.round(rows[id][2]*[1,1.15,1.45,2][variant(id).grade]);
const itemName=x=>(x.color==null?'Original':dyeNames[x.color])+' '+rows[x.id][1];
function orderSet(){
 const start=lot(0,state.order,state.seed).color+state.order*7;
 const needs=[0,1,2].map((j)=>{const id=(start+j*17)%originalCount;return {id,color:lot(id,state.order,state.seed^849).color}});
 return {name:'Buyer’s request #'+(state.order+1),needs,bonus:120+needs.reduce((sum,r)=>sum+rows[r.id][2],0)};
}
function owns(r){return state.bag.some(x=>x.id===r.id&&(r.color==null||x.color===r.color)&&heldGrade(x)>=(r.min??0))}
function unlock(){let added=0;albums.forEach((a,i)=>{if(state.rewarded.length>=(a.requires||0)&&!state.sets.includes(i)&&a.needs.every(owns)){state.sets.push(i);added++}});if(!state.ready&&orderSet().needs.every(owns)){state.ready=true;added++}const slot=boardSlot();if(state.rewarded.length>=2&&state.guestReady==null&&state.guestClaimed!==slot&&guestSet(slot).needs.every(owns)){state.guestReady=slot;added++}return added}
function claim(i){
 const guest=i===-2,order=i===-1;
 if(guest&&state.guestReady==null)return;
 const a=guest?guestSet(state.guestReady):order?orderSet():albums[i];
 if(!guest&&(order?!state.ready:!state.sets.includes(i)||state.rewarded.includes(i)))return;
 if(guest){state.guestClaimed=state.guestReady;state.guestReady=null}else if(order){state.order++;state.ready=false}else state.rewarded.push(i);
 const cash=purse(a),points=claimPoints(i);state.cash+=cash;earn(points);unlock();save();render();chime('bonus');notice(a.name+' claimed · +$'+cash+' · +'+points+' pts','bonus');
}
function save(){try{localStorage.setItem(key,JSON.stringify(state))}catch{}}
const size=i=>rows[i][3]||1;
const used=()=>state.bag.reduce((n,x)=>n+size(x.id),0);
function quote(i,now){const interval=45000, window=18000;
 const elapsed=Math.max(0,now-state.start);
 const phase=(elapsed+i*7919)%interval;
 const price=regular(i);
 const sale=phase<window,subtotal=sale?Math.floor(price*.6):price;
 return {cost:state.club.dealer?Math.floor(subtotal*.8):subtotal,seconds:sale?Math.ceil((window-phase)/1000):0}}
let receiptTimer,audio;
function chime(which){
 if(!state.sound)return;
 try{
   audio??=new (window.AudioContext||window.webkitAudioContext)();
   if(audio.state==='suspended')audio.resume().catch(()=>{});
   const notes={buy:[784,1047],work:[294,440],bonus:[523,659,784,1047],upgrade:[392,494,587,784],sell:[659,494],pack:[330],error:[175,147]};
   notes[which].forEach((f,i)=>{
     const t=audio.currentTime+i*.085,o=audio.createOscillator(),g=audio.createGain();
     o.type=which==='work'?'triangle':'sine';o.frequency.value=f;
     g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.09,t+.014);g.gain.exponentialRampToValueAtTime(.0001,t+.24);
     o.connect(g).connect(audio.destination);o.start(t);o.stop(t+.25);o.onended=()=>{o.disconnect();g.disconnect()};
   });
 }catch{}
}
function notice(msg,type='info',canOpen=false){
 clearTimeout(receiptTimer);$('receipt').hidden=false;$('receipt').className=type;
 $('notice').textContent=msg;$('pack').hidden=!canOpen;
 if(type==='error')chime('error');
 receiptTimer=setTimeout(()=>{$('receipt').hidden=true},type==='bonus'?12000:6500);
}
function motion(el,frames,ms){
 if(el.animate&&!matchMedia('(prefers-reduced-motion: reduce)').matches)return el.animate(frames,{duration:ms,easing:'ease-out'});
}
function fly(i){
 const source=cards[i].button.closest('article').querySelector('.icon'),target=$('storage');
 const a=source.getBoundingClientRect(),b=target.getBoundingClientRect();
 if(matchMedia('(prefers-reduced-motion: reduce)').matches||!source.animate)return;
 const ghost=document.createElement('span');ghost.className='parcel';ghost.textContent=rows[i][0];ghost.setAttribute('aria-hidden','true');
 const x=Math.min(innerWidth-36,Math.max(0,a.left)),y=Math.max(b.bottom,Math.min(innerHeight-40,a.top));
 ghost.style.left=x+'px';ghost.style.top=y+'px';document.body.append(ghost);
 const anim=ghost.animate([{transform:'scale(1)'},{transform:'translate('+ (b.left+b.width/2-x)+'px,'+(b.top-y)+'px) scale(.35)',opacity:.2}],{duration:540,easing:'ease-in'});
 anim.onfinish=()=>ghost.remove();anim.oncancel=()=>ghost.remove();
}
function buy(i){if(!onShelf(i)&&!early(i)){syncClock();return notice('This release returns at '+localTime(nextOpening(i))+'.')}const q=quote(i,Date.now());
 if(q.cost!==Number(cards[i].button.dataset.price)){prices();return notice('Price changed. Check the new price before buying.')}
 if(used()+size(i)>tiers[state.tier][1])return notice('Needs '+size(i)+' slots. Sell an item or upgrade storage.','error',true);
 if(q.cost>state.cash)return notice('Earn $'+(q.cost-state.cash)+' more to buy this item.','error');
 const item={id:i,paid:q.cost,boughtAt:Date.now(),...variant(i)};state.cash-=q.cost;state.spent+=q.cost;state.bag.push(item);
 const discovery=!state.club.seen.includes(i);
 if(discovery){state.club.seen.push(i);earn(2)}
 if(state.club.dealer)state.club.dealer--;
 const usedPass=early(i);if(usedPass){state.club.preview--;catalog()}
 const count=unlock();save();render();fly(i);chime(count?'bonus':'buy');
 notice(itemName(item)+' packed · −$'+q.cost+(discovery?' · First find +2 pts':'')+(regular(i)>q.cost?' · Saved $'+(regular(i)-q.cost):'')+(count?' · Collection ready! Open Collections to claim.':''),count?'bonus':'purchase',true);
}
const cards=rows.map(([icon,name],i)=>{const el=document.createElement('article');
 el.innerHTML='<span class="icon">'+icon+'</span><h3>'+name+'</h3><small>'+collections[group(i)]+' · '+size(i)+' slot'+(size(i)>1?'s':'')+'</small><strong class="variant"></strong><button class="journal">Read reviews</button><span></span><button class="buy"></button>';
 el.querySelector('.journal').onclick=()=>review(i);const button=el.lastElementChild;button.onclick=()=>buy(i);$('items').append(el);
 return {el,button,label:button.previousElementSibling,badge:el.querySelector('.variant')}});
function prices(){const now=Date.now();cards.forEach(({button,label,el},i)=>{if(el.hidden)return;const q=quote(i,now);button.dataset.price=q.cost;button.textContent='Buy · $'+q.cost;
 label.className=q.seconds?'sale':'';label.textContent=q.seconds?'Was $'+regular(i)+' · '+q.seconds+'s left':'Regular price';if(state.club.dealer)label.textContent+=' · Dealer −20%'})}
function catalog(){let found=0;const term=$('search').value.trim().toLowerCase();
 cards.forEach(({el,badge},id)=>{const v=variant(id),dept=departments[group(id)];
 badge.textContent=dyeNames[v.color]+' · '+grades[v.grade]+(id>=originalCount?(early(id)?' · Backroom preview':' · Timed release'):'');el.style.setProperty('--ink',inks[v.color]);
 el.hidden=Boolean((!onShelf(id)&&!early(id))||($('department').value==='timed'?id<originalCount:$('department').value&&$('department').value!==dept)||![rows[id][1],collections[group(id)],badge.textContent,dept].join(' ').toLowerCase().includes(term));if(!el.hidden)found++});
 $('empty').hidden=found>0;$('batch').textContent='Delivery '+(state.delivery+1)+' · '+found+' finds';$('releaseTime').textContent='Rare shelf changes at '+localTime((clockSlot()+1)*fiveMinutes);
 if(!found&&term){const missing=rows.findIndex((r,i)=>r[1].toLowerCase()===term&&!onShelf(i));$('empty').textContent=missing<0?'No finds match these filters.':rows[missing][1]+' returns at '+localTime(nextOpening(missing))+'.'}else $('empty').textContent='No finds match these filters.';prices()}
for(const dept of [...new Set(departments)].sort())$('department').add(new Option(dept,dept));
$('search').oninput=catalog;$('department').onchange=catalog;
$('delivery').onclick=()=>{state.delivery++;save();catalog();chime('pack');motion($('items'),[{opacity:.4},{opacity:1}],300)};
function review(id){
 const [spec,positive,caveat]=id<36?legacyProfiles[id]:rows[id].slice(4);let page=0;
 function paint(){const entry=[[5,positive,'Mira'],[4,caveat,'Jules']][page];$('stars').textContent='★'.repeat(entry[0])+'☆'.repeat(5-entry[0]);$('reviewText').textContent=entry[1];$('reviewBy').textContent=entry[2]+' · Review '+(page+1)+' of 2'}
 $('reviewTitle').textContent=rows[id][1];$('spec').textContent=spec+'. '+resale({id,grade:variant(id).grade,paid:regular(id),boughtAt:Date.now()}).label;
 $('prev').onclick=$('next').onclick=()=>{page=1-page;paint()};paint();$('reviews').showModal()}
$('reviewClose').onclick=()=>$('reviews').close();
function discard(index,sell,offer){const x=state.bag[index],value=sell?(offer??netOffer(x).value):0;if(sell&&state.club.broker)state.club.broker--;state.bag.splice(index,1);state.cash+=value;save();render();notice(sell?'Sold '+itemName(x)+' for $'+value+' · You paid $'+x.paid+' · '+difference(x.paid,value)+'.':'Tossed '+rows[x.id][1]+'.')}
function render(){$('clubOpen').textContent='★ '+state.club.points;$('clubOpen').setAttribute('aria-label','Collector club, '+state.club.points+' points');const [tier,cap]=tiers[state.tier];$('wallet').textContent='$'+state.cash;$('score').textContent='$'+state.spent;$('space').textContent=tier+' '+used()+'/'+cap;
 $('tier').textContent='Your '+tier.toLowerCase();const next=tiers[state.tier+1];$('upgrade').replaceChildren();
 if(next){const b=document.createElement('button');b.textContent='Upgrade to '+next[0]+' · '+next[1]+' slots · $'+next[2];b.onclick=()=>{if(state.cash<next[2])return notice('Earn $'+(next[2]-state.cash)+' more to upgrade.');state.cash-=next[2];state.spent+=next[2];state.tier++;save();render();chime('upgrade');notice('Moved into the '+next[0].toLowerCase()+'!')};$('upgrade').append(b)}
 $('case').dataset.tier=state.tier;$('caseLabel').textContent=tier+' · '+used()+' / '+cap+' slots';
 $('stock').replaceChildren();
 const sorted=state.bag.map((item,index)=>({item,index}));
 const sortKey=x=>state.sort==='collection'?collections[group(x.id)]:state.sort==='type'?departments[group(x.id)]:'';
 if(state.sort!=='packed')sorted.sort(({item:a},{item:b})=>(state.sort==='rarity'?(heldGrade(b)-heldGrade(a)):sortKey(a).localeCompare(sortKey(b)))||rows[a.id][1].localeCompare(rows[b.id][1])||itemName(a).localeCompare(itemName(b)));
 $('sort').value=state.sort;
 sorted.forEach(({item,index})=>{
   const [icon,name]=rows[item.id],tile=document.createElement('button');
   tile.className='packed';tile.style.gridColumn='span '+size(item.id);
   tile.innerHTML='<span aria-hidden="true">'+icon+'</span><small>'+name+'</small>';
   tile.style.borderBottom='5px solid '+(inks[item.color]||'#917959');tile.lastElementChild.textContent=(vintage(item)?'Vintage · ':'')+itemName(item);tile.setAttribute('aria-label','Inspect '+itemName(item));tile.onclick=()=>inspect(index);$('stock').append(tile);
 });
 for(let n=used();n<Math.min(cap,used()+24);n++){
   const slot=document.createElement('div');slot.className='vacant';slot.setAttribute('aria-hidden','true');$('stock').append(slot);
 }
 function entry(a,i){const el=document.createElement('article'),done=i===-2?state.guestReady!=null:i===-1?state.ready:state.sets.includes(i),paid=i>=0&&state.rewarded.includes(i);
 const heading=document.createElement('h3');heading.textContent=a.name;el.append(heading);
 for(const r of a.needs){const button=document.createElement('button');button.className='piece';button.textContent=(owns(r)?'✓ ':'⌕ ')+(r.color==null?'':dyeNames[r.color]+' ')+rows[r.id][1]+(r.min?' · Rare or better':'');button.onclick=()=>{$('search').value=rows[r.id][1];$('department').value='';catalog();tab(false)};el.append(button)}
 const footer=document.createElement(done&&!paid?'button':'small');footer.textContent=paid?'✓ Claimed · $'+a.bonus:done?'Claim $'+purse(a)+' + '+claimPoints(i)+' pts':a.needs.filter(owns).length+'/3 held · $'+purse(a)+' + '+claimPoints(i)+' pts';if(done&&!paid){footer.className='buy';footer.onclick=()=>claim(i)}el.append(footer);return el}
 $('commission').replaceChildren(entry(orderSet(),-1));
 const slot=boardSlot(), guest=$('guest');guest.replaceChildren();
 if(state.rewarded.length>=2){if(state.guestReady!=null||state.guestClaimed!==slot)guest.append(entry(guestSet(state.guestReady??slot),-2));
 $('boardTime').textContent=(state.guestReady!=null?'Guest reward held until claimed.':state.guestClaimed===slot?'Guest reward claimed. ':'Guest collection. ')+' Next rotation '+localTime((slot+1)*boardInterval)+'.';
 }else $('boardTime').textContent='Claim 2 permanent sets to open the rotating guest collection.';
 const locked=albums.filter(a=>(a.requires||0)>state.rewarded.length);
 $('progress').textContent=state.rewarded.length+' claimed'+(locked.length?' · Next: '+locked[0].name+' at '+locked[0].requires+' claimed.':' · All permanent collections unlocked.');
 $('sets').replaceChildren(...albums.map((a,i)=>({a,i})).filter(({a,i})=>!state.rewarded.includes(i)&&(a.requires||0)<=state.rewarded.length).sort((x,y)=>Number(state.sets.includes(y.i)&&!state.rewarded.includes(y.i))-Number(state.sets.includes(x.i)&&!state.rewarded.includes(x.i))).map(({a,i})=>entry(a,i)));
 const pending=Number(state.guestReady!=null)+state.sets.filter(i=>!state.rewarded.includes(i)).length+Number(state.ready);
 $('book').textContent='Collections'+(pending?' ('+pending+')':'');$('mode').textContent='Mode: '+(state.advanced?'Advanced':'Casual');$('mode').setAttribute('aria-pressed',state.advanced);
 $('work').textContent=(state.advanced?'Play shift':'Work')+' +$'+paycheck();$('sound').textContent=state.sound?'Sound on':'Sound off';$('sound').setAttribute('aria-pressed',state.sound);prices()}
function inspect(index){
 const item=state.bag[index],[icon,name]=rows[item.id];$('detailIcon').textContent=icon;$('itemTitle').textContent=itemName(item);
 $('itemInfo').textContent=(item.edition?grades[item.grade]+' · Delivery '+item.edition:'Original issue')+(vintage(item)?' · Vintage / '+grades[heldGrade(item)]:'')+' · Paid $'+item.paid+' · '+size(item.id)+' storage slot'+(size(item.id)>1?'s':'');
 const offer=netOffer(item);$('valuation').textContent=offer.label+' Current offer $'+offer.value+' · '+difference(item.paid,offer.value)+'.';
 $('sellItem').textContent='Sell for $'+offer.value;
 for(const [id,sell] of [['sellItem',true],['tossItem',false]]){
   $(id).onclick=()=>{$('itemDialog').close();discard(index,sell,offer.value);chime(sell?'sell':'pack')};
 }
 $('itemDialog').showModal();chime('pack');
}
$('keepItem').onclick=()=>$('itemDialog').close();
function paintJobs(){
 const next=jobs[state.job+1];$('jobInfo').textContent=jobs[state.job][0]+' · $'+paycheck()+' per shift · Wallet $'+state.cash;
 $('jobs').replaceChildren(...jobs.map(([name,pay,cost],i)=>{
   const row=document.createElement('p');row.className=i===state.job?'current':'';
   row.textContent=name+' · $'+pay+'/shift'+(i===state.job?' · Current':i>state.job?' · $'+cost+' upgrade':' · Completed');return row;
 }));
 $('promote').hidden=!next;if(next)$('promote').textContent='Upgrade · $'+next[2];
}
$('settingsOpen').onclick=()=>$('settings').showModal();
$('settingsClose').onclick=()=>$('settings').close();
$('career').onclick=()=>{$('settings').close();paintJobs();$('jobMessage').textContent='';$('jobDialog').showModal()};
$('closeJob').onclick=()=>$('jobDialog').close();
$('promote').onclick=()=>{
 const next=jobs[state.job+1];if(!next)return;
 if(state.cash<next[2]){$('jobMessage').textContent='Earn $'+(next[2]-state.cash)+' more for this upgrade.';chime('error');return}
 state.cash-=next[2];state.spent+=next[2];state.job++;save();render();paintJobs();chime('upgrade');$('jobMessage').textContent='Promoted! Each shift now pays $'+next[1]+'.';
};
$('sound').onclick=()=>{state.sound=!state.sound;save();render();chime('buy')};
$('pack').onclick=()=>{tab(true);$('receipt').hidden=true;chime('pack')};
function tab(view){for(const [button,panel,value] of [['shop','store',false],['storage','bin',true],['book','album','album']]){
 const active=value===view;$(panel).hidden=!active;$(button).setAttribute('aria-pressed',active)}$('shelves').scrollTop=0}
$('shop').onclick=()=>tab(false);$('storage').onclick=()=>tab(true);$('book').onclick=()=>tab('album');
$('sort').onchange=()=>{state.sort=$('sort').value;save();render()};
$('mode').onclick=()=>{state.advanced=!state.advanced;save();render();notice(state.advanced?'Advanced shifts pay double. Finish the task to collect your wages.':'Casual work pays with one tap.')};
function paycheck(){return jobs[state.job][1]*(state.advanced?2:1)}
function pay(){const amount=paycheck();state.cash+=amount;if(state.advanced)earn(2);save();render();chime('work');motion($('work'),[{transform:'scale(.94)'},{transform:'scale(1)'}],250);notice(jobs[state.job][0]+' shift · +$'+amount+' earned.'+(state.advanced?' +2 pts':''))}
function shuffle(list){for(let i=list.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[list[i],list[j]]=[list[j],list[i]]}return list}
function shift(){
 const panel=$('shift');if(panel.open)return;
 const choices=$('answers'),status=$('shiftStatus');let finished=false;
 function complete(){if(finished||!panel.open)return;finished=true;state.shifts++;panel.close();pay()}
 function options(list,act){choices.replaceChildren(...shuffle(list).map(value=>{const b=document.createElement('button');b.textContent=value;b.onclick=()=>{if(panel.open&&!finished)act(value)};return b}))}
 const mode=state.shifts%3;status.textContent='';
 if(mode===0){const cost=11+Math.floor(Math.random()*29),change=50-cost;
 $('shiftTitle').textContent='Count the change';$('task').textContent='The basket costs $'+cost+'. The customer hands you $50. How much change is due?';
 options([change,change+5,change-3].map(n=>'$'+n),v=>v==='$'+change?complete():status.textContent='Count up from the basket total and try again.')}
 else if(mode===1){const picks=shuffle(rows.map(r=>r[1])).slice(0,3);let step=0;
 $('shiftTitle').textContent='Pack the order';$('task').textContent='Pack in slip order: '+picks.join(' → ');
 options([...picks],v=>{if(v!==picks[step]){status.textContent='Next on the slip: '+picks[step];return}step++;if(step===3)complete();else{chime('pack');status.textContent=step+'/3 packed · Next: '+picks[step]}})}
 else{const id=Math.floor(Math.random()*rows.length),dept=departments[group(id)];
 $('shiftTitle').textContent='Route the delivery';$('task').textContent='Which department should receive the '+rows[id][1].toLowerCase()+'?';
 options([dept,...shuffle([...new Set(departments)].filter(d=>d!==dept)).slice(0,2)],v=>v===dept?complete():status.textContent='That shelf belongs to another department. Try again.')}
 panel.showModal()}
$('leave').onclick=()=>$('shift').close();$('work').onclick=()=>state.advanced?shift():pay();
$('restart').onclick=()=>$('confirm').showModal();$('cancel').onclick=()=>$('confirm').close();$('reset').onclick=()=>{state=fresh();enroll();$('search').value='';$('department').value='';catalog();save();render();tab(false);notice('Fresh start!');$('confirm').close()};
unlock();save();catalog();tab(false);render();setInterval(()=>{if(lastSlot!==clockSlot())syncClock();else if(!$('store').hidden)prices()},500);
