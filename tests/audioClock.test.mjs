import assert from "node:assert/strict";
import test from "node:test";

import { getMissedBeatCount, getNextBeatDelay } from "../src/utils/audioClock.mjs";

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
