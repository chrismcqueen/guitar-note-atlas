import assert from 'node:assert/strict';
import test from 'node:test';
import { getAudioPopoverLayout } from '../src/utils/audioPopoverLayout.mjs';

const base = { dimensions: { width: 852, height: 393 }, left: -10, top: 62, width: 292 };
const overlaps = (a, b) => a.left < b.x + b.width && a.left + a.width > b.x
  && a.top < b.y + b.height && a.top + a.maxHeight > b.y;

test('unobstructed audio card keeps its existing control anchor and scroll space', () => {
  assert.deepEqual(getAudioPopoverLayout({ ...base, obstructions: [] }),
    { left: 6, top: 62, width: 292, maxHeight: 319 });
});

test('iOS popover clears either notch edge and home indicator even if it uncovers controls', () => {
  for (const insets of [{ left: 34, right: 59 }, { left: 59, right: 34 }]) {
    const frame = getAudioPopoverLayout({ ...base, insets: { ...insets, top: 4, bottom: 8 } });
    assert.equal(frame.left, 65);
    assert.ok(frame.left + frame.width <= 852 - 65);
    assert.equal(frame.top + frame.maxHeight, 393 - 8 - 12);
  }
});

test('Android cutout crossing the card top moves it sideways instead of covering its header', () => {
  const cutout = { x: 0, y: 40, width: 50, height: 60 };
  const frame = getAudioPopoverLayout({ ...base, obstructions: [cutout] });
  assert.equal(frame.left, 56);
  assert.equal(frame.top, base.top);
  assert.equal(frame.maxHeight, 319);
  assert.equal(overlaps(frame, cutout), false);
});

test('Android card avoids lower cameras, centered cutouts and system bars after window resizing', () => {
  for (const dimensions of [{ width: 568, height: 320 }, { width: 1200, height: 800 }]) {
    const rects = [
      { x: 0, y: dimensions.height - 55, width: 50, height: 55 },
      { x: dimensions.width - 45, y: 0, width: 45, height: 90 },
      { x: dimensions.width / 2 - 30, y: 0, width: 60, height: 75 },
      { x: 0, y: 0, width: dimensions.width, height: 28 },
      { x: 0, y: dimensions.height - 24, width: dimensions.width, height: 24 },
    ];
    const frame = getAudioPopoverLayout({ ...base, dimensions, top: 20, obstructions: rects });
    assert.ok(frame.left >= 6 && frame.left + frame.width <= dimensions.width - 6);
    assert.ok(frame.top >= 34 && frame.maxHeight >= 160);
    assert.ok(frame.top + frame.maxHeight <= dimensions.height - 30);
    for (const rect of rects) assert.equal(overlaps(frame, rect), false);
  }
});

test('iOS card shrinks its width only when the safe viewport is narrower than the preferred card', () => {
  const frame = getAudioPopoverLayout({ ...base, dimensions: { width: 360, height: 320 }, insets: { left: 40, right: 40 } });
  assert.equal(frame.left, 46);
  assert.equal(frame.width, 268);
});
