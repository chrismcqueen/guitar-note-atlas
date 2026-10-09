import assert from 'node:assert/strict';
import test from 'node:test';
import { clampVolume, fallbackSourceVolume, hasPlaybackChanges, sourceMixVolume } from '../src/utils/audioMix.mjs';

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
