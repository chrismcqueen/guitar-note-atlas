import test from "node:test";
import assert from "node:assert/strict";

import { findMatchingScale, getNoteName, getScaleDegreeLabel, normalizePitchClass } from "../src/utils/music.mjs";

test("normalizes pitch classes in both directions", () => {
  assert.equal(normalizePitchClass(13), 1);
  assert.equal(normalizePitchClass(-1), 11);
  assert.equal(normalizePitchClass(24), 0);
});

test("preserves enharmonic scale-degree spellings", () => {
  assert.equal(getScaleDegreeLabel(3), "b3");
  assert.equal(getScaleDegreeLabel(3.1), "#2");
  assert.equal(getScaleDegreeLabel(8.1), "#5");
});

test("formats note names with the requested accidental spelling", () => {
  assert.equal(getNoteName(1), "C#");
  assert.equal(getNoteName(1, true), "Db");
  assert.equal(getNoteName(13, true), "Db");
});

test("matches only exact known degree sets", () => {
  const scales = {
    scales: [{ title: "Major", degrees: [0, 2, 4, 5, 7, 9, 11] }],
    modes: [{ title: "Dorian", degrees: [0, 2, 3, 5, 7, 9, 10] }],
  };

  assert.equal(findMatchingScale([0, 2, 4, 5, 7, 9, 11], scales).title, "Major");
  assert.equal(findMatchingScale([0, 2, 3], scales), undefined);
});
