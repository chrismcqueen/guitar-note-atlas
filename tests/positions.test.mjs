import test from "node:test";
import assert from "node:assert/strict";

import { fretForNeckX, getPosition, POSITION_ORDER, positionBandFrets, positionBandVerticalGeometry, positionDisplayFret, positionForFret, positionSelectionTargets, positionStartFret, positionTargetForFret, positionTargets, resolvedPositionFret, stepPosition, stepPositionTarget } from "../src/utils/positions.mjs";

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

test("position anchors repeat visually while touch selection stops after one cycle", () => {
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
  assert.equal(positionForFret(14, 0), 1);
});

test("overview neck touch coordinates map to frets in either handedness", () => {
  assert.equal(fretForNeckX(40, 864), 0);
  assert.equal(fretForNeckX(40 + 7 * 49 + 1, 864), 7);
  assert.equal(fretForNeckX(40 + 7 * 49 + 1, 864, true), 9);
  assert.equal(fretForNeckX(-100, 864), 0);
  assert.equal(fretForNeckX(1000, 864), 16);
});

test("full-neck selection stops after one complete position cycle", () => {
  assert.deepEqual(positionTargetForFret(0, 0), { fret: 0, id: 3, distance: 0 });
  assert.deepEqual(positionTargetForFret(12, 0), { fret: 10, id: 1, distance: 2 });
  assert.deepEqual(positionTargetForFret(16, 0), { fret: 10, id: 1, distance: 6 });
  assert.equal(resolvedPositionFret(3, 12, 0), 0);
  assert.equal(resolvedPositionFret(3, 99, 0), 0);
});

test("position navigation moves linearly and stops at visible neck ends", () => {
  assert.deepEqual(stepPositionTarget(3, 0, -1, 0), { fret: 0, id: 3 });
  assert.deepEqual(stepPositionTarget(3, 0, 1, 0), { fret: 2, id: 5 });
  assert.deepEqual(stepPositionTarget(1, 10, 1, 0), { fret: 10, id: 1 });

  for (let keyOffset = 0; keyOffset < 12; keyOffset += 1) {
    const targets = positionSelectionTargets(keyOffset);
    const visibleIds = new Set(targets.map(({ id }) => id));
    assert.equal(targets.length, POSITION_ORDER.length, `key ${keyOffset} target count`);
    assert.equal(POSITION_ORDER.every((id) => visibleIds.has(id)), true, `key ${keyOffset}`);
  }
});

test("selected position windows stay fully inside the visible neck", () => {
  assert.equal(positionDisplayFret(1, 11, 1), 10);
  assert.equal(positionDisplayFret(4, 11, 4), 11);
  assert.equal(positionDisplayFret(3, 0, 0), 0);
});

test("every primary color band opens its matching index position in every key", () => {
  for (let keyOffset = 0; keyOffset < 12; keyOffset += 1) {
    for (const [pitch, positionId] of [[4, 4], [6, 6], [11, 5]]) {
      const primaryFret = positionBandFrets(pitch, keyOffset).find((fret) => positionSelectionTargets(keyOffset).some((target) => target.fret === fret));
      if (primaryFret !== undefined) assert.equal(positionForFret(primaryFret, keyOffset), positionId, `key ${keyOffset}, fret ${primaryFret}`);
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

test("position color bands preserve released vertical sizing", () => {
  assert.deepEqual(positionBandVerticalGeometry({ height: 5, stringGap: 36, verticalOffset: 14 }), { height: 208, y: 0 });
  assert.deepEqual(positionBandVerticalGeometry({ height: 4, stringGap: 36, upsideDown: true, verticalOffset: 14 }), { height: 172, y: 36 });
  assert.deepEqual(positionBandVerticalGeometry({ height: 3, stringGap: 36, upsideDown: true, verticalOffset: 14 }), { height: 136, y: 72 });
  assert.deepEqual(positionBandVerticalGeometry({ bassMode: true, height: 5, stringGap: 52, verticalOffset: 20 }), { height: 175, y: 22.36 });
});
