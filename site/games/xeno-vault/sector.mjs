export const phenomena = {
  meteor: {name:'Meteor shower', color:'#ffab68', rule:'Three meteors forge wilds.'},
  tractor: {name:'Mothership harvest',color:'#75f6b5',rule:'Collect one line stake per moon or crystal, plus one for docking.'},
  wormhole: {name:'Wormhole echo',color:'#bb9aff',rule:'Reel one echoes across reels two and three. Portals stay put.'},
  solar: {name:'Solar flare',color:'#ffe07e',rule:'Triple all line wins and collect two line stakes.'}
};
export function sectorEvent(s,rng){
  s.sectorStep=(s.sectorStep??0)+1;
  if(s.sectorStep!==2 && (s.sectorStep<5 || (s.sectorStep-2)%3!==0))return null;
  if(!s.deck?.length){
    s.deck=Object.keys(phenomena);
    for(let i=s.deck.length-1;i>0;i--){
      const j=Math.floor(rng()*(i+1));[s.deck[i],s.deck[j]]=[s.deck[j],s.deck[i]];
    }
    if(s.deck.at(-1)===s.previousEvent)[s.deck[0],s.deck[3]]=[s.deck[3],s.deck[0]];
  }
  const kind=s.deck.pop();
  s.previousEvent=kind;
  const targets=[];
  let credits=0,factor=1;
  const ordinary=s.board.flat().map((id,pos)=>({id,pos})).filter(item=>item.id<6);
  if(kind==='meteor'){
    while(ordinary.length && targets.length<3){
      const [{pos}]=ordinary.splice(Math.floor(rng()*ordinary.length),1);
      s.board[Math.floor(pos/3)][pos%3]=6;targets.push(pos);
    }
  }else if(kind==='tractor'){
    targets.push(...ordinary.filter(({id})=>id===3 || id===4).map(({pos})=>pos));
    credits=(targets.length+1)*s.bet/5;
  }else if(kind==='wormhole'){
    for(let col=1;col<=2;col++)for(let row=0;row<3;row++){
      if(s.board[col][row]!==7 && s.board[0][row]!==7){
        s.board[col][row]=s.board[0][row];targets.push(col*3+row);
      }
    }
  }else{factor=3;credits=2*s.bet/5;}
  return {kind,targets,credits,factor};
}
