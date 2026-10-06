import assert from 'node:assert/strict';
import test from 'node:test';
import { NativeAudioTransport } from '../src/utils/practiceTransport.mjs';
import { buildPositionSequence } from '../src/utils/positionPlayback.mjs';

class Context {
  currentTime = 0;
  destination = {};
  starts = [];
  createGain() { return { gain:{ value:0, setValueAtTime(){}, linearRampToValueAtTime(){} }, connect(){}, disconnect(){} }; }
  createBufferSource() {
    const context = this;
    return { playbackRate:{value:1}, connect(){}, disconnect(){}, stop(){}, start(when){ context.starts.push({when, rate:this.playbackRate.value, key:this.buffer.key}); } };
  }
  async resume() {}
  async close() {}
  async decodeAudioData(key) { return {duration:3,key}; }
}
const make = async (t, overrides={}) => {
  t.mock.timers.enable({apis:['setTimeout','setInterval']});
  const notes = [{midi:47,pitchClass:11,sample:19,playbackRate:0.5,location:'low'}, {midi:48,pitchClass:0,sample:8,playbackRate:1,location:'root'}, {midi:52,pitchClass:4,sample:12,playbackRate:1,location:'high'}];
  const heard = [];
  const counts = [];
  let ended = 0;
  const transport = new NativeAudioTransport(Context, {setAudioSessionActivity:async()=>{}}, {onNote:n=>heard.push(n), onCount:n=>counts.push(n),onEnded:()=>ended++});
  await transport.load([['drum:click','click'],['drum:hat','hat'],['drum:kick','kick'],['drum:snare','snare'],...notes.map(n=>[`guitar:${n.sample}`,n.location])]);
  transport.configure({plan:buildPositionSequence(notes,0), tempo:120,noteRate:'quarter',loop:true,notesEnabled:true,accompaniment:'off',countIn:true,...overrides});
  return {transport,heard,counts,ended:()=>ended};
};
test('four count-in clicks precede the first root on the audio clock',async t=>{
  const {transport}=await make(t);
  transport.start();
  for(let n=0;n<20;n++){transport.context.currentTime=n/10;transport.tick();}
  assert.deepEqual(transport.context.starts.filter(s=>s.key==='click').map(s=>s.when),[0.1,0.6,1.1,1.6]);
  const first=transport.context.starts.find(s=>s.key==='root');
  assert.ok(Math.abs(first.when-2.1)<1e-9);
  transport.stop();
});
test('pause cancels future highlights and resume continues after the audible note',async t=>{
  const {transport,heard}=await make(t,{countIn:false});
  transport.start();
  transport.context.currentTime=0.12;t.mock.timers.tick(120);
  assert.equal(heard.at(-1).location,'root');
  transport.pause();
  const count=heard.length;
  t.mock.timers.tick(2000);
  assert.equal(heard.length,count);
  transport.start(false);
  assert.equal(transport.context.starts.at(-1).key,'high');
  transport.stop();
  transport.start(false);
  assert.equal(transport.context.starts.at(-1).key,'root');
  transport.stop();
});
test('accompaniment-only mode schedules no guitar notes and survives position changes',async t=>{
  const {transport}=await make(t,{notesEnabled:false,accompaniment:'drums',countIn:false});
  transport.start();
  assert.deepEqual(transport.context.starts.map(s=>s.key),['hat','kick']);
  transport.configure({...transport.config, notesEnabled:true},true);
  assert.ok(transport.context.starts.some(s=>s.key==='root'));
  transport.stop();
});
test('one-shot ends after reaching the low note; looping has no repeated turnarounds',async t=>{
  const {transport,ended}=await make(t,{loop:false,countIn:false});
  transport.start();
  for(let n=1;n<28;n++) { transport.context.currentTime=n/10;transport.tick();t.mock.timers.tick(100); }
  assert.deepEqual(transport.context.starts.filter(s=>s.key!=='hat').map(s=>s.key),['root','high','root','low']);
  assert.equal(ended(),1);
  assert.equal(transport.active,false);
});
test('late scheduler skips missed notes rather than emitting a catch-up burst',async t=>{
  const {transport}=await make(t,{countIn:false});
  transport.start();
  transport.context.currentTime=5;
  const before=transport.context.starts.length;
  transport.tick();
  assert.ok(transport.context.starts.length-before<=1);
  assert.ok(transport.context.starts.at(-1).when>=5);
  transport.stop();
});

test('position changes preserve the accompaniment beat grid without a second count-in',async t=>{
  const {transport}=await make(t,{countIn:true,accompaniment:'metronome'});
  transport.start();
  transport.context.currentTime=0.25;
  transport.configure({...transport.config},true);
  assert.equal(transport.countBeats,0);
  assert.ok(Math.abs(transport.nextBeat-0.6)<1e-9);
  transport.context.currentTime=0.4;transport.tick();
  const root=transport.context.starts.find(s=>s.key==='root');
  assert.ok(Math.abs(root.when-0.6)<1e-9);
  transport.stop();
});
