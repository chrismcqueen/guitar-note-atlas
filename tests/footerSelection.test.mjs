import assert from "node:assert/strict";
import test from "node:test";

import {
  degreeIndicesBetween,
  footerDegreeIndexAtX,
  footerDegreeIndexFromGestureX,
  footerGestureDistance,
  isDegreeChoiceSelected,
  paintDegreeChoices,
  paintDegreeRange,
  toggleDegreeRange,
} from "../src/utils/footerSelection.mjs";

const choices = [{ d: 0 }, { d: 1 }, { d: 3.1, e: 3 }, { d: 4 }];

test("footer drag coordinates map across every degree button", () => {
  assert.equal(footerDegreeIndexAtX(0, 400, 4), 0);
  assert.equal(footerDegreeIndexAtX(199, 400, 4), 1);
  assert.equal(footerDegreeIndexAtX(399, 400, 4), 3);
  assert.equal(footerDegreeIndexAtX(500, 400, 4), 3);
});

test("footer swipes include every crossed button in either direction", () => {
  assert.deepEqual(degreeIndicesBetween(1, 3), [1, 2, 3]);
  assert.deepEqual(degreeIndicesBetween(3, 1), [1, 2, 3]);
});

test("right-to-left gesture coordinates remain relative to their starting button", () => {
  assert.equal(footerDegreeIndexFromGestureX(25, 1200, 12, 10), 10);
  assert.equal(footerDegreeIndexFromGestureX(-75, 1200, 12, 10), 9);
  assert.equal(footerDegreeIndexFromGestureX(-275, 1200, 12, 10), 7);
});

test("footer gesture distance follows the platform's continuous screen axis", () => {
  const start = { x: 100, y: 200 };
  const current = { x: 160, y: 120 };
  assert.equal(footerGestureDistance(start, current), 60);
  assert.equal(footerGestureDistance(start, current, true), -80);
});

test("footer selection painting adds each crossed degree without toggling it twice", () => {
  assert.deepEqual(paintDegreeChoices([0], choices, [0, 1, 2, 2], true), [0, 1, 3]);
  assert.equal(isDegreeChoiceSelected([3], choices[2]), true);
});

test("starting a drag on a selected degree can erase crossed degrees", () => {
  assert.deepEqual(paintDegreeChoices([0, 1, 3, 4], choices, [1, 2, 3], false), [0]);
});

test("reversing a footer swipe restores choices that leave the live range", () => {
  const initial = [0];
  assert.deepEqual(paintDegreeRange(initial, choices, 1, 3, true), [0, 1, 3, 4]);
  assert.deepEqual(paintDegreeRange(initial, choices, 1, 2, true), [0, 1, 3]);
  assert.deepEqual(paintDegreeRange(initial, choices, 1, 0, true), [0, 1]);
});

test("reversing an erase swipe reselects degree one after it leaves the live range", () => {
  const initial = [0, 1, 3, 4];
  assert.deepEqual(paintDegreeRange(initial, choices, 3, 0, false), []);
  assert.deepEqual(paintDegreeRange(initial, choices, 3, 1, false), [0]);
});

test("footer swipes toggle every crossed choice from its initial state", () => {
  assert.deepEqual(toggleDegreeRange([0, 3], choices, 0, 3), [1, 4]);
  assert.deepEqual(toggleDegreeRange([0, 3], choices, 0, 1), [1, 3]);
});

test("swiping an active enharmonic choice turns it fully off", () => {
  assert.deepEqual(toggleDegreeRange([3], choices, 2, 2), []);
  assert.deepEqual(toggleDegreeRange([3.1], choices, 2, 2), []);
});
