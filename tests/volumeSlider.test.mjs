import assert from 'node:assert/strict';
import test from 'node:test';
import { isSliderDrag, sliderPositionAtX, sliderPositionForGesture } from '../src/utils/volumeSlider.mjs';
import { shouldScrollSettings } from '../src/utils/settingsScroll.mjs';

test('slider taps use inset endpoints, clamp outside the track, and fit phone/tablet widths', () => {
  for (const width of [260, 298]) {
    assert.equal(sliderPositionAtX(12, width), 0);
    assert.equal(sliderPositionAtX(width - 12, width), 1);
    assert.equal(sliderPositionAtX(width / 2, width), 0.5);
    assert.equal(sliderPositionAtX(-100, width), 0);
    assert.equal(sliderPositionAtX(width + 100, width), 1);
  }
});

test('rotated phone/tablet slider gestures share app horizontal direction without capturing vertical scrolling', () => {
  for (const rotated of [true, false]) {
    const right = rotated ? { dx: 1, dy: 59 } : { dx: 59, dy: 1 };
    const left = rotated ? { dx: 1, dy: -59 } : { dx: -59, dy: 1 };
    const up = rotated ? { dx: 59, dy: 1 } : { dx: 1, dy: -59 };
    assert.equal(sliderPositionForGesture(130, right, rotated, 260), 0.75);
    assert.equal(sliderPositionForGesture(130, left, rotated, 260), 0.25);
    assert.equal(isSliderDrag(right, rotated), true);
    assert.equal(shouldScrollSettings(right, rotated, 200), false);
    assert.equal(isSliderDrag(up, rotated), false);
    assert.equal(shouldScrollSettings(up, rotated, 200), true);
    assert.equal(isSliderDrag({ dx: 1, dy: 1 }, rotated), false);
  }
});
