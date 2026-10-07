import assert from 'node:assert/strict';
import test from 'node:test';
import { NativeAudioTransport } from '../src/utils/practiceTransport.mjs';
import { buildPositionSequence } from '../src/utils/positionPlayback.mjs';

class Context {
  currentTime = 0;
  destination = {};
  starts = [];
  stops = [];
  ramps = [];
  createBuffer(channels,length,sampleRate) {
    const data=Array.from({length:channels},()=>new Float32Array(length));
    return {numberOfChannels:channels,length,sampleRate,duration:length/sampleRate,
      getChannelData:c=>data[c],copyToChannel:(a,c)=>data[c].set(a)};
  }
  createGain() { const context=this; return { gain:{ value:0, setValueAtTime(){}, cancelScheduledValues(){}, cancelAndHoldAtTime(){throw new Error('Native envelope cancellation causes a level discontinuity');}, linearRampToValueAtTime(value,when){context.ramps.push({value,when});} }, connect(){}, disconnect(){} }; }
  createBufferSource() {
    const context = this;
    return { playbackRate:{value:1}, connect(){}, disconnect(){}, stop(when){context.stops.push({when,key:this.key});}, start(when){ this.key=context.currentKey;context.starts.push({when, rate:this.playbackRate.value, key:this.key}); } };
  }
  async resume() {}
  async close() {}
  async decodeAudioData(key) { const b=this.createBuffer(1,3000,1000);b.key=key;return b; }
}
const make = async (t, overrides={}) => {
  t.mock.timers.enable({apis:['setTimeout','setInterval']});
  const notes = [{midi:47,pitchClass:11,sample:19,playbackRate:0.5,location:'low'}, {midi:48,pitchClass:0,sample:8,playbackRate:1,location:'root'}, {midi:52,pitchClass:4,sample:12,playbackRate:1,location:'high'}];
  const heard = [];
  const counts = [];
  let ended = 0;
  const transport = new NativeAudioTransport(Context, {setAudioSessionActivity:async()=>{}}, {onNote:n=>heard.push(n), onCount:n=>counts.push(n),onEnded:()=>ended++});
  const schedule=transport.buffer;
  transport.buffer=function(key,...args){this.context.currentKey=key.startsWith('drum:')?key.slice(5):{'guitar:19':'low','guitar:8':'root','guitar:12':'high'}[key];return schedule.call(this,key,...args);};
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
test('stopping cancels future highlights and Play restarts at the first note',async t=>{
  const {transport,heard}=await make(t,{countIn:false});
  transport.start();
  transport.context.currentTime=0.12;t.mock.timers.tick(120);
  assert.equal(heard.at(-1).location,'root');
  transport.pause();
  const count=heard.length;
  t.mock.timers.tick(2000);
  assert.equal(heard.length,count);
  transport.start(false);
  assert.equal(transport.context.starts.at(-1).key,'root');
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
  transport.context.currentTime=0.4;transport.tick();
  assert.ok(transport.context.starts.some(s=>s.key==='root'));
  transport.stop();
});

test('prepared guitar notes play naturally at unity rate without scheduled truncation',async t=>{
  const {transport}=await make(t,{countIn:false});
  transport.start();
  assert.equal(transport.context.starts.at(-1).rate,1);
  assert.equal(transport.context.stops.length,0);
  const buffer=transport.prepared('guitar:19',0.92,0.5,0.5);
  assert.equal(buffer.duration,0.5);
  assert.equal(buffer.getChannelData(0)[0],0);
  assert.equal(buffer.getChannelData(0).at(-1),0);
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
  assert.ok(Math.abs(transport.nextBeat-0.6)<1e-9);
  transport.context.currentTime=0.4;transport.tick();
  assert.equal(transport.countBeats,0);
  const root=transport.context.starts.find(s=>s.key==='root');
  assert.ok(Math.abs(root.when-0.6)<1e-9);
  transport.stop();
});

test('live tempo and subdivision changes keep the sounding note and queued events',async t=>{
  const {transport}=await make(t,{countIn:false});
  transport.start();
  transport.context.currentTime=0.2;
  const starts=transport.context.starts.length, stops=transport.context.stops.length;
  const next=transport.nextNote;
  transport.configure({...transport.config,tempo:90,noteRate:'eighth'});
  assert.equal(transport.context.starts.length,starts);
  assert.equal(transport.context.stops.length,stops);
  assert.equal(transport.nextNote,next);
  transport.context.currentTime=0.4;transport.tick();
  assert.equal(transport.context.starts.at(-1).key,'high');
  assert.ok(Math.abs(transport.nextNote-(next+1/3))<1e-9);
  transport.stop();
});

test('pause fades sounding voices and cancels future voices before their attack',async t=>{
  const {transport}=await make(t,{countIn:false});
  transport.start();
  transport.buffer('drum:hat',0.8,0.2);
  transport.context.currentTime=0.2;
  transport.pause();
  assert.ok(transport.context.ramps.some(r=>r.value===0&&Math.abs(r.when-0.212)<1e-9));
  assert.ok(transport.context.stops.some(s=>s.key==='root'&&Math.abs(s.when-0.217)<1e-9));
  assert.ok(transport.context.stops.some(s=>s.key==='hat'&&s.when===0.2));
});

test('Stop after Pause leaves the existing fade intact',async t=>{
  const {transport}=await make(t,{countIn:false});
  transport.start();
  transport.context.currentTime=0.2;
  transport.pause();
  const ramps=transport.context.ramps.length,stops=transport.context.stops.length;
  transport.context.currentTime=0.206;
  transport.stop();
  assert.equal(transport.context.ramps.length,ramps);
  assert.equal(transport.context.stops.length,stops);
});
