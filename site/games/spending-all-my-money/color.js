// Paint covers rigid surfaces; dye is reserved for textiles and removable fabric details.
const paintable=new Set([1,7,8,15,16,25,26,28,35,42,54,57,65,70,74]);
const dyeable=new Set([30,31,32,39,40,41,44,46,48,49,51,52,53,59,62,69]);
const pigmentPrices=[5,5,7,7,8,12,19,22];
const finishPremium=[1,1,1.04,1.04,1.08,1.15,1.25,1.35];
function medium(id){return paintable.has(id)?0:dyeable.has(id)?1:null}
function pigmentName(code){return dyeNames[code%8]+' '+(code<8?'paint':'dye')}
function pigmentStock(){
 const stock=[];
 for(let i=0;i<3;i++){
  const roll=neighborRoll(state.delivery,309+i,100),color=[20,39,55,69,81,91,97,100].findIndex(x=>roll<x);
  let code=color+8*(i<2?i:neighborRoll(state.delivery,350,2));
  if(stock.some(o=>o.code===code))code=(code<8?0:8)+(color+1)%8;
  const list=pigmentPrices[code%8]+(code<8?2:0),sale=neighborRoll(state.delivery,400+i,4)===0;
  stock.push({code,list,cost:sale?Math.max(1,Math.floor(list*.7)):list});
 }
 return stock;
}
function buyPigment(code,delivery){
 if(state.delivery!==delivery||state.colorBox.sold.includes(code))return;
 const offer=pigmentStock().find(x=>x.code===code);if(!offer)return;
 if(state.cash<offer.cost)return notice('You need $'+offer.cost+' for this pigment.');
 state.cash-=offer.cost;state.spent+=offer.cost;state.colorBox.sold.push(code);
 (state.colorBox.tubes[code]??=[]).push(offer.cost);save();render();notice('Packed one dose of '+pigmentName(code)+'.');
}
function tinted(x,code,price){
 const color=code%8,baseRetail=x.baseRetail??x.retail,baseGrade=x.baseGrade??x.grade??0,originalColor=x.originalColor??x.color??-1;
 return {...x,color,baseRetail,baseGrade,originalColor,grade:color===originalColor?baseGrade:Math.max(baseGrade,color>=6?2:color===5?1:0),
 retail:color===originalColor?baseRetail:Math.round(baseRetail*finishPremium[color]),finishSpend:(x.finishSpend||0)+price};
}
function previewColor(x,code){
 const doses=state.colorBox.tubes[code]||[],price=doses[0]??0,y=tinted(x,code,price);
 const changes=[];
 for(const a of albums){
  if((a.requires||0)>state.rewarded.length)continue;
  const affected=a.needs.filter(req=>req.id===x.id);
  for(const req of affected){
   if(matches(x,req)===matches(y,req))continue;
   const after=a.needs.every(n=>state.bag.some(p=>matches(p===x?y:p,n)));
   changes.push((matches(y,req)?(after?'Completes ':'Matches '):'Loses match for ')+a.name);
  }
 }
 const buyer=orderSet();const orderReady=buyer.needs.every(req=>state.bag.some(p=>!p.trophy&&matches(p===x?y:p,req)));
 return {y,price,changes,orderReady};
}
function usePigment(x,code){
 const doses=state.colorBox.tubes[code];if(!$('colorDialog').open||!state.bag.includes(x)||x.trophy||medium(x.id)!==Math.floor(code/8)||x.color===code%8||!doses?.length)return;
 const {y}=previewColor(x,code),before=state.order;doses.shift();Object.assign(x,y);
 const ready=unlock();save();$('colorDialog').close();render();chime('upgrade');notice(before!==state.order?state.buyerReceipt:'Finished '+itemName(x)+(ready?' · Collection ready to claim!':'.'),'bonus');
}
function openColors(x){
 const dlg=$('colorDialog'),box=$('colorChoices');box.replaceChildren();
 $('colorTitle').textContent=itemName(x);$('colorPreview').textContent='Choose a dose for a preview.';$('applyColor').hidden=true;
 const kind=medium(x.id),colors=Object.keys(state.colorBox.tubes).map(Number).filter(k=>Math.floor(k/8)===kind&&state.colorBox.tubes[k].length&&k%8!==x.color);
 if(!colors.length)$('colorPreview').textContent='Buy a different shade of '+(kind?'fabric dye':'surface paint')+' from the Color studio in Town.';
 for(const code of colors)action(box,pigmentName(code)+' ×'+state.colorBox.tubes[code].length,()=>{
  const {y,price,changes,orderReady}=previewColor(x,code);
  $('colorPreview').textContent=[colorDescription(x.id,code%8),grades[heldGrade(x)]+' → '+grades[heldGrade(y)],'Current offer $'+netOffer(x).value+' → $'+netOffer(y).value,'Dose cost $'+price+' · total invested $'+costBasis(y),...changes,orderReady?'Completes the current buyer order. Applying will automatically sell the requested items.':''].filter(Boolean).join(' · ');
  const b=$('applyColor');b.hidden=false;b.textContent='Apply '+pigmentName(code);b.onclick=()=>usePigment(x,code);
 });
 if(!dlg.open)dlg.showModal();
}
function paintColors(){
 const box=$('colorStock'),delivery=state.delivery;box.replaceChildren();
 for(const o of pigmentStock()){
  const sold=state.colorBox.sold.includes(o.code);
  const b=action(box,pigmentName(o.code)+(sold?' · Sold':(o.cost<o.list?' · Sale $'+o.cost+' (was $'+o.list+')':' · $'+o.cost)),()=>buyPigment(o.code,delivery));
  b.disabled=sold||state.cash<o.cost;b.style.borderLeft='6px solid '+inks[o.code%8];
 }
 const owned=Object.entries(state.colorBox.tubes).filter(([,doses])=>doses.length);
 $('colorSupplies').textContent=owned.length?owned.map(([code,doses])=>pigmentName(Number(code))+' ×'+doses.length).join(' · '):'Your pigment box is empty.';
 const items=$('colorItems');items.replaceChildren();for(const x of state.bag)if(!x.trophy&&medium(x.id)!=null)action(items,itemName(x)+' · '+(medium(x.id)?'Dye':'Paint'),()=>openColors(x));
 if(!items.children.length)appendText(items,'small','Store a paintable item such as a picture frame, or a dyeable textile such as a wool scarf.');
}
