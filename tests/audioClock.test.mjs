import assert from "node:assert/strict";
import test from "node:test";

import { getMissedBeatCount, getNextBeatDelay, getNextGridTime } from "../src/utils/audioClock.mjs";

test("does not skip a beat for ordinary timer jitter", () => {
  assert.equal(getMissedBeatCount(1012, 1000, 500), 0);
  assert.equal(getNextBeatDelay(1012, 1000, 500), 488);
});

test("skips overdue beats instead of scheduling a catch-up burst", () => {
  assert.equal(getMissedBeatCount(2210, 1000, 500), 2);
  assert.equal(getNextBeatDelay(2210, 1000, 500, 2), 290);
});

test("a clock adjustment before the deadline never produces a negative delay", () => {
  assert.equal(getMissedBeatCount(900, 1000, 500), 0);
  assert.equal(getNextBeatDelay(900, 1000, 500), 600);
});

test("shared transport events quantize to the same native clock grid", () => {
  assert.equal(getNextGridTime(10, 10.1, 0.5), 10.5);
  assert.equal(getNextGridTime(10, 11.5, 0.5), 11.5);
  assert.equal(getNextGridTime(10, 11.51, 2), 12);
  assert.equal(getNextGridTime(10, 9.9, 0.5), 10);
});
