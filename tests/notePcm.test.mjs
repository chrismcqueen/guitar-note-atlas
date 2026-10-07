import test from 'node:test';
import assert from 'node:assert/strict';
import { renderNotePcm } from '../src/utils/notePcm.mjs';
const context={createBuffer(channels,length,sampleRate){
  const data=Array.from({length:channels},()=>new Float32Array(length));
  return {sampleRate,length,numberOfChannels:channels,duration:length/sampleRate,getChannelData:c=>data[c],copyToChannel:(a,c)=>data[c].set(a)};
}};
for(const rate of [0.25,0.5,1,2]) test(`prepared pitch ${rate} has the right register and silent note boundaries`,()=>{
  const input=context.createBuffer(2,48000,48000);
  for(let c=0;c<2;c++) {const a=input.getChannelData(c);for(let i=0;i<a.length;i++)a[i]=Math.sin(2*Math.PI*440*i/48000)*(c?0.5:1);}
  const out=renderNotePcm(context,input,rate,0.3,0.92),data=out.getChannelData(0);
  assert.equal(out.duration,0.3);assert.equal(Math.abs(data[0]),0);assert.equal(Math.abs(data.at(-1)),0);
  let crossings=0;
  for(let i=961;i<12000;i++)if(data[i-1]<=0&&data[i]>0)crossings++;
  assert.ok(Math.abs(crossings-440*rate*(12000-960)/48000)<=1);
  for(let i=0;i<data.length;i++) {assert.ok(Math.abs(data[i])<=0.9200001);assert.equal(out.getChannelData(1)[i],data[i]*0.5);}
});
