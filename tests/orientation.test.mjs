import assert from "node:assert/strict";
import test from "node:test";

import {
  getLandscapeDimensions,
  getLandscapeInsets,
  isPortraitWindow,
} from "../src/utils/orientation.mjs";

test("normalizes portrait and landscape windows to one landscape canvas", () => {
  assert.equal(isPortraitWindow({ width: 402, height: 874 }), true);
  assert.equal(isPortraitWindow({ width: 874, height: 402 }), false);
  assert.deepEqual(getLandscapeDimensions({ width: 402, height: 874 }), { width: 874, height: 402 });
  assert.deepEqual(getLandscapeDimensions({ width: 874, height: 402 }), { width: 874, height: 402 });
});

test("maps clockwise-rotated portrait safe areas onto landscape edges", () => {
  const portraitInsets = { top: 59, right: 0, bottom: 34, left: 0 };
  assert.deepEqual(
    getLandscapeInsets(portraitInsets, { width: 402, height: 874 }),
    { top: 0, right: 59, bottom: 0, left: 34 },
  );
});

test("preserves native landscape safe areas in Expo Go and web-style previews", () => {
  const landscapeInsets = { top: 0, right: 59, bottom: 21, left: 59 };
  assert.deepEqual(
    getLandscapeInsets(landscapeInsets, { width: 874, height: 402 }),
    landscapeInsets,
  );
});
