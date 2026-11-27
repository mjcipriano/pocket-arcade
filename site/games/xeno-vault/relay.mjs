export const routes=['Vela','Lyra','Draco'];
export function startRelay(stake){
  return {stake,scans:3,lanes:[[0,0,0],[0,0,0],[0,0,0]],lastLane:-1};
}
export function relayValue(relay){
  return relay.lanes.reduce((total,row)=>total+row.reduce((a,b)=>a+b,0)+(row.every(Boolean)?5:0),0)*relay.stake/5;
}
export function scanLane(state,lane,rng=Math.random){
  const relay=state.relay;
  if(!relay || !Number.isInteger(lane) || !relay.lanes[lane]?.includes(0))return false;
  relay.lanes[lane]=relay.lanes[lane].map(value=>value || (rng()<.55?1+Math.floor(rng()*5):0));
  relay.lastLane=lane;
  relay.scans--;
  const award=relayValue(relay);
  state.message=routes[lane]+' scanned · '+award+' credits stored';
  if(!relay.scans){
    state.credits+=award;state.best=Math.max(state.best,award);state.last=award;
    state.relay=null;state.message='Relay transmitted · '+award+' credits collected';
  }
  return true;
}
