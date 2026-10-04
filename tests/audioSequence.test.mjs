import assert from "node:assert/strict";
import test from "node:test";

import {
  buildScaleSequence,
  clampTempo,
  millisecondsPerBeat,
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
