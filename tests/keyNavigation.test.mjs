import assert from "node:assert/strict";
import test from "node:test";

import {
  KEY_NAVIGATION_MODES,
  keyStepForMode,
  nextKeyOffset,
} from "../src/utils/keyNavigation.mjs";

test("chromatic navigation advances one semitone and wraps", () => {
  assert.equal(nextKeyOffset(11, "right", KEY_NAVIGATION_MODES.CHROMATIC), 0);
  assert.equal(nextKeyOffset(0, "left", KEY_NAVIGATION_MODES.CHROMATIC), 11);
});

test("circle navigation moves right by fifths and left by fourths", () => {
  assert.equal(nextKeyOffset(0, "right", KEY_NAVIGATION_MODES.CIRCLE), 7);
  assert.equal(nextKeyOffset(0, "left", KEY_NAVIGATION_MODES.CIRCLE), 5);
});

test("both navigation modes visit every key before returning", () => {
  for (const mode of Object.values(KEY_NAVIGATION_MODES)) {
    const visited = new Set();
    let offset = 0;

    for (let index = 0; index < 12; index += 1) {
      visited.add(offset);
      offset = nextKeyOffset(offset, "right", mode);
    }

    assert.equal(visited.size, 12);
    assert.equal(offset, 0);
  }
});

test("unknown persisted modes safely fall back to chromatic", () => {
  assert.equal(keyStepForMode(undefined), 1);
  assert.equal(keyStepForMode("future-mode"), 1);
});
