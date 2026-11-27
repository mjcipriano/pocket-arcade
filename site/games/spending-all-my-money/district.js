const townEvents=[
 ['Jazz night','Audio resale offers +35%', 'Audio',1.35,1],
 ['Rain on Market Street','Outerwear resale offers +50%', 'Outerwear',1.5,1],
 ['Moving sale','Folding chairs, desk lamps and letter trays −25%', [1,35,65],1,.75],
 ['Gallery walk','Photography resale offers +30%', 'Photography',1.3,1],
 ['Kitchen swap','Kitchenware shop prices −25%', 'Kitchenware',1,.75]
];
function townEvent(now=Date.now()){return townEvents[boardSlot(now)%townEvents.length]}
function eventFactor(id,index,now){const e=townEvent(now);const affected=Array.isArray(e[2])?e[2].includes(id):departments[group(id)]===e[2];return affected?e[index]:1}
const workshop={
 10:['Tuning dial slips','I found my station. Then the station found somewhere else to be.','Tuner belt'],
 27:['Film advance sticks','Nine gorgeous exposures of the exact same frame.','Advance spring'],
 54:['Platter runs slow','My favorite tenor is a baritone now.','Drive belt'],
 67:['Focus patch misaligned','Two images of my uncle and neither in focus. One uncle is plenty.','Mirror shim'],
 78:['Crown skips','Stopped at 8:12. Twice a day it’s the most accurate thing I own.','Crown stem']
};
function shopFault(id){return Boolean(workshop[id]&&(id===10||((state.delivery+id)%3===0)))}
function partsCost(x){return Math.max(3,Math.round(x.retail*.12))}
const patrons=[
 {name:'Dot',taste:'Supper club',early:[3,18,20,19,46,47],late:[18,34,70],special:'Dinner party, guests sold separately'},
 {name:'Gus',taste:'Record collector',early:[9,10,11,54,55,56],late:[54,72,73],special:'Midnight listening party'},
 {name:'Inez',taste:'Street photographer',early:[27,28,29,48,59,60],late:[67,68,81],special:'One last frame'}
];
function patronOrder(){
 const who=state.patron,p=patrons[who],visits=state.visits[who],special=visits>=2;
 const ids=special?p.late:[0,1,2].map(j=>p.early[(visits*3+j)%p.early.length]);
 const needs=ids.map((id,j)=>({id,color:special&&j===0?lot(id,state.order,state.seed).color:null}));
 return {name:p.name+' · '+(special?p.special:p.taste)+' · order '+(visits+1),needs,bonus:(special?240:85)+ids.reduce((n,id)=>n+rows[id][2],0)};
}
function advancePatron(){
 const current=state.patron;
 if(current!=null)state.visits[current]++;
 const available=state.club.rank>=1?3:2;
 state.patron=current==null?0:(current+1)%available;
}
function appendText(parent,tag,text){const el=document.createElement(tag);el.textContent=text;parent.append(el);return el}
function action(parent,label,handler){const b=appendText(parent,'button',label);b.onclick=handler;return b}
function wishMatch(w){return (onShelf(w.id)||early(w.id))&&matches({...variant(w.id),id:w.id},w)}
function jumpTo(id){$('search').value=rows[id][1];$('department').value='';catalog();tab(false)}
function browseWishes(){$('search').value='';$('department').value='wishlist';catalog();tab(false)}
function wishlistUI(){
 const hits=state.wishes.filter(wishMatch);
 $('wishJump').hidden=!hits.length;$('wishJump').textContent='★ '+hits.length+' wish'+(hits.length===1?'':'es')+' in stock';
 $('wishJump').onclick=browseWishes;
 $('shop').textContent=hits.length?'Shop ★':'Shop';
 const box=$('wishList');box.replaceChildren();
 for(const w of state.wishes){const row=appendText(box,'div','');row.className='townrow';
 appendText(row,'span',rows[w.id][1]+' · '+(w.color==null?'Any color':colorDescription(w.id,w.color))+' · '+grades[w.min]+'+');
 if(wishMatch(w))action(row,'Shop match',()=>jumpTo(w.id));
 action(row,'Remove',()=>{state.wishes=state.wishes.filter(x=>x!==w);save();wishlistUI()})}
 $('pinWish').disabled=state.wishes.length>=5;
}
function addWish(){const w={id:Number($('wishProduct').value),color:$('wishColor').value===''?null:Number($('wishColor').value),min:Number($('wishGrade').value)};
 if(state.wishes.length>=5)return;
 if(state.wishes.some(x=>x.id===w.id&&x.color===w.color&&x.min===w.min))return notice('Already pinned.');
 state.wishes.push(w);save();wishlistUI();notice('Pinned '+rows[w.id][1]+'.')}
function toggleTrophy(x){
 if(!state.bag.includes(x))return;
 if(!x.trophy&&state.bag.filter(item=>item.trophy).length>=3)return notice('The trophy shelf holds three pieces.');
 x.trophy=!x.trophy;const prior=state.order;unlock();save();render();notice(prior!==state.order?state.buyerReceipt:x.trophy?'Displayed and protected.':'Returned to available stock.');
}
function trophyUI(){
 const box=$('trophies');box.replaceChildren();const shown=state.bag.filter(x=>x.trophy);
 if(!shown.length)appendText(box,'small','Open a stored item to display it here. Displayed pieces are protected from sales and still use storage.');
 for(const x of shown){const el=appendText(box,'article','');appendText(el,'strong',rows[x.id][0]+' '+itemName(x));
 appendText(el,'small',(x.edition?'Delivery '+x.edition:'Original issue')+' · Paid $'+x.paid+' · Current offer $'+netOffer(x).value);action(el,'Return to storage',()=>toggleTrophy(x))}
}
function roll(salt,max){const v=lot(salt,state.delivery,state.seed);return (v.color*17+v.grade*31+Math.imul(state.delivery+1,salt))%max}
function lotItem(id,paid){return {id,paid,retail:regular(id),boughtAt:Date.now(),...variant(id)}}
function acquire(items,total){
 state.cash-=total;state.spent+=total;state.bag.push(...items);
 for(const x of items)if(!state.club.seen.includes(x.id)){state.club.seen.push(x.id);earn(2)}
 const order=state.order,sets=unlock();save();render();chime('buy');
 return (sets?' · Collection ready!':'')+(order!==state.order?' · '+state.buyerReceipt:'');
}
const auctionLots=[54,39,27,30,56,42,48,78,63,72,21,67];
function auctionInfo(){const id=auctionLots[roll(19,auctionLots.length)],retail=regular(id);
 const rivals=[['Gus','Audio'],['Bea','Clothing'],['Inez','Photography']];
 return {id,start:Math.max(2,Math.floor(retail*.28)),step:Math.max(2,Math.ceil(retail*.08)),
 rivals:rivals.map(([name,taste],i)=>({name,taste,limit:Math.floor(retail*((departments[group(id)]===taste ? .95 : .36)+roll(23+i,36)/100))}))}}
function bid(){
 const a=auctionInfo(),sale=state.auction;if(sale.closed)return;
 const bid=sale.price?sale.price+a.step:a.start;
 if(bid>state.cash||used()+size(a.id)>tiers[state.tier][1])return notice('Bid needs $'+bid+' and '+size(a.id)+' free slots.');
 const rival=a.rivals.filter(r=>r.limit>=bid+a.step).sort((x,y)=>x.limit-y.limit)[0];
 if(rival){sale.price=bid+a.step;sale.leader=rival.name;save();paintDistrict();chime('pack');return}
 sale.closed=true;sale.result='Won for $'+bid;const suffix=acquire([lotItem(a.id,bid)],bid);notice(sale.result+' · '+rows[a.id][1]+suffix,'purchase',true);
}
const lockers=[
 {hint:'Record sleeves and a coiled audio cable',common:[10,55,9],prize:54},
 {hint:'A camera strap under a stack of postcards',common:[28,29,17],prize:67},
 {hint:'Flour on a linen cover and a long cardboard box',common:[20,46,19],prize:47},
 {hint:'A folded route map beside two pannier hooks',common:[61,62,25],prize:42}
];
function lockerInfo(){const l=lockers[roll(13,lockers.length)],ids=[l.common[roll(43,3)],l.common[(roll(43,3)+1)%3],roll(47,5)<2?l.prize:l.common[(roll(43,3)+2)%3]];
 return {hint:l.hint,ids,slots:ids.reduce((n,id)=>n+size(id),0),price:Math.round((rows[l.common[0]][2]+rows[l.common[1]][2]+rows[l.prize][2]*.30)*.64)}}
function openLocker(){
 if(state.lockerOpened)return;const l=lockerInfo();
 if(state.cash<l.price||used()+l.slots>tiers[state.tier][1])return notice('Locker needs $'+l.price+' and '+l.slots+' free slots.');
 const totalRetail=l.ids.reduce((sum,id)=>sum+regular(id),0);let remaining=l.price;
 const items=l.ids.map((id,i)=>{const share=i===l.ids.length-1?remaining:Math.floor(l.price*regular(id)/totalRetail);remaining-=share;return lotItem(id,share)});
 state.lockerOpened=true;const suffix=acquire(items,l.price);notice('Unpacked '+items.map(itemName).join(', ')+suffix,'purchase',true);
}
function repair(x){
 if(!state.bag.includes(x)||!x.fault)return;
 const dialog=$('repairDialog'),cost=partsCost(x);
 if(!x.parts&&state.cash<cost)return notice('Parts cost $'+cost+'.');
 if(!x.parts){state.cash-=cost;state.spent+=cost;x.parts=cost;save();render()}
 const steps=['Seat','Align','Test'];let step=0;
 $('repairTitle').textContent=rows[x.id][1]+' · '+workshop[x.id][2];
 function task(){const target=1+Math.floor(Math.random()*8),picks=shuffle([target,target+2,target+4]);
 $('repairTask').textContent=steps[step]+' ('+(step+1)+'/3) · Match the gauge to '+target+' marks.';
 const keys=$('repairKeys');keys.replaceChildren();for(const n of picks)action(keys,'▏'.repeat(n),()=>{
 if(!dialog.open||!x.fault||!state.bag.includes(x))return;
 if(n!==target){$('repairFeedback').textContent='Off by '+Math.abs(target-n)+' marks. Try again.';chime('error');return}
 $('repairFeedback').textContent='Aligned.';if(++step<3){chime('pack');task();return}
 x.fault=false;x.restored=true;dialog.close();save();render();chime('upgrade');notice('Restored '+itemName(x)+' · resale appraisal +30%.','bonus');
 })}
 $('repairFeedback').textContent='Parts fitted. You can resume later at no extra cost.';task();dialog.showModal();
}
function paintDistrict(){
 const e=townEvent();$('townEvent').textContent=e[0]+' · '+e[1]+' until '+localTime((boardSlot()+1)*boardInterval);
 const a=auctionInfo(),sale=state.auction;$('auctionName').textContent=rows[a.id][0]+' '+itemName({id:a.id,...variant(a.id)});
 $('auctionInfo').textContent='Retail $'+regular(a.id)+' · '+size(a.id)+' slots. '+a.rivals.map(r=>r.name+' collects '+r.taste.toLowerCase()).join(' · ');
 $('bidState').textContent=sale.closed?sale.result:sale.price?sale.leader+' leads at $'+sale.price+' · '+(a.rivals.filter(r=>r.limit<sale.price).map(r=>r.name).join(', ')||'Nobody')+' out':'Bidding is open.';
 $('bid').disabled=$('pass').disabled=sale.closed;$('bid').textContent='Bid $'+(sale.price?sale.price+a.step:a.start);
 const l=lockerInfo();$('lockerArt').textContent=state.lockerOpened?l.ids.map(id=>rows[id][0]).join('  '):['💿  📦','📸  📦','🥣  📦','🗺️  📦'][roll(13,lockers.length)];$('lockerInfo').textContent=state.lockerOpened?'Unpacked: '+l.ids.map(id=>rows[id][1]).join(', '):l.hint+'. Three pieces · '+l.slots+' slots.';
 $('takeLocker').disabled=state.lockerOpened;$('takeLocker').textContent=state.lockerOpened?'Locker collected':'Buy sealed locker · $'+l.price;
 const bench=$('bench');bench.replaceChildren();
 const broken=state.bag.filter(x=>x.fault);
 if(!broken.length)appendText(bench,'small','Look for as-is items in the shop. Their reviews reveal the fault.');
 for(const x of broken){const el=appendText(bench,'article','');appendText(el,'strong',itemName(x));appendText(el,'small',workshop[x.id][0]+' · As-is offer $'+resale(x).value+' · Restored offer $'+resale({...x,fault:false,restored:true}).value);
 action(el,x.parts?'Resume repair':'Fit '+workshop[x.id][2]+' · $'+partsCost(x),()=>repair(x))}
 wishlistUI();trophyUI();paintNeighborhood();
}
function setupDistrict(){
 rows.forEach((r,i)=>$('wishProduct').add(new Option(r[1],i)));dyeNames.forEach((n,i)=>$('wishColor').add(new Option(n,i)));grades.forEach((n,i)=>$('wishGrade').add(new Option(n+' or better',i)));
 $('pinWish').onclick=addWish;$('bid').onclick=bid;$('takeLocker').onclick=openLocker;
 $('pass').onclick=()=>{if(state.auction.closed)return;state.auction.closed=true;state.auction.result='Passed. Another lot arrives next delivery.';save();paintDistrict()};
 $('repairLeave').onclick=()=>$('repairDialog').close();$('town').onclick=()=>{paintDistrict();tab('town')};
}
