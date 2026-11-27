// Resident IDs are permanent. Appearance and interests are regenerated from the town seed.
const firstNames='Ada Alma Ari Ash Ben Bo Bri Cass Cora Dara Dee Eli Esme Felix Finn Gia Hugo Iris Jade Jem Jo Kai Kit Lena Leo Lou Luca Mae Mara Mina Mo Nico Nina Noel Oren Pax Remy Rosa Rue Sam Sol Tali Tess Uma Vera Wren Yara Zeke'.split(' ');
const surnames='Alder Ashby Bell Booker Brook Calder Chen Costa Cruz Dale Ellis Finch Flores Fox Green Hayes Hill Ito Lake Lane Marsh Moss North Ortiz Park Reed Reyes Rivera Singh Soto Vale West Wolfe Young'.split(' ');
const trades=[
 ['supper-club host',6,'the kitchen is full and the table is still empty','my guests have already pulled up chairs'],
 ['record collector',3,'sound check starts in ten','the band has started looking at me'],
 ['street photographer',9,'the light on the station clock is perfect','the parade is already coming round the corner'],
 ['alterations tailor',10,'I have a fitting this afternoon','my client is waiting behind the curtain'],
 ['garden volunteer',2,'we have a planting party today','the seedlings are lined up like little witnesses'],
 ['game-night host',4,'every seat at game night is booked','six people are arguing about the rules already'],
 ['mural artist',5,'we finally have a dry wall and a clear sky','the scaffolding comes down after lunch'],
 ['campsite steward',0,'the trail crew heads out shortly','the last shuttle is pulling up'],
 ['coffee cart owner',1,'the morning queue wraps around the corner','someone just ordered coffee for an entire choir'],
 ['repair café regular',8,'there is a queue at my repair bench','the toolbox just made a deeply expensive noise'],
 ['beach attendant',7,'the forecast says a whole day of sun','my beach hut opens at noon'],
 ['mobile librarian',11,'the reading room is opening today','my book club has occupied the pavement']
];
const dispositions=[
 ['Meticulous', 'Restored pieces earn extra trust.'],['Sentimental','Favorite-color pieces earn extra trust.'],
 ['Neighborly','A conversation earns extra trust.'],['Practical','Will happily buy disclosed faults for parts.'],
 ['Punctual','Keeping a promise earns extra trust.'],['Generous','Pays a larger rush premium.']
];
function neighborRoll(id,salt,limit){
 let h=(state.seed^Math.imul(id+1,0x9e3779b1)^Math.imul(salt+1,0x85ebca6b))>>>0;
 h=Math.imul(h^(h>>>16),0x7feb352d);h=Math.imul(h^(h>>>15),0x846ca68b);
 return ((h^(h>>>16))>>>0)%limit;
}
function identity(id){
 const pick=(s,n)=>neighborRoll(id,s,n),job=id<4?id:pick(2,trades.length);
 const name=id<4?['Dot','Gus','Inez','Bea'][id]:firstNames[pick(3,firstNames.length)]+' '+surnames[pick(4,surnames.length)];
 return {name,job,trait:pick(5,dispositions.length),color:pick(6,dyeNames.length)};
}
const trustLabel=v=>v< -5?'Wary':v<6?'Acquaintance':v<18?'Friendly':v<35?'Trusted':'Close friend';
function newNeighbor(id,turn){return {id,since:turn,trust:0,history:[],cycle:0,due:turn+3+neighborRoll(id,7,3),sold:false,promised:false,chat:-1}}
function setupNeighborhood(){
 if(!state.village)state.village={turn:0,clock:clockSlot(),next:5,people:[0,1,2,3,4].map(id=>newNeighbor(id,0)),past:[],news:'The first neighbors have opened their doors.'};
}
function remember(r,line,change){
 const before=r.trust;r.trust=Math.max(-50,Math.min(100,r.trust+change));
 const delta=r.trust-before;
 r.history.unshift(line+(delta?' · '+(delta>0?'+':'')+delta+' trust':''));
 r.history.length=Math.min(6,r.history.length);
}
function orderFriendship(index,pieces){
 setupNeighborhood();const r=state.village.people.find(x=>x.id===(index??0));if(!r)return;
 const broken=pieces.some(x=>x.fault);remember(r,broken?'Found a fault in a collection order':'Bought a complete collection',broken?-3:3);
}
function advanceVillage(){
 setupNeighborhood();const v=state.village;v.turn++;v.clock=clockSlot();
 for(const r of v.people)if(v.turn>=r.due){
  if(r.promised&&!r.sold)remember(r,'Waited for a promised delivery',-4);
  r.promised=false;r.sold=false;r.cycle++;r.due=v.turn+3+neighborRoll(r.id,10+r.cycle,3);
 }
 if(v.turn%4)return;
 let out=null;
 if(v.turn%12===0){
  const travelers=v.people.filter(r=>r.id>=4&&!r.promised&&v.turn-r.since>=8);
  travelers.sort((a,b)=>a.trust-b.trust||a.since-b.since);
  if(travelers.length){out=travelers[0];v.people.splice(v.people.indexOf(out),1);out.left=v.turn;v.past.push(out)}
 }
 const newcomer=newNeighbor(v.next++,v.turn);v.people.push(newcomer);
 v.news=(out?identity(out.id).name+' moved away. ':'')+identity(newcomer.id).name+' moved in on '+street(newcomer.id)+'.';
}
function tickVillage(){setupNeighborhood();if(clockSlot()>state.village.clock)advanceVillage()}
const blocks=['Market Lane','Juniper Row','Station Road','Lantern Court','Orchard Walk','River Terrace','Chapel Street','Foundry Mews'];
function street(id){const n=Math.floor(id/5);return blocks[n%blocks.length]+(n>=blocks.length?' '+(1+Math.floor(n/blocks.length)):'')}
function need(r){
 const p=identity(r.id),dept=trades[p.job][1],item=dept*3+(r.cycle+neighborRoll(r.id,21,3))%3;
 return {item,p,dept};
}
function requestLine(r){
 const {item,p}=need(r),job=trades[p.job],product=rows[item][1].toLowerCase(),why=job[2+neighborRoll(r.id,r.cycle+123,2)];
 const lines=['Any chance you have a '+product+'? '+why+'.','A '+product+' would save my afternoon. '+why+'.','I borrowed a '+product+'. Long story. I need one of my own because '+why+'.','Please tell me you packed a '+product+' today. '+why+'.','I put “'+product+'” on my list and then lost the list. '+why+'.','I can pay a rush price for a '+product+' today. '+why+'.'];
 return lines[neighborRoll(r.id,35+r.cycle,lines.length)];
}
function deal(r,x,disclose=true){
 const p=identity(r.id);
 const value=Math.max(1,Math.round(resale(x.fault&&!disclose?{...x,fault:false}:x).value*(1.35+(p.trait===5?.2:0)+r.trust*.004)));
 let trust=5+(x.color===p.color?(p.trait===1?4:2):0)+(x.restored?(p.trait===0?5:2):0);
 if(x.fault)trust=disclose?(p.trait===3?4:1):-8;
 if(r.promised&&trust>0)trust+=p.trait===4?5:2;
 return {value,trust};
}
function tradeNeighbor(r,x,disclose){
 const v=state.village;if(!v.people.includes(r)||r.sold||x.trophy||!state.bag.includes(x)||x.id!==need(r).item)return;
 const q=deal(r,x,disclose);r.sold=true;r.badSale=Boolean(x.fault&&!disclose);r.promised=false;unpack([x]);state.cash+=q.value;
 const line=(x.fault?(disclose?'Accepted disclosed fault':'Discovered an undisclosed fault'):x.restored?'Bought a restored piece':'Rush order filled')+' · '+rows[x.id][1]+' · $'+q.value;
 remember(r,line,q.trust);if(q.trust>0)earn(2);save();render();chime('sell');
 notice(identity(r.id).name+' paid $'+q.value+' · You paid $'+x.paid+' · '+difference(costBasis(x),q.value)+'.');
}
function chatNeighbor(r){
 if(r.chat===state.village.turn||!state.village.people.includes(r))return;
 r.chat=state.village.turn;remember(r,'Stopped for a chat',identity(r.id).trait===2?2:1);save();paintNeighborhood();
}
function promiseNeighbor(r,cycle){
 if(!state.village.people.includes(r)||r.cycle!==cycle||r.sold||r.promised)return;
 r.promised=true;remember(r,'You promised to bring a '+rows[need(r).item][1].toLowerCase(),0);save();paintNeighborhood();
}
function portrait(id){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=32;canvas.className='residentFace';canvas.setAttribute('aria-hidden','true');
 const c=canvas.getContext?.('2d');if(!c)return canvas;
 const pick=(n,palette)=>palette[neighborRoll(id,n,palette.length)];
 const skin=pick(44,['#6a4030','#a56848','#c88c65','#daa37b','#edbe98','#f4cfaf']);
 const hair=pick(45,['#362925','#49342a','#8c4e35','#b87e49','#d1b77c','#766b68','#533c56']);
 const cloth=pick(46,['#39675f','#7a4c62','#a65640','#426480','#656a39','#865b38']);
 function rect(color,x,y,w,h){c.fillStyle=color;c.fillRect(x,y,w,h)}
 rect(pick(47,['#e9d6ae','#ceddc6','#c6dce0','#e4cacb','#d8d2e7']),0,0,32,32);
 rect(cloth,5,26,22,6);rect(cloth,3,29,26,3);rect(skin,13,21,6,7);
 const wide=neighborRoll(id,48,3);rect(hair,8-wide,6,16+wide*2,14);rect(skin,9-wide,9,14+wide*2,12);rect(skin,11-wide,20,10+wide*2,3);
 rect(skin,7-wide,14,2,4);rect(skin,23+wide,14,2,4);
 const style=neighborRoll(id,49,6);rect(hair,9-wide,5,14+wide*2,5);
 if(style===0){rect(hair,8-wide,8,5,7);rect(hair,12,7,8,4)}
 if(style===1){rect(hair,6-wide,8,4,16);rect(hair,22+wide,9,4,15)}
 if(style===2){rect(hair,10,2,9,5);rect(hair,17,4,6,5)}
 if(style===3){rect(cloth,7,5,18,5);rect(cloth,6,9,22,2)}
 if(style===4){rect(hair,7,4,4,5);rect(hair,11,3,5,4);rect(hair,17,3,6,6)}
 rect('#392e31',11,14,2,2);rect('#392e31',19,14,2,2);
 if(neighborRoll(id,50,3)===0){c.strokeStyle='#4b4240';c.strokeRect(9.5,12.5,5,5);c.strokeRect(17.5,12.5,5,5);rect('#4b4240',15,14,3,1)}
 rect('#925b50',14,19,5,1);if(neighborRoll(id,51,4)===0)rect(hair,13,18,7,1);
 rect(pick(52,['#e7bb65','#e9dcc3','#aabdc3']),14,28,3,4);return canvas;
}
let directoryPast=false,directoryPage=0,profileId=null;
function paintNeighborhood(){
 setupNeighborhood();const v=state.village,all=directoryPast?v.past.slice().reverse():v.people;
 const pages=Math.max(1,Math.ceil(all.length/5));directoryPage=Math.min(directoryPage,pages-1);
 $('streetName').textContent=v.people.length<8?'Market village':v.people.length<18?'Market town':'Market borough';
 $('census').textContent=v.people.length+' neighbors · '+(1+Math.floor((v.next-1)/5))+' streets · Town turn '+(v.turn+1)+'. New arrival in '+(4-v.turn%4)+' turns.';
 $('townNews').textContent=v.news;
 $('locals').setAttribute('aria-pressed',String(!directoryPast));$('departed').setAttribute('aria-pressed',String(directoryPast));
 const box=$('neighbors');box.replaceChildren();
 if(!all.length)appendText(box,'small','Nobody has moved away yet.');
 for(const r of all.slice(directoryPage*5,directoryPage*5+5)){
  const {p,item}=need(r),b=action(box,'',()=>{profileId=r.id;paintProfile(r);$('neighborDialog').showModal()});b.className='neighborCard';
  b.append(portrait(r.id));const copy=appendText(b,'span','');appendText(copy,'strong',p.name);
  appendText(copy,'small',trustLabel(r.trust)+' · '+(r.left!=null?'Former resident':r.sold?'Request filled':(r.promised?'Promised: ':'Wants ')+rows[item][1]+(state.bag.some(x=>x.id===item&&!x.trophy)?' · In storage':'')));
 }
 const nav=$('directoryPages');nav.replaceChildren();if(pages>1){action(nav,'Previous',()=>{directoryPage--;paintNeighborhood()}).disabled=directoryPage===0;appendText(nav,'small',(directoryPage+1)+' / '+pages);action(nav,'Next',()=>{directoryPage++;paintNeighborhood()}).disabled=directoryPage===pages-1}
 if($('neighborDialog').open){const r=v.people.find(x=>x.id===profileId)||v.past.find(x=>x.id===profileId);if(r)paintProfile(r)}
}
function paintProfile(r){
 const {p,item,dept}=need(r),v=state.village,body=$('profileBody'),away=r.left!=null;
 $('profilePic').replaceChildren(portrait(r.id));$('neighborName').textContent=p.name;
 $('neighborBio').textContent=trades[p.job][0]+' · '+street(r.id)+' · '+(away?'Moved away':'Resident since turn '+(r.since+1));
 body.replaceChildren();appendText(body,'strong',trustLabel(r.trust)+' · '+r.trust+' trust');
 appendText(body,'p','Likes '+departments[dept].toLowerCase()+' and '+dyeNames[p.color]+'. '+dispositions[p.trait].join(' · '));
 if(!away){
  const talked=r.chat===v.turn;
  if(talked){const comments=['If you see anything in '+dyeNames[p.color]+', think of me.','My favorite aisle? '+departments[dept]+'. I could spend all day there.','Someone called my collection “inventory.” The nerve.','I knew this street before the shops had matching awnings.','There’s always room for one more good find. Somewhere.'];
   appendText(body,'blockquote',comments[neighborRoll(r.id,400+v.turn,comments.length)])}
  action(body,talked?'Chatted this turn':'Stop for a chat',()=>chatNeighbor(r)).disabled=talked;
  appendText(body,'h3',r.sold?'Request filled':'Needed now');appendText(body,'blockquote',r.sold?(r.badSale?'It broke before I got home. Next time, tell me what I’m buying.':'I’ve got what I needed. Catch me next time.'):requestLine(r));
  appendText(body,'small',(r.sold?'Next request':'Deadline')+' in '+(r.due-v.turn)+' town turns. Advance with a shop delivery or the next five-minute clock change.');
  if(!r.sold){
   const cycle=r.cycle;action(body,r.promised?'You promised this item':'Promise delivery',()=>promiseNeighbor(r,cycle)).disabled=r.promised;
   appendText(body,'small','Keep your promise for extra trust. Miss it and lose 4 trust.');
   const pieces=state.bag.filter(x=>!x.trophy&&x.id===item);
   if(!pieces.length)action(body,'Find '+rows[item][1]+' in Shop',()=>{$('neighborDialog').close();jumpTo(item)});
   for(const x of pieces){
    const card=appendText(body,'div','');card.className='localSale';appendText(card,'strong',itemName(x));
    appendText(card,'small','Paid $'+x.paid+(x.parts?' + $'+x.parts+' parts':'')+' · '+(x.fault?'Broken':x.restored?'Restored':'Working'));
    for(const disclose of x.fault?[true,false]:[true]){
     const q=deal(r,x,disclose),label=x.fault?(disclose?'Disclose fault':'Hide fault'):'Sell now';
     action(card,label+' · $'+q.value+' · '+(q.trust>0?'+':'')+q.trust+' trust',()=>{if(r.cycle===cycle)tradeNeighbor(r,x,disclose)});
    }
   }
  }
 }
 appendText(body,'h3','Shared history');const list=appendText(body,'ul','');for(const line of r.history)appendText(list,'li',line);
 if(!r.history.length)appendText(body,'small','You haven’t traded or chatted yet.');
}
function setupNeighbors(){
 setupNeighborhood();$('neighborClose').onclick=()=>$('neighborDialog').close();
 function directory(past){directoryPast=past;directoryPage=0;paintNeighborhood()}
 $('locals').onclick=()=>directory(false);$('departed').onclick=()=>directory(true);
}
