import test from "node:test";
import assert from "node:assert/strict";

import { getPosition, POSITION_ORDER, positionBandFrets, positionForFret, positionStartFret, positionTargets, stepPosition } from "../src/utils/positions.mjs";

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
  assert.equal(positionStartFret(0, 0), 3);
  assert.equal(positionStartFret(1, 0), 10);
  assert.equal(positionStartFret(5, 3), 5);
});

test("phone fret targets follow the released A-based position anchors", () => {
  assert.deepEqual(positionTargets(0), [
    { fret: 0, id: 3 },
    { fret: 2, id: 5 },
    { fret: 3, id: 0 },
    { fret: 5, id: 2 },
    { fret: 7, id: 4 },
    { fret: 9, id: 6 },
    { fret: 10, id: 1 },
    { fret: 12, id: 3 },
    { fret: 14, id: 5 },
    { fret: 15, id: 0 },
  ]);

  assert.equal(positionForFret(3, 0), 0);
  assert.equal(positionForFret(7, 0), 4);
  assert.equal(positionForFret(9, 0), 6);
  assert.equal(positionForFret(14, 0), 5);
});

test("every visible color band opens its matching index position in every key", () => {
  for (let keyOffset = 0; keyOffset < 12; keyOffset += 1) {
    for (const [pitch, positionId] of [[4, 4], [6, 6], [11, 5]]) {
      for (const fret of positionBandFrets(pitch, keyOffset)) {
        assert.equal(positionForFret(fret, keyOffset), positionId, `key ${keyOffset}, fret ${fret}`);
      }
    }
  }
});

test("position color bands preserve the released A-based key offsets", () => {
  assert.deepEqual(positionBandFrets(4, 0), [7]);
  assert.deepEqual(positionBandFrets(6, 0), [9]);
  assert.deepEqual(positionBandFrets(11, 0), [2, 14]);

  assert.deepEqual(positionBandFrets(4, 6), [1, 13]);
  assert.deepEqual(positionBandFrets(6, 6), [3, 15]);
  assert.deepEqual(positionBandFrets(11, 6), [8]);

  assert.deepEqual(positionBandFrets(4, 11), [6]);
  assert.deepEqual(positionBandFrets(6, 11), [8]);
  assert.deepEqual(positionBandFrets(11, 11), [1, 13]);

  const releasedFrets = (pitch, keyOffset) => {
    const legacyOffset = (keyOffset + 3) % 12;
    let primary = pitch + legacyOffset;
    if (primary > 15) primary -= 12;

    const frets = [primary];
    if (pitch === 4 && legacyOffset > 7) frets.push(primary - 12);
    if (pitch === 6 && legacyOffset > 5 && legacyOffset < 10) frets.push(primary - 12);
    if (pitch === 11 && legacyOffset > 0 && legacyOffset < 5) frets.push(primary - 12);
    return frets.sort((a, b) => a - b);
  };

  for (let keyOffset = 0; keyOffset < 12; keyOffset += 1) {
    for (const pitch of [4, 6, 11]) {
      assert.deepEqual(
        [...positionBandFrets(pitch, keyOffset)].sort((a, b) => a - b),
        releasedFrets(pitch, keyOffset),
        `pitch ${pitch}, key offset ${keyOffset}`,
      );
    }
  }
});
