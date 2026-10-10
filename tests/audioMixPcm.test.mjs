import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { DRUM_LEVELS, MASTER_VOLUME, NOTE_LEVEL } from '../src/utils/audioMix.mjs';
import { MIN_TEMPO, MAX_TEMPO } from '../src/utils/audioSequence.mjs';
import { renderNotePcm } from '../src/utils/notePcm.mjs';

const context = { createBuffer(channels, length, sampleRate) {
  const data = Array.from({ length: channels }, () => new Float32Array(length));
  return { numberOfChannels: channels, sampleRate, length, duration: length / sampleRate,
    getChannelData: channel => data[channel], copyToChannel: (samples, channel) => data[channel].set(samples) };
} };
const readSample = (name) => {
  const file = readFileSync(new URL(`../assets/audio/${name}.wav`, import.meta.url));
  let format, samples;
  for (let offset = 12; offset + 8 <= file.length;) {
    const size = file.readUInt32LE(offset + 4);
    const chunk = file.toString('ascii', offset, offset + 4);
    if (chunk === 'fmt ') format = file.subarray(offset + 8, offset + 8 + size);
    if (chunk === 'data') samples = file.subarray(offset + 8, offset + 8 + size);
    offset += 8 + size + size % 2;
  }
  assert.equal(format.readUInt16LE(0), 1, 'fixture is PCM');
  assert.equal(format.readUInt16LE(2), 1, 'fixture is mono');
  assert.equal(format.readUInt16LE(14), 16, 'fixture is 16-bit');
  const output = context.createBuffer(1, samples.length / 2, format.readUInt32LE(4));
  const data = output.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = samples.readInt16LE(i * 2) / 32768;
  return output;
};
const peak = data => data.reduce((maximum, value) => Math.max(maximum, Math.abs(value)), 0);
const drums = Object.fromEntries(Object.keys(DRUM_LEVELS).map(key => [key, readSample(`drums/${key}`)]));
const guitars = Array.from({ length: 25 }, (_, index) => readSample(`guitar/${index + 8}`));

test('actual prepared click/kick/snare peaks are close to every guitar sample at full volume', () => {
  const percussionPeaks = ['click', 'kick', 'snare'].map(key =>
    peak(renderNotePcm(context, drums[key], 1, undefined, DRUM_LEVELS[key]).getChannelData(0)) * MASTER_VOLUME);
  for (const guitar of guitars) {
    const notePeak = peak(renderNotePcm(context, guitar, 1, 0.5, NOTE_LEVEL).getChannelData(0)) * MASTER_VOLUME;
    for (const drumPeak of percussionPeaks) {
      assert.ok(Math.abs(20 * Math.log10(drumPeak / notePeak)) < 4, `peaks ${drumPeak}/${notePeak} differ by less than 4 dB`);
    }
  }
});

test('full-volume mix leaves headroom at every supported tempo, including overlapping hat tails', () => {
  // Absolute drum samples plus the largest possible guitar sample form a
  // conservative bound regardless of note subdivision, pitch or relative phase.
  // Raw samples also bound native attack/release envelopes and linear resampling.
  const noteCeiling = Math.max(...guitars.map(guitar => peak(guitar.getChannelData(0)))) * NOTE_LEVEL;
  const sampleRate = drums.hat.sampleRate;
  for (const mode of ['metronome', 'drums']) {
    for (let tempo = MIN_TEMPO; tempo <= MAX_TEMPO; tempo++) {
      const beatFrames = 60 / tempo * sampleRate;
      const mix = new Float32Array(Math.ceil(beatFrames * 4));
      for (let beat = -1; beat < 4; beat++) {
        const sounds = mode === 'metronome' ? ['click'] : ['hat', ...(beat === 0 ? ['kick'] : beat === 2 ? ['snare'] : [])];
        for (const key of sounds) {
          const data = drums[key].getChannelData(0);
          const start = Math.round(beat * beatFrames);
          for (let i = Math.max(0, -start); i < data.length && start + i < mix.length; i++) {
            mix[start + i] += Math.abs(data[i]) * DRUM_LEVELS[key];
          }
        }
      }
      const ceiling = (peak(mix) + noteCeiling) * MASTER_VOLUME;
      assert.ok(ceiling < 0.92, `${mode} at ${tempo} BPM stays below 0.92 (${ceiling})`);
    }
  }
});
