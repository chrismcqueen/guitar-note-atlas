import assert from 'node:assert/strict';
import test from 'node:test';
import { getSplashLayout } from '../src/utils/splashLayout.mjs';
import { getAppViewport } from '../src/utils/orientation.mjs';
import { getViewportObstructions } from '../src/utils/displayGeometry.mjs';

test('splash artwork fits safe bounds and lifts the faded neck on phones and tablets', () => {
  for (const dimensions of [{ width: 568, height: 320 }, { width: 667, height: 375 }, { width: 852, height: 393 }, { width: 1194, height: 834 }, { width: 1800, height: 550 }]) {
    for (const insets of [{ left: 0, right: 0, top: 0, bottom: 0 }, { left: 34, right: 59, top: 4, bottom: 8 }]) {
      const layout = getSplashLayout(dimensions, insets);
      for (const frame of [layout.title, layout.neck, layout.error]) {
        assert.ok(frame.left >= Math.max(insets.left, insets.right) + 12);
        assert.ok(frame.right >= Math.max(insets.left, insets.right) + 12);
        assert.ok(frame.left + frame.right < dimensions.width);
      }
      assert.equal(layout.title.top, insets.top);
      assert.ok(layout.neck.bottom - insets.bottom >= 12 && layout.neck.bottom - insets.bottom <= 24);
      assert.ok(layout.title.top + layout.title.height < dimensions.height - layout.neck.bottom - layout.neck.height);
      assert.equal(layout.neck.height, (dimensions.height - insets.top - insets.bottom) * 0.2);
    }
  }
});

test('Pixel lower-corner camera moves only splash artwork that intersects it', () => {
  const root = { width: 1080 / 2.75, height: 2340 / 2.75 };
  const viewport = getAppViewport({ window: root, screen: root, platform: 'android' });
  const rects = getViewportObstructions({ ...root, rects: [{ x: 0, y: 0, width: 136 / 2.75, height: 136 / 2.75 }] }, viewport);
  const layout = getSplashLayout(viewport.dimensions, {}, rects);
  assert.equal(layout.title.left, 12);
  assert.equal(layout.title.right, 12);
  assert.equal(layout.neck.left, 136 / 2.75 + 12);
  assert.equal(layout.neck.right, 12);
  assert.equal(layout.error.left, layout.neck.left);
});

test('splash clears side cameras, opposite corners and visible bars in their own regions', () => {
  const dimensions = { width: 800, height: 400 };
  const layout = getSplashLayout(dimensions, {}, [
    { x: 0, y: 120, width: 45, height: 40 },
    { x: 760, y: 340, width: 40, height: 45 },
    { x: 0, y: 0, width: 800, height: 20 },
    { x: 0, y: 380, width: 800, height: 20 },
  ]);
  assert.equal(layout.title.top, 32);
  assert.equal(layout.title.left, 57);
  assert.equal(layout.title.right, 12);
  assert.equal(layout.neck.left, 12);
  assert.equal(layout.neck.right, 52);
  assert.ok(layout.neck.bottom >= 44);
  assert.ok(layout.error.bottom >= 52);
});

test('centered tablet edge cutouts reduce vertical space without reserving an entire side', () => {
  const dimensions = { width: 1200, height: 800 };
  const layout = getSplashLayout(dimensions, {}, [
    { x: 570, y: 0, width: 60, height: 28 },
    { x: 575, y: 775, width: 50, height: 25 },
  ]);
  assert.equal(layout.title.top, 40);
  assert.ok(layout.neck.bottom > 37);
  assert.equal(layout.title.left, 12);
  assert.equal(layout.neck.right, 12);
});
