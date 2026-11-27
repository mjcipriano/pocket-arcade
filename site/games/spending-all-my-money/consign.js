// One auction round per shop delivery. Unsold consignments keep their storage space.
const consignmentLimit=3;
const entryFee=x=>Math.max(1,Math.min(12,Math.ceil(resale(x).value*.03)));
const houseCut=gross=>Math.ceil(gross/10);
function roundPurse(id){
 return 30+neighborRoll(id,8100+state.delivery,170)+state.club.rank*35+
 (identity(id).trait===5?45:0);
}
function tasteFor(r,x){
 const p=identity(r.id),dept=departments[trades[p.job][1]],wanted=need(r).item;
 const materialIds=x.id>=craftStart?patterns[x.id-craftStart].needs.map(n=>n.id):[];
 const likesDept=[x.id,...materialIds].some(id=>departments[group(id)]===dept);
 const reasons=[];
 if(likesDept)reasons.push(dept.toLowerCase());
 if(x.color===p.color)reasons.push(dyeNames[p.color]);
 if(!r.sold&&wanted===x.id)reasons.push('current request');
 if(p.trait===0&&x.restored)reasons.push('restored pieces');
 if(p.trait===3&&x.fault)reasons.push('repair projects');
 return reasons;
}
function residentBids(listing,remaining,lot){
 const x=listing.item,bids=[];
 for(const r of state.village.people){
  const p=identity(r.id),likes=tasteFor(r,x),salt=state.delivery*233+lot*811+x.id*13;
  const chance=Math.min(95,12+likes.length*32+Math.floor(r.trust/5));
  if(neighborRoll(r.id,6000+salt,100)>=chance)continue;
  const factor=.55+neighborRoll(r.id,7000+salt,76)/100+likes.length*.36;
  const bid=Math.min(remaining.get(r.id),Math.floor(listing.appraisal*factor));
  if(bid>=2)bids.push({r,name:p.name,bid,likes});
 }
 return bids.sort((a,b)=>b.bid-a.bid||a.r.id-b.r.id);
}
function closeConsignments(){
 const house=state.consignments;if(!house.lots.length)return;
 const remaining=new Map(state.village.people.map(r=>[r.id,roundPurse(r.id)]));
 // A leading rival also pays for the thrift lot if the player passed or walked away.
 const rival=state.village.people.find(r=>identity(r.id).name===state.auction.leader);
 if(rival&&state.auction.price&&!state.auction.playerWon)remaining.set(rival.id,Math.max(0,remaining.get(rival.id)-state.auction.price));
 const receipts=[];
 for(const [index,listing] of house.lots.entries()){
  const x=listing.item,bids=residentBids(listing,remaining,index),winner=bids[0];
  if(!winner){x.auctionFees=(x.auctionFees||0)+listing.fee;state.bag.push(x);receipts.push(itemName(x)+' · No bids. Returned to storage. Listing fee $'+listing.fee+' spent.');continue}
  const gross=winner.bid,cut=houseCut(gross),net=gross-cut;
  remaining.set(winner.r.id,remaining.get(winner.r.id)-gross);state.cash+=net;state.spent+=cut;
  remember(winner.r,'Won '+rows[x.id][1]+' at auction for $'+gross,0);
  receipts.push(itemName(x)+' · '+winner.name+' won at $'+gross+' · '+bids.length+' bidder'+(bids.length===1?'':'s')+(winner.likes.length?' · Likes '+winner.likes.join(', '):' · Browsing')+' · House $'+cut+' · Paid out $'+net+' · Item cost $'+costBasis(x)+' · Listing $'+listing.fee+' · '+difference(costBasis(x)+listing.fee,net)+'.');
 }
 house.lots=[];house.history.unshift({round:state.delivery+1,receipts});house.history.length=Math.min(house.history.length,6);unlock();
}
function listConsignment(x,fee){
 const h=state.consignments;
 if(!state.bag.includes(x)||x.trophy||h.lots.length>=consignmentLimit||state.cash<fee)return;
 if(entryFee(x)!==fee)return previewConsignment(x);
 unpack([x]);state.cash-=fee;state.spent+=fee;h.lots.push({item:x,fee,appraisal:resale(x).value});save();$('consignDialog').close();render();notice('Listed '+itemName(x)+' for this round.','purchase');
}
function previewConsignment(x){
 if(!state.bag.includes(x)||x.trophy)return;
 const fee=entryFee(x),house=state.consignments,dlg=$('consignDialog');
 $('consignName').textContent=itemName(x);$('consignQuote').textContent='Sell directly for $'+netOffer(x).value+' now, or list for $'+fee+'. The house keeps 10% of the winning bid, rounded up. An unsold item returns to storage. The listing fee is spent either way.';
 const interested=state.village.people.filter(r=>tasteFor(r,x).length);
 $('consignInterest').textContent=interested.length?'Possible interest: '+interested.slice(0,5).map(r=>identity(r.id).name+' ('+tasteFor(r,x).join(', ')+')').join(' · ')+(interested.length>5?' and '+(interested.length-5)+' more':'')+'.':'No clear match among current residents. Browsers may still bid.';
 const b=$('listLot');b.disabled=state.cash<fee||house.lots.length>=consignmentLimit;b.textContent=house.lots.length>=consignmentLimit?'All three lots occupied':state.cash<fee?'Need $'+fee:'List for $'+fee;b.onclick=()=>{if(dlg.open)listConsignment(x,fee)};if(!dlg.open)dlg.showModal();
}
function withdrawLot(listing){
 const h=state.consignments;if(!h.lots.includes(listing))return;
 h.lots=h.lots.filter(l=>l!==listing);listing.item.auctionFees=(listing.item.auctionFees||0)+listing.fee;state.bag.push(listing.item);const order=state.order;unlock();save();render();
 notice('Withdrawn · $'+listing.fee+' listing fee retained.'+(order!==state.order?' '+state.buyerReceipt:''));
}
function paintConsignments(){
 const h=state.consignments,box=$('listedLots');box.replaceChildren();$('consignCount').textContent='Your auction lots · '+h.lots.length+'/'+consignmentLimit;
 if(!h.lots.length)appendText(box,'small','Inspect an item in Storage and choose Put up for auction.');
 for(const l of h.lots){const row=appendText(box,'article','');appendText(row,'strong',itemName(l.item));appendText(row,'small','Appraised $'+l.appraisal+' · $'+l.fee+' listing paid');action(row,'Withdraw · forfeit fee',()=>withdrawLot(l))}
 $('closeRound').disabled=!h.lots.length;
 const log=$('consignLog');log.replaceChildren();for(const round of h.history){appendText(log,'strong','Delivery '+round.round);for(const receipt of round.receipts)appendText(log,'p',receipt)}
}
