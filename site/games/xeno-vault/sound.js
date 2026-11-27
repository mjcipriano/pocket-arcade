// Each cue has a pitched attack, a glide and a short envelope.
// [start offset, frequency, end frequency, length] in seconds and Hz.
const cues={
  stop:['triangle',[[0,190,76,.07],[.025,440,310,.045]]],
  launch:['sawtooth',[[0,70,190,.28],[.06,130,260,.24]]],
  meteor:['triangle',[[0,1300,150,.24],[.18,610,80,.3],[.32,290,50,.25]]],
  tractor:['sine',[[0,160,620,.46],[.05,244,940,.44]]],
  wormhole:['sine',[[0,840,200,.3],[.22,200,1180,.32]]],
  solar:['triangle',[[0,110,220,.26],[.1,165,330,.3],[.2,220,660,.4]]],
  bloom:['sine',[[0,466,480,.21],[.09,587,605,.24],[.18,698,722,.32]]],
  pulsar:['square',[[0,110,55,.12],[.19,165,82,.12],[.38,220,110,.18]]],
  chain:['triangle',[[0,260,320,.12],[.09,390,490,.18],[.17,520,650,.24]]],
  scan:['sine',[[0,430,1350,.21],[.16,840,620,.16],[.31,930,930,.22]]],
  dock:['triangle',[[0,294,294,.18],[.11,370,370,.2],[.22,440,440,.24],[.34,587,587,.4]]],
  contact:['sine',[[0,698,659,.21],[.17,392,440,.27],[.38,523,784,.31]]]
};
let ctx,master;
export function enableAudio(enabled){
  if(!enabled){if(master)master.gain.value=0;return;}
  try{
    const Audio=window.AudioContext||window.webkitAudioContext;
    if(!ctx){ctx=new Audio();master=ctx.createGain();master.connect(ctx.destination);}
    master.gain.value=.55;
    ctx.resume().catch(()=>{});
  }catch{}
}
export function cue(name,pitch=1){
  if(!ctx || ctx.state!=='running' || !master.gain.value)return;
  const [wave,notes]=cues[name];
  for(const [offset,from,to,length] of notes){
    const t=ctx.currentTime+offset,o=ctx.createOscillator(),g=ctx.createGain();
    o.type=wave;o.frequency.setValueAtTime(from*pitch,t);o.frequency.exponentialRampToValueAtTime(to*pitch,t+length);
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(wave==='square'?.035:.1,t+.018);
    g.gain.exponentialRampToValueAtTime(.0001,t+length);
    o.connect(g).connect(master);o.start(t);o.stop(t+length+.01);
    o.onended=()=>{o.disconnect();g.disconnect();};
  }
}
