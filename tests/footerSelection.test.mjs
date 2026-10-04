import assert from "node:assert/strict";
import test from "node:test";

import {
  footerDegreeIndexAtX,
  isDegreeChoiceSelected,
  paintDegreeChoices,
} from "../src/utils/footerSelection.mjs";

const choices = [{ d: 0 }, { d: 1 }, { d: 3.1, e: 3 }, { d: 4 }];

test("footer drag coordinates map across every degree button", () => {
  assert.equal(footerDegreeIndexAtX(0, 400, 4), 0);
  assert.equal(footerDegreeIndexAtX(199, 400, 4), 1);
  assert.equal(footerDegreeIndexAtX(399, 400, 4), 3);
  assert.equal(footerDegreeIndexAtX(500, 400, 4), 3);
});

test("footer selection painting adds each crossed degree without toggling it twice", () => {
  assert.deepEqual(paintDegreeChoices([0], choices, [0, 1, 2, 2], true), [0, 1, 3]);
  assert.equal(isDegreeChoiceSelected([3], choices[2]), true);
});

test("starting a drag on a selected degree can erase crossed degrees", () => {
  assert.deepEqual(paintDegreeChoices([0, 1, 3, 4], choices, [1, 2, 3], false), [0]);
});
