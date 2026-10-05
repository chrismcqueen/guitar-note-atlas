import assert from "node:assert/strict";
import test from "node:test";

import {
  buildScaleSequence,
  clampTempo,
  millisecondsPerBeat,
  millisecondsPerNote,
  NOTE_RATES,
  normalizeNoteRate,
  normalizePlaybackIndex,
  tempoFromTapTimes,
} from "../src/utils/audioSequence.mjs";

test("audio sequence climbs to the octave and returns to the root", () => {
  const sequence = buildScaleSequence([0, 4, 7], 0);
  assert.deepEqual(sequence.map(({ sample }) => sample), [8, 12, 15, 20, 15, 12, 8]);
  assert.deepEqual(sequence.map(({ pitchClass }) => pitchClass), [0, 4, 7, 0, 7, 4, 0]);
});

test("enharmonic degree values select their chromatic pitch", () => {
  assert.deepEqual(
    buildScaleSequence([0, 3.1, 6.1], 11).map(({ sample }) => sample),
    [19, 22, 25, 31, 25, 22, 19],
  );
});

test("tempo uses one-BPM values inside a safe practice range", () => {
  assert.equal(clampTempo(39), 40);
  assert.equal(clampTempo(100.4), 100);
  assert.equal(clampTempo(241), 240);
  assert.equal(millisecondsPerBeat(120), 500);
});

test("note rates convert beat-based values into note durations", () => {
  assert.equal(millisecondsPerNote(120, "half"), 1000);
  assert.equal(millisecondsPerNote(120, "dotted-half"), 1500);
  assert.equal(millisecondsPerNote(120, "quarter"), 500);
  assert.equal(millisecondsPerNote(120, "dotted-quarter"), 750);
  assert.equal(millisecondsPerNote(120, "eighth"), 250);
  assert.equal(millisecondsPerNote(120, "dotted-eighth"), 375);
  assert.ok(Math.abs(millisecondsPerNote(120, "eighth-triplet") - (500 / 3)) < 0.0001);
  assert.equal(millisecondsPerNote(120, "sixteenth"), 125);
  assert.equal(normalizeNoteRate("unknown"), "quarter");
});

test("note-rate choices progress from shortest to longest", () => {
  assert.deepEqual(
    NOTE_RATES.map(({ id }) => id),
    ["sixteenth", "eighth-triplet", "eighth", "dotted-eighth", "quarter", "dotted-quarter", "half", "dotted-half"],
  );
  assert.ok(NOTE_RATES.every(({ beats }, index) => index === 0 || beats > NOTE_RATES[index - 1].beats));
});

test("tap tempo averages recent taps into a persisted BPM value", () => {
  assert.equal(tempoFromTapTimes([0]), null);
  assert.equal(tempoFromTapTimes([0, 500]), 120);
  assert.equal(tempoFromTapTimes([0, 500, 990, 1500]), 120);
  assert.equal(tempoFromTapTimes([0, 0]), null);
});

test("looping continues above the low root instead of repeating it", () => {
  assert.equal(normalizePlaybackIndex(6, 7, true), 6);
  assert.equal(normalizePlaybackIndex(7, 7, true), 1);
  assert.equal(normalizePlaybackIndex(13, 7, true), 1);
});

test("one-shot playback stops after sounding its final low root", () => {
  assert.equal(normalizePlaybackIndex(6, 7, false), 6);
  assert.equal(normalizePlaybackIndex(7, 7, false), 7);
});
