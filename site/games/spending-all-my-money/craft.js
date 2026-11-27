// IDs 84–92 follow the timed releases. Ingredient IDs refer to permanent catalog rows.
const patterns=[
 {icon:'🎨',name:'Pocket watercolor studio',spec:'A fitted travel palette with brushes and a spiral sketchbook.',slots:2,fee:8,level:0,needs:[{id:16,min:1},{id:15},{id:17}]},
 {icon:'☕',name:'Pour-over tasting kit',spec:'A matched brewing kit with a gooseneck kettle, whole beans and a glazed tasting mug.',slots:2,fee:12,level:0,needs:[{id:5,min:1},{id:4},{id:3}]},
 {icon:'🧵',name:'Field sketch roll',spec:'A roll-up drawing kit with a graded pencil tin and a pocket sketch pad.',slots:1,fee:10,level:0,needs:[{id:59},{id:57,min:1},{id:58}]},
 {icon:'📻',name:'Restored listening case',spec:'A working pocket radio and headphones fitted into a soft-lined weekender.',slots:2,fee:25,level:2,needs:[{id:10,restored:true},{id:9,min:1},{id:48}]},
 {icon:'🖼️',name:'Framed transit study',spec:'A signed transit print mounted under glass alongside a hand-drawn scale study.',slots:2,fee:32,level:2,needs:[{id:81},{id:28,min:1},{id:57}]},
 {icon:'🍵',name:'Spring tea service',spec:'First-flush leaves packed with a side-handle pot and its own bamboo measure.',slots:2,fee:28,level:2,needs:[{id:76},{id:75},{id:77}]},
 {icon:'🧳',name:'Traveling illustrator’s trunk',spec:'Two complete artist kits fitted into a reinforced canvas travel bag.',slots:3,fee:65,level:5,needs:[{id:84},{id:86},{id:48,min:2}]},
 {icon:'🎧',name:'Listening-room console',spec:'A restored belt-drive deck, phono preamp and private radio listening case in one cabinet.',slots:3,fee:80,level:5,needs:[{id:87},{id:54,restored:true},{id:73}]},
 {icon:'🗺️',name:'Cartographer’s exhibition case',spec:'A framed transit study displayed with a brass divider and its original archival tube.',slots:3,fee:75,level:5,needs:[{id:88},{id:82},{id:83}]}
];
const craftSets=['Maker’s first editions','Market specialists','Masterwork exhibition'];
function registerCrafts(){
 for(let i=0;i<patterns.length;i+=3){
  const batch=patterns.slice(i,i+3);collections.push(craftSets[i/3]);departments.push('Maker workshop');
  albums.push({name:craftSets[i/3],needs:batch.map((r,j)=>({id:craftStart+i+j})),bonus:[225,625,1500][i/3]});
  for(const r of batch)rows.push([r.icon,r.name,Math.ceil(r.needs.reduce((n,req)=>n+rows[req.id][2],r.fee)*1.4),r.slots,r.spec]);
 }
}
function craftMatches(x,req){return !x.trophy&&!x.fault&&matches(x,req)&&(!req.restored||x.restored)}
function requirement(req){return rows[req.id][1]+(req.min?' · '+grades[req.min]+' or better':'')+(req.restored?' · restored at the workbench':'')}
function craftEstimate(i,pieces){
 const recipe=patterns[i],inputs=pieces.reduce((sum,x)=>sum+resale(x).value,0);
 const retail=Math.max(Math.ceil((recipe.fee+pieces.reduce((sum,x)=>sum+x.retail,0))*1.4),2*Math.ceil((inputs+recipe.fee)*1.25));
 return {retail,offer:Math.floor(retail/2),inputs,basis:recipe.fee+pieces.reduce((sum,x)=>sum+costBasis(x),0)};
}
function craftSubmit(i,pieces,estimate){
 const r=patterns[i];if(!$('craftDialog').open)return;
 if(pieces.length!==r.needs.length||new Set(pieces).size!==pieces.length||state.made.length<r.level||!pieces.every((x,j)=>state.bag.includes(x)&&craftMatches(x,r.needs[j]))||state.cash<r.fee||used()-pieces.reduce((n,x)=>n+size(x.id),0)+r.slots>tiers[state.tier][1])return showPattern(i);
 const q=craftEstimate(i,pieces);if(q.retail!==estimate.retail)return showPattern(i);
 const id=craftStart+i,first=!state.made.includes(id),output={id,paid:q.basis,retail:q.retail,color:pieces[0].color??0,grade:r.level===5?3:2,edition:state.delivery+1,boughtAt:Date.now(),crafted:true,materials:pieces.map(x=>itemName(x)+' ($'+costBasis(x)+')'),fee:r.fee};
 unpack(pieces);state.bag.push(output);state.cash-=r.fee;state.spent+=r.fee;
 if(first){state.made.push(id);state.club.seen.push(id);earn(8)}
 const completed=unlock();save();$('craftDialog').close();render();chime('upgrade');notice('Made '+r.name+' · opening offer $'+q.offer+(first?' · +8 points':'')+(completed?' · Collection ready!':''),'bonus');
}
function goPattern(id){tab('town');showPattern(id-craftStart)}
function showPattern(i){
 const r=patterns[i],body=$('craftBody'),dialog=$('craftDialog');body.replaceChildren();$('craftTitle').textContent=r.icon+' '+r.name;
 appendText(body,'p',r.spec+' '+(r.level===5?'Archive':'Rare')+' · '+r.slots+' storage slot'+(r.slots===1?'':'s')+'. The first ingredient sets the finished color.');
 const unlocked=state.made.length>=r.level;
 if(!unlocked)appendText(body,'p','Unlocks after making '+r.level+' different recipes ('+state.made.length+' made).');
 const choices=[];
 for(const req of r.needs){
  const options=state.bag.filter(x=>craftMatches(x,req)).sort((a,b)=>resale(a).value-resale(b).value);
  const label=appendText(body,'label',requirement(req));label.className='craftIngredient';
  const select=document.createElement('select');label.append(select);
  if(!options.length){select.add(new Option('Missing eligible copy',''));select.disabled=true;
   action(body,req.id>=craftStart?'View ingredient recipe':'Find '+rows[req.id][1],()=>{if(req.id>=craftStart)return showPattern(req.id-craftStart);dialog.close();jumpTo(req.id)});
  }else options.forEach((x,j)=>select.add(new Option(itemName(x)+' · '+grades[heldGrade(x)]+' · basis $'+costBasis(x)+' · offer $'+resale(x).value,j)));
  choices.push({options,select});
 }
 const info=appendText(body,'p',''),make=action(body,'',()=>{});make.className='buy';
 function update(){
  const pieces=choices.map(({options,select})=>options[Number(select.value)||0]);
  const ready=pieces.every(Boolean);let estimate;
  make.disabled=!unlocked||!ready||state.cash<r.fee;
  if(ready){estimate=craftEstimate(i,pieces);
   const free=tiers[state.tier][1]-used()+pieces.reduce((n,x)=>n+size(x.id),0);if(free<r.slots)make.disabled=true;
   info.textContent='Separate offers $'+estimate.inputs+' · Combined offer $'+estimate.offer+' · Total cost basis $'+estimate.basis+(free<r.slots?' · More storage required':'')+'.';
  }else info.textContent='Choose one working, undisplayed copy of each ingredient.';
  make.textContent=state.cash<r.fee?'Assembly needs $'+r.fee:'Use 3 items + $'+r.fee+' to assemble';make.onclick=()=>{if(!make.disabled)craftSubmit(i,pieces,estimate)};
 }
 choices.forEach(({select})=>select.onchange=update);update();if(!dialog.open)dialog.showModal();
}
function paintCraft(){
 const box=$('patterns');box.replaceChildren();
 $('craftCount').textContent='Maker workshop · '+state.made.length+'/'+patterns.length+' recipes made';
 patterns.forEach((r,i)=>{const count=r.needs.filter(req=>state.bag.some(x=>craftMatches(x,req))).length;
 const b=action(box,r.icon+' '+r.name,()=>showPattern(i));appendText(b,'small',state.made.length<r.level?'Unlock at '+r.level+' recipes':(state.made.includes(craftStart+i)?'✓ Made · ':'')+count+'/3 ingredients · $'+r.fee);});
}
