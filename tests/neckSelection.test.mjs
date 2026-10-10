import test from 'node:test';
import assert from 'node:assert/strict';
import { neckPointForTouch, positionTargetForNeckPoint } from '../src/utils/neckSelection.mjs';

const bounds = { width: 864, height: 175 };

test('position swipe retains its last target outside every neck edge and resumes on re-entry', () => {
  for (const height of [175, 233]) {
    for (const leftHand of [false, true]) {
      const size = { ...bounds, height };
      let selected = positionTargetForNeckPoint({ x: 300, y: 80 }, size, 0, leftHand);
      const retained = selected;
      for (const point of [{ x: 700, y: -1 }, { x: 100, y: height + 1 }, { x: -1, y: 80 }, { x: 865, y: 80 }]) {
        selected = positionTargetForNeckPoint(point, size, 0, leftHand) ?? selected;
        assert.equal(selected, retained);
      }
      selected = positionTargetForNeckPoint({ x: 520, y: 80 }, size, 0, leftHand) ?? selected;
      assert.notEqual(selected.id, retained.id);
      const reentered = selected;
      selected = positionTargetForNeckPoint({ x: 200, y: 80 }, size, 0, leftHand) ?? selected;
      assert.notEqual(selected.id, reentered.id);
    }
  }
});

test('stable screen coordinates track rotated phone/iPad and scaled upright tablet gestures', () => {
  for (const rotated of [false, true]) {
    for (const scale of [1, 0.55]) {
      const anchor = { pageX: 400, pageY: 600, x: 300, y: 80 };
      for (const point of [{ x: 700, y: -40 }, { x: 520, y: 80 }, { x: 200, y: 90 }]) {
        const dx = point.x - anchor.x, dy = point.y - anchor.y;
        const touch = {
          pageX: anchor.pageX + (rotated ? -dy : dx) * scale,
          pageY: anchor.pageY + (rotated ? dx : dy) * scale,
          locationX: 9999, locationY: -9999, // unrelated view's coordinates
        };
        const actual = neckPointForTouch(anchor, touch, { rotated, scale });
        assert.ok(Math.abs(actual.x - point.x) < 1e-9);
        assert.ok(Math.abs(actual.y - point.y) < 1e-9);
      }
    }
  }
});

test('neck hit testing uses the rendered dimensions and includes boundary points', () => {
  assert.equal(positionTargetForNeckPoint({ x: 0, y: 0 }, bounds, 0).id, 3);
  assert.equal(positionTargetForNeckPoint({ x: 864, y: 175 }, bounds, 0).id, 1);
  assert.equal(positionTargetForNeckPoint({ x: 150, y: 40 }, { width: 432, height: 87.5 }, 0).id,
    positionTargetForNeckPoint({ x: 300, y: 80 }, bounds, 0).id);
  for (const point of [{ x: NaN, y: 20 }, { x: 20, y: Infinity }]) {
    assert.equal(positionTargetForNeckPoint(point, bounds, 0), null);
  }
});
