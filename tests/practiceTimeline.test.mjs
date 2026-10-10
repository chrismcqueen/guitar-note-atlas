import test from 'node:test';
import assert from 'node:assert/strict';
import { PracticeTimeline } from '../src/utils/practiceTimeline.mjs';
import { NOTE_RATES } from '../src/utils/audioSequence.mjs';

const plan={notes:[{sample:8,midi:48}],loopStart:0,oneShotLength:1};
const config={plan,tempo:100,noteRate:'quarter',notesEnabled:true,loop:true,accompaniment:'metronome',countIn:false};

for(const rate of NOTE_RATES) test(`${rate.id} shares exact clock positions with the click over ten minutes`,()=>{
  const clock=new PracticeTimeline();clock.start(0.1,{...config,noteRate:rate.id});
  const events=clock.events(0,600);
  const beats=new Set(events.filter(e=>e.kind==='beat').map(e=>e.time));
  const notes=events.filter(e=>e.kind==='note');
  for(let i=0;i<notes.length;i++) {
    const position=i*rate.beats;
    if(Math.abs(position-Math.round(position))<1e-9) assert.ok(beats.has(notes[i].time));
    assert.ok(Math.abs(notes[i].time-(0.1+position*0.6))<1e-9);
  }
});

test('rapid tempo/subdivision updates re-anchor both lanes on the same beat',()=>{
  const clock=new PracticeTimeline();clock.start(0.1,config);
  let events=clock.events(0,0.25);
  clock.configure({...config,tempo:137,noteRate:'dotted-eighth'},0.2);
  clock.configure({...config,tempo:83,noteRate:'eighth-triplet'},0.3);
  events.push(...clock.events(0.3,3));
  clock.configure({...config,tempo:211,noteRate:'sixteenth'},2.8);
  events.push(...clock.events(2.8,8));
  let origin=0.1,tempo=100,step=1,index=0;
  const beats=new Set(events.filter(e=>e.kind==='beat').map(e=>e.time));
  for(const event of events) {
    if(event.kind==='change') {origin=event.time;tempo=event.config.tempo;step=NOTE_RATES.find(r=>r.id===event.config.noteRate).beats;index=0;}
    if(event.kind==='note') {
      const position=index++*step;
      assert.ok(Math.abs(event.time-(origin+position*60/tempo))<1e-9);
      if(Math.abs(position-Math.round(position))<1e-9) assert.ok(beats.has(event.time));
    }
  }
});

test('adding notes to accompaniment joins the next shared beat without another count-in',()=>{
  const clock=new PracticeTimeline();clock.start(0.1,{...config,notesEnabled:false});
  clock.events(0,0.25);clock.configure(config,0.2,true);
  const events=clock.events(0.4,0.9);
  assert.equal(events.find(e=>e.kind==='note').time,events.find(e=>e.kind==='beat').time);
  assert.equal(clock.countBeats,0);
});

test('tempo changes during count-in keep notes behind all four clicks',()=>{
  const clock=new PracticeTimeline();clock.start(0.1,{...config,countIn:true});
  const events=clock.events(0,0.25);
  clock.configure({...config,countIn:true,tempo:90,noteRate:'eighth'},0.2);
  events.push(...clock.events(0.3,4));
  assert.equal(events.filter(e=>e.kind==='beat'&&e.count>0).length,4);
  assert.equal(events.find(e=>e.kind==='note').time,events.find(e=>e.kind==='beat'&&e.count===0).time);
});
