export const charts=[
 {name:'Lantern Cove',tide:8,quota:6,gold:9,rows:['..3.#','.#..H','..2.3','2#.#.','S.4..']},
 {name:'The Shallows',tide:10,quota:9,gold:14,rows:['3~4.H','.#.2~','2B.#3','.#3..','S4.~2']},
 {name:'Northlight Sound',tide:11,quota:12,gold:19,rows:['.5~.H','.#.4~','3B#B4','~#.2.','S4~5.']}
];
export const tiles=c=>c.rows.join('');
export const startRun=c=>({pos:tiles(c).indexOf('S'),time:c.tide,pearls:0,taken:[],phase:'sailing'});
export function neighbors(pos){
 return [pos-5,pos+5,...(pos%5?[pos-1]:[]),...(pos%5<4?[pos+1]:[])].filter(n=>n>=0&&n<25);
}
export const cost=tile=>tile==='~'?2:1;
export function canMove(c,s,n){const t=tiles(c)[n];return s.phase==='sailing'&&neighbors(s.pos).includes(n)&&t!=='#'&&cost(t)<=s.time}
export function canDock(c,s){return tiles(c)[s.pos]==='H'&&s.pearls>=c.quota&&s.phase==='sailing'}
export function sail(c,s,n){
 if(!canMove(c,s,n))return s;
 const t=tiles(c)[n],fresh=!s.taken.includes(n),haul=fresh&&/\d/.test(t)?Number(t):0,buoy=fresh&&t==='B';
 const next={...s,pos:n,time:s.time-cost(t)+(buoy?3:0),pearls:s.pearls+haul,taken:haul||buoy?[...s.taken,n]:s.taken};
 if(next.time===0&&canDock(c,next))next.phase='landed';
 else if(!neighbors(n).some(i=>canMove(c,next,i))&&!canDock(c,next))next.phase='stranded';
 return next;
}
