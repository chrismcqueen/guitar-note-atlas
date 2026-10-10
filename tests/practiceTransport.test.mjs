import assert from 'node:assert/strict';
import test from 'node:test';
import { NativeAudioTransport } from '../src/utils/practiceTransport.mjs';
import { buildPositionSequence } from '../src/utils/positionPlayback.mjs';
import { NOTE_RATES } from '../src/utils/audioSequence.mjs';
import { NOTE_LEVEL } from '../src/utils/audioMix.mjs';

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
  state = 'suspended';
  suspends = 0;
  resumes = 0;
  async resume() { this.resumes++; this.state = 'running'; }
  async suspend() { this.suspends++; this.state = 'suspended'; }
  async close() { this.state = 'closed'; }
  async decodeAudioData(key) { const b=this.createBuffer(1,3000,1000);b.key=key;return b; }
}
const make = async (t, overrides={}, frames) => {
  t.mock.timers.enable({apis:['setTimeout','setInterval']});
  const notes = [{midi:47,pitchClass:11,sample:19,playbackRate:0.5,location:'low'}, {midi:48,pitchClass:0,sample:8,playbackRate:1,location:'root'}, {midi:52,pitchClass:4,sample:12,playbackRate:1,location:'high'}];
  const heard = [];
  const counts = [];
  let ended = 0;
  const transport = new NativeAudioTransport(Context, {setAudioSessionActivity:async()=>{}}, {onNote:n=>heard.push(n), onCount:n=>counts.push(n),onEnded:()=>ended++}, frames);
  const schedule=transport.buffer;
  transport.buffer=function(key,...args){this.context.currentKey=key.startsWith('drum:')?key.slice(5):{'guitar:19':'low','guitar:8':'root','guitar:12':'high'}[key];return schedule.call(this,key,...args);};
  await transport.load([['drum:click','click'],['drum:hat','hat'],['drum:kick','kick'],['drum:snare','snare'],...notes.map(n=>[`guitar:${n.sample}`,n.location])]);
  transport.configure({plan:buildPositionSequence(notes,0), tempo:120,noteRate:'quarter',loop:true,notesEnabled:true,accompaniment:'off',countIn:true,...overrides});
  return {transport,heard,counts,ended:()=>ended};
};
const display = () => {
  let id=0;
  const pending=new Map();
  return {
    pending,
    request(callback) { pending.set(++id,callback);return id; },
    cancel(id) { pending.delete(id); },
    frame() { const ready=[...pending.values()];pending.clear();ready.forEach(callback=>callback()); },
  };
};

test('tap tempo click wakes idle output, sounds immediately, and returns to idle without starting practice',async t=>{
  const {transport,heard,counts}=await make(t);
  transport.stop();t.mock.timers.tick(50);await Promise.resolve();
  assert.equal(transport.context.state,'suspended');
  transport.context.currentTime=0.75;
  const visuals={notes:heard.length,counts:counts.length};
  await transport.tapClick();
  assert.deepEqual(transport.context.starts,[{when:0.75,rate:1,key:'click'}]);
  assert.equal(transport.context.state,'running');
  assert.equal(transport.active,false);assert.equal(transport.scheduler,null);
  assert.equal(heard.length,visuals.notes);assert.equal(counts.length,visuals.counts);
  t.mock.timers.tick(3050);await Promise.resolve();
  assert.equal(transport.context.state,'suspended');
  await transport.close();
});

test('tap tempo click during practice leaves the audio grid and count-in unchanged',async t=>{
  const frames=display();
  const {transport,counts}=await make(t,{},frames);
  transport.start();
  const grid={origin:transport.origin,beat:transport.nextBeat,note:transport.nextNote,count:transport.countBeats};
  transport.context.currentTime=0.15;frames.frame();assert.deepEqual(counts,[1]);
  await transport.tapClick();
  assert.equal(transport.context.starts.at(-1).key,'click');
  assert.equal(transport.context.starts.at(-1).when,0.15);
  assert.deepEqual({origin:transport.origin,beat:transport.nextBeat,note:transport.nextNote,count:transport.countBeats},grid);
  assert.deepEqual(counts,[1]);assert.equal(transport.active,true);
  t.mock.timers.tick(3050);assert.equal(transport.context.state,'running');
  transport.stop();
});

test('repeated idle taps each sound and extend output lifetime until the final click ends',async t=>{
  const {transport}=await make(t);
  await transport.tapClick();
  t.mock.timers.tick(1000);transport.context.currentTime=1;
  await transport.tapClick();
  assert.deepEqual(transport.context.starts.map(source=>source.when),[0,1]);
  t.mock.timers.tick(2050);assert.equal(transport.context.state,'running');
  t.mock.timers.tick(1000);await Promise.resolve();assert.equal(transport.context.state,'suspended');
  await transport.close();
});

test('Stop cancels a tap waiting for output activation and closed transports ignore taps',async t=>{
  const {transport}=await make(t);
  transport.context.state='suspended';
  let finishResume;
  transport.context.resume=()=>new Promise(resolve=>{finishResume=resolve;});
  const tap=transport.tapClick();
  for(let n=0;n<4;n++) await Promise.resolve();
  assert.ok(finishResume);
  transport.stop();finishResume();await tap;
  assert.deepEqual(transport.context.starts,[]);
  await transport.close();await transport.tapClick();
  assert.deepEqual(transport.context.starts,[]);
});

test('highlights follow the audio clock even when wall time advances while audio is frozen',async t=>{
  const frames=display();
  const {transport,heard}=await make(t,{countIn:false},frames);
  transport.start();
  t.mock.timers.tick(300);
  frames.frame();
  assert.equal(heard.at(-1),null);
  transport.context.currentTime=0.099;frames.frame();
  assert.equal(heard.at(-1),null);
  transport.context.currentTime=0.1;frames.frame();
  assert.equal(heard.at(-1).location,'root');
  transport.stop();
});

test('a delayed display frame skips stale highlights and shows only the currently sounding note',async t=>{
  const frames=display();
  const {transport,heard}=await make(t,{countIn:false},frames);
  transport.start();
  for(const time of [0.4,0.9,1.4]){transport.context.currentTime=time;transport.tick();}
  transport.context.currentTime=1.65;frames.frame();
  assert.deepEqual(heard.filter(Boolean).map(note=>note.location),['low']);
  assert.equal(transport.audibleIndex,4);
  transport.stop();
});

for (const {id:noteRate} of NOTE_RATES) test(`${noteRate} highlights use the scheduled pitch and audio-clock onset`,async t=>{
  const frames=display();
  const {transport,heard}=await make(t,{countIn:false,tempo:240,noteRate,accompaniment:'drums'},frames);
  transport.start();
  for(let time=0;time<4;time+=0.016){
    transport.context.currentTime=time;transport.tick();frames.frame();
    const sounding=transport.context.starts.filter(source=>['root','high','low'].includes(source.key)&&source.when<=time).at(-1);
    assert.equal(heard.at(-1)?.location,sounding?.key);
  }
  transport.stop();
});

test('count-in does not light a note before its source starts',async t=>{
  const frames=display();
  const {transport,heard,counts}=await make(t,{},frames);
  transport.start();
  for(let time=0;time<2.1;time+=0.016){transport.context.currentTime=time;transport.tick();frames.frame();assert.equal(heard.at(-1),null);}
  assert.deepEqual(counts,[1,2,3,4]);
  transport.context.currentTime=2.1;transport.tick();frames.frame();
  assert.equal(heard.at(-1).location,'root');
  assert.equal(counts.at(-1),0);
  transport.stop();
});

for (const tempo of [40,120,240]) test(`count-in displays 1–4 at the scheduled click onset at ${tempo} BPM`,async t=>{
  const frames=display();
  const {transport,counts}=await make(t,{tempo},frames);
  transport.start();
  t.mock.timers.tick(500);frames.frame();
  assert.deepEqual(counts,[],'wall time cannot start the count while audio is frozen');
  for(let beat=0;beat<4;beat++) {
    const onset=0.1+beat*60/tempo;
    transport.context.currentTime=onset-0.001;transport.tick();frames.frame();
    assert.equal(counts.at(-1)??0,beat);
    transport.context.currentTime=onset;frames.frame();
    assert.equal(counts.at(-1),beat+1);
    assert.ok(transport.context.starts.some(source=>source.key==='click'&&Math.abs(source.when-onset)<1e-9));
  }
  transport.context.currentTime=0.1+4*60/tempo;transport.tick();frames.frame();
  assert.deepEqual(counts,[1,2,3,4,0]);
  transport.stop();
});

test('delayed count-in frames skip old numbers and Stop clears the count before restart',async t=>{
  const frames=display();
  const {transport,counts}=await make(t,{},frames);
  transport.start();
  for(const time of [0.4,0.9,1.4]) {transport.context.currentTime=time;transport.tick();}
  transport.context.currentTime=1.65;frames.frame();
  assert.deepEqual(counts,[4]);
  const oldFrame=[...frames.pending.values()][0];
  transport.stop();assert.equal(counts.at(-1),0);
  transport.start();oldFrame();assert.equal(counts.at(-1),0);
  transport.context.currentTime=1.751;frames.frame();assert.equal(counts.at(-1),1);
  transport.stop();
});

test('a highlight clears when its sample ends before the next musical subdivision',async t=>{
  const frames=display();
  const {transport,heard}=await make(t,{countIn:false},frames);
  transport.buffers.set('guitar:8',transport.context.createBuffer(1,200,1000));
  transport.rendered.clear();transport.prepare(transport.config);
  transport.start();
  transport.context.currentTime=0.15;frames.frame();assert.equal(heard.at(-1).location,'root');
  transport.context.currentTime=0.31;frames.frame();assert.equal(heard.at(-1),null);
  transport.stop();
});

test('Stop cancels the display loop and an old frame cannot leak into a restarted run',async t=>{
  const frames=display();
  const {transport,heard}=await make(t,{countIn:false},frames);
  transport.start();
  const oldFrame=[...frames.pending.values()][0];
  transport.context.currentTime=0.2;frames.frame();assert.equal(heard.at(-1).location,'root');
  transport.stop();assert.equal(frames.pending.size,0);assert.equal(heard.at(-1),null);
  transport.start(false);
  const count=heard.length;oldFrame();
  assert.equal(heard.length,count);assert.equal(frames.pending.size,1);
  transport.context.currentTime=0.301;frames.frame();assert.equal(heard.at(-1).location,'root');
  transport.stop();
});

test('position/tempo changes and muting update highlights on the same boundary as audio',async t=>{
  const frames=display();
  const {transport,heard}=await make(t,{countIn:false},frames);
  transport.start();transport.context.currentTime=0.2;frames.frame();
  const plan={...transport.config.plan,notes:transport.config.plan.notes.map(note=>({...note,location:`new-${note.location}`}))};
  transport.configure({...transport.config,plan,tempo:90,noteRate:'eighth'},true);
  transport.context.currentTime=0.4;transport.tick();
  transport.context.currentTime=0.599;frames.frame();assert.equal(heard.at(-1).location,'root');
  transport.context.currentTime=0.601;frames.frame();assert.equal(heard.at(-1).location,'new-root');
  transport.context.currentTime=0.75;transport.tick();
  transport.configure({...transport.config,notesEnabled:false,accompaniment:'drums'},true);
  transport.context.currentTime=1.1;transport.tick();
  transport.context.currentTime=1.266;frames.frame();assert.ok(heard.at(-1));
  transport.context.currentTime=1.268;frames.frame();assert.equal(heard.at(-1),null);
  transport.stop();
});
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

test('Stop retires the output only after the fade; loading resumes it',async t=>{
  const {transport}=await make(t,{countIn:false});
  transport.start();
  transport.stop();
  t.mock.timers.tick(20);
  assert.equal(transport.context.state,'running');
  t.mock.timers.tick(30);
  assert.equal(transport.context.state,'suspended');
  await transport.load([]);
  assert.equal(transport.context.state,'running');
  transport.start(false);
  t.mock.timers.tick(100);
  assert.equal(transport.context.state,'running');
  transport.stop();
});

test('a quick restart cancels the pending idle suspension',async t=>{
  const {transport}=await make(t,{countIn:false});
  transport.start();
  transport.stop();
  t.mock.timers.tick(10);
  await transport.load([]);
  transport.start(false);
  t.mock.timers.tick(100);
  assert.equal(transport.context.suspends,0);
  transport.stop();
});

test('closing cancels delayed suspension of a closed context',async t=>{
  const {transport}=await make(t,{countIn:false});
  await transport.close();
  t.mock.timers.tick(100);
  assert.equal(transport.context.state,'closed');
  assert.equal(transport.context.suspends,0);
});

test('resume waits for an idle suspension already in progress',async t=>{
  const {transport}=await make(t,{countIn:false});
  let finishSuspending,resumes=0;
  transport.context.suspend=()=>new Promise(resolve=>{finishSuspending=resolve;});
  transport.context.resume=async()=>{resumes++;};
  transport.stop();
  t.mock.timers.tick(50);
  const loading=transport.load([]);
  await Promise.resolve();
  assert.equal(resumes,0);
  finishSuspending();
  await loading;
  assert.equal(resumes,1);
  await transport.close();
});

test('startup preload decodes and prepares notes without activating output; Play reuses them',async()=>{
  let activations=0;
  const transport=new NativeAudioTransport(Context,{setAudioSessionActivity:async()=>{activations++;}}, {onNote(){}});
  const entries=[['guitar:8','root'],['drum:click','click']];
  const config={...transport.config,countIn:false,plan:{notes:[{sample:8,playbackRate:1}],loopStart:0,oneShotLength:1}};
  await transport.preload(entries,config);
  const prepared=transport.prepared('guitar:8',NOTE_LEVEL,0.6,1);
  assert.equal(activations,0);
  assert.equal(transport.context.resumes,0);
  assert.equal(transport.context.state,'suspended');
  assert.equal(transport.buffers.size,2);
  assert.ok(prepared);
  transport.context.decodeAudioData=async()=>{throw Error('A cached sample must not be decoded again');};
  await transport.load(entries,config);
  assert.equal(activations,1);
  assert.equal(transport.context.resumes,1);
  assert.equal(transport.prepared('guitar:8',NOTE_LEVEL,0.6,1),prepared);
  await transport.close();
});

test('a failed preload stays suspended and can be retried',async()=>{
  let activations=0;
  const transport=new NativeAudioTransport(Context,{setAudioSessionActivity:async()=>{activations++;}}, {onNote(){}});
  const decode=transport.context.decodeAudioData;
  transport.context.decodeAudioData=async()=>{throw Error('Temporary decode failure');};
  await assert.rejects(transport.preload([['guitar:8','root']]),/Temporary decode failure/);
  assert.equal(activations,0);
  assert.equal(transport.context.state,'suspended');
  transport.context.decodeAudioData=decode;
  await transport.preload([['guitar:8','root']]);
  assert.equal(transport.buffers.size,1);
  await transport.close();
});

test('independent mixer buses route notes and percussion without changing prepared PCM or the musical clock', async t => {
  const { transport } = await make(t, { countIn: false, accompaniment: 'drums' });
  const createGain = transport.context.createGain.bind(transport.context);
  transport.context.createGain = () => {
    const gain = createGain();
    gain.connect = target => { gain.destination = target; };
    return gain;
  };
  transport.start(false);
  for (const { key, release } of transport.sources.values()) {
    assert.equal(release.destination, key.startsWith('guitar:') ? transport.notesGain : transport.accompanimentGain);
  }
  const grid = { origin: transport.origin, beat: transport.nextBeat, note: transport.nextNote, index: transport.timeline.index, count: transport.countBeats };
  const sources = transport.sources.size;
  const buffers = transport.rendered.size;
  transport.setVolumes({ notesVolume: 0, accompanimentVolume: 0.4 });
  assert.equal(transport.volumeRamps.get(transport.notesGain).to, 0);
  assert.equal(transport.volumeRamps.get(transport.accompanimentGain).to, 0.4);
  assert.deepEqual({ origin: transport.origin, beat: transport.nextBeat, note: transport.nextNote, index: transport.timeline.index, count: transport.countBeats }, grid);
  assert.equal(transport.sources.size, sources);
  assert.equal(transport.rendered.size, buffers);
  assert.deepEqual(transport.context.stops, []);
  transport.stop();
});

test('rapid volume changes continue from the interpolated level instead of jumping or restarting voices', async t => {
  const { transport } = await make(t, { countIn: false });
  transport.start(false);
  transport.context.currentTime = 1;
  transport.setVolumes({ notesVolume: 0, accompanimentVolume: 1 });
  transport.context.currentTime = 1.01;
  transport.setVolumes({ notesVolume: 0.8, accompanimentVolume: 1 });
  const ramp = transport.volumeRamps.get(transport.notesGain);
  assert.ok(Math.abs(ramp.from - 0.5) < 1e-9);
  assert.equal(ramp.to, 0.8);
  assert.equal(ramp.end, 1.03);
  assert.equal(transport.volumeRamps.get(transport.accompanimentGain).to, 1);
  assert.deepEqual(transport.context.stops, []);
  transport.stop();
});
