import assert from 'node:assert/strict';
import test from 'node:test';
import { clampVolume, fallbackSourceVolume, hasPlaybackChanges, sliderFromVolume, sourceMixVolume, volumeDecibels, volumeFromSlider } from '../src/utils/audioMix.mjs';

test('audio taper has exact mute/full endpoints and a -20 dB midpoint', () => {
  assert.equal(volumeFromSlider(0), 0);
  assert.equal(volumeFromSlider(1), 1);
  assert.ok(Math.abs(volumeFromSlider(0.5) - 0.1) < 1e-12);
  assert.equal(volumeDecibels(volumeFromSlider(0.5)), '-20 dB');
  assert.equal(volumeDecibels(volumeFromSlider(0.25)), '-40 dB');
  assert.equal(volumeDecibels(0), 'Mute');
  assert.equal(volumeDecibels(1), '0 dB');
  assert.equal(volumeFromSlider(-1), 0);
  assert.equal(volumeFromSlider(2), 1);
});

test('taper is continuous, increases steadily, and preserves saved linear mixer levels', () => {
  let previous = -1;
  for (let i = 0; i <= 1000; i++) {
    const gain = i / 1000;
    const position = sliderFromVolume(gain);
    assert.ok(position > previous);
    assert.ok(Math.abs(volumeFromSlider(position) - gain) < 1e-12);
    previous = position;
  }
  assert.ok(volumeFromSlider(0.05) < 0.001, 'fine low-level control without an audible mute jump');
});

test('volume defaults preserve existing saved settings and clamp independently to silence/full level', () => {
  for (const value of [undefined, null, '', NaN, 'bad']) assert.equal(clampVolume(value), 1);
  assert.equal(clampVolume(0), 0);
  assert.equal(clampVolume(-0.3), 0);
  assert.equal(clampVolume(1.2), 1);
  assert.equal(clampVolume('0.35'), 0.35);
});

test('note and accompaniment levels apply only to their own sources, including click and tap/count sounds', () => {
  const config = { notesVolume: 0, accompanimentVolume: 0.5, accompaniment: 'drums' };
  assert.equal(sourceMixVolume('guitar:8', config, 0.92), 0);
  assert.equal(fallbackSourceVolume('drum:click', config), 0.15);
  assert.equal(fallbackSourceVolume('drum:kick', config), 0.24);
  assert.equal(fallbackSourceVolume('drum:snare', config), 0.225);
  assert.equal(fallbackSourceVolume('drum:hat', config), 0.04);
  assert.equal(fallbackSourceVolume('guitar:8', { ...config, notesVolume: 1, accompanimentVolume: 0 }), 0.64);
  assert.equal(fallbackSourceVolume('guitar:8', { accompaniment: 'off' }), 0.92);
});

test('mixer-only updates do not require playback preparation, while musical changes still do', () => {
  const plan = { notes: [] };
  const previous = { plan, tempo: 100, noteRate: 'quarter', accompaniment: 'drums', notesEnabled: true };
  assert.equal(hasPlaybackChanges(previous, { ...previous, notesVolume: 0.5, accompanimentVolume: 0 }), false);
  for (const update of [{ tempo: 120 }, { noteRate: 'eighth' }, { accompaniment: 'off' }, { notesEnabled: false }, { plan: { notes: [] } }]) {
    assert.equal(hasPlaybackChanges(previous, { ...previous, ...update }), true);
  }
});
