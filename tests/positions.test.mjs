import test from "node:test";
import assert from "node:assert/strict";

import { getPosition, POSITION_ORDER, positionForFret, positionStartFret, stepPosition } from "../src/utils/positions.mjs";

test("positions follow the released seven-position order and wrap", () => {
  assert.deepEqual(POSITION_ORDER, [0, 2, 4, 6, 1, 3, 5]);
  assert.equal(stepPosition(0, -1), 5);
  assert.equal(stepPosition(5, 1), 0);
  assert.equal(stepPosition(4, 1), 6);
});

test("released position titles and colors are preserved", () => {
  assert.deepEqual(
    POSITION_ORDER.map((id) => [getPosition(id).title, getPosition(id).color]),
    [
      ["6TH STRING // PINKY", "green"],
      ["6TH STRING // MIDDLE", "green"],
      ["6TH STRING // INDEX", "green"],
      ["4TH STRING // INDEX", "yellow"],
      ["5TH STRING // PINKY", "purple"],
      ["5TH STRING // MIDDLE", "purple"],
      ["5TH STRING // INDEX", "purple"],
    ],
  );
});

test("position starts transpose with the selected key", () => {
  assert.equal(positionStartFret(0, 0), 0);
  assert.equal(positionStartFret(1, 0), 7);
  assert.equal(positionStartFret(5, 3), 2);
});

test("phone fret taps choose the nearest canonical position", () => {
  assert.equal(positionForFret(0, 0), 0);
  assert.equal(positionForFret(4, 0), 4);
  assert.equal(positionForFret(11, 0), 5);
  assert.equal(positionForFret(5, 3), 2);
});
