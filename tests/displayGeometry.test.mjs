import assert from 'node:assert/strict';
import test from 'node:test';
import { getAppViewport } from '../src/utils/orientation.mjs';
import { getBandInsets, getPracticeSectionInsets, getViewportObstructions } from '../src/utils/displayGeometry.mjs';
import { getFooterGeometry } from '../src/utils/footerSelection.mjs';

const pixelRoot = { width: 1080 / 2.75, height: 2340 / 2.75 };
const pixelViewport = getAppViewport({ window: pixelRoot, screen: pixelRoot, platform: 'android' });
const pixelGeometry = { ...pixelRoot, rects: [{ x: 0, y: 0, width: 136 / 2.75, height: 136 / 2.75 }] };
const empty = { left: 0, right: 0, top: 0, bottom: 0 };

test('Pixel corner camera maps to the lower left of the clockwise portrait shell', () => {
  const [rect] = getViewportObstructions(pixelGeometry, pixelViewport);
  assert.equal(rect.x, 0);
  assert.equal(rect.width, 136 / 2.75);
  assert.equal(rect.y + rect.height, pixelViewport.dimensions.height);
  const sections = getPracticeSectionInsets(pixelViewport.dimensions, [rect], empty);
  assert.deepEqual(sections.navigation, empty);
  assert.deepEqual(sections.body, empty);
  assert.equal(sections.footer.left, rect.width + 6);
  assert.equal(sections.footer.right, 0);
  const { scale, actionWidth, degreeWidth, paddingLeft, paddingRight } = getFooterGeometry(pixelViewport.dimensions, sections.footer);
  assert.equal(scale, 1);
  assert.equal(actionWidth, 100);
  assert.equal(paddingRight, 0);
  assert.ok(Math.abs(paddingLeft - 12) < 1e-6);
  const centeredLeft = (pixelViewport.dimensions.width - actionWidth * 2 - degreeWidth * 12) / 2;
  const rowLeft = centeredLeft + paddingLeft / 2;
  assert.ok(Math.abs(rowLeft - rect.width - 6) < 1e-6);
  assert.ok(Math.abs(rowLeft - centeredLeft - 6) < 1e-6);
});

test('center and opposite-corner cameras protect only intersecting sections', () => {
  const center = { ...pixelGeometry, rects: [{ x: pixelRoot.width / 2 - 20, y: 0, width: 40, height: 35 }] };
  const centered = getPracticeSectionInsets(pixelViewport.dimensions, getViewportObstructions(center, pixelViewport), empty);
  assert.equal(centered.navigation.left, 0);
  assert.equal(centered.footer.left, 0);
  assert.equal(centered.body.left, 41);
  const opposite = { ...pixelGeometry, rects: [{ x: pixelRoot.width - 50, y: 0, width: 50, height: 35 }] };
  const upper = getPracticeSectionInsets(pixelViewport.dimensions, getViewportObstructions(opposite, pixelViewport), empty);
  assert.equal(upper.navigation.left, 41);
  assert.equal(upper.footer.left, 0);
});

test('uncut displays and approved iOS fallback keep existing geometry', () => {
  const iosInsets = { left: 34, right: 59, top: 0, bottom: 0 };
  const fallback = getPracticeSectionInsets(pixelViewport.dimensions, null, iosInsets);
  assert.equal(fallback.body, iosInsets);
  assert.equal(fallback.navigation, iosInsets);
  assert.equal(fallback.footer, iosInsets);
  for (const value of Object.values(getPracticeSectionInsets(pixelViewport.dimensions, [], iosInsets))) assert.deepEqual(value, empty);
});

test('tablet window letterboxing and scale map native cutouts into the actual canvas', () => {
  const window = { width: 304, height: 700 };
  const viewport = getAppViewport({ window, screen: { width: 1280, height: 800 }, platform: 'android' });
  const margin = (window.height - viewport.dimensions.height * viewport.scale) / 2;
  const rects = getViewportObstructions({ ...window, rects: [
    { x: 0, y: 0, width: 20, height: 30 }, // entirely above the letterbox
    { x: 0, y: margin + 70 * viewport.scale, width: 20, height: 30 * viewport.scale },
  ] }, viewport);
  assert.equal(rects.length, 1);
  assert.ok(Math.abs(rects[0].y - 70) < 1e-6);
  assert.ok(Math.abs(rects[0].width - 20 / viewport.scale) < 1e-6);
  // Upright tablet cameras on the top/bottom are already outside its safe canvas.
  const tabletRoot = { width: 1280, height: 800 };
  const tabletViewport = getAppViewport({ window: tabletRoot, platform: 'android', insets: { top: 30, bottom: 20 } });
  assert.deepEqual(getViewportObstructions({ ...tabletRoot, rects: [
    { x: 620, y: 0, width: 40, height: 30 },
    { x: 620, y: 780, width: 40, height: 20 },
  ] }, tabletViewport), []);

});

test('multiple cutouts and visible side bars reserve their own intersecting bands', () => {
  const dimensions = { width: 800, height: 400 };
  const rects = [{ x: 0, y: 0, width: 30, height: 50 }, { x: 770, y: 350, width: 30, height: 50 }];
  assert.deepEqual(getBandInsets(dimensions, rects, 0, 100), { ...empty, left: 36 });
  assert.deepEqual(getBandInsets(dimensions, rects, 100, 300), empty);
  assert.deepEqual(getBandInsets(dimensions, rects, 350, 400), { ...empty, right: 36 });
});


test('footer uses existing outer space, then shifts or scales only when required', () => {
  const dimensions = { width: 900, height: 400 };
  const roomy = getFooterGeometry(dimensions, { ...empty, left: 55, avoidObstructions: true });
  assert.equal(roomy.paddingLeft, 0);
  assert.equal(roomy.paddingRight, 0);
  assert.equal(roomy.scale, 1);
  const tight = getFooterGeometry(dimensions, { ...empty, left: 180, right: 20, avoidObstructions: true });
  assert.equal(tight.scale, 700 / 752);
  const rowWidth = tight.actionWidth * 2 + tight.degreeWidth * 12;
  const rowLeft = (dimensions.width - rowWidth + tight.paddingLeft - tight.paddingRight) / 2;
  assert.ok(Math.abs(rowLeft - 180) < 1e-6);
  assert.ok(Math.abs(rowLeft + rowWidth - 880) < 1e-6);
  const rightCamera = getFooterGeometry(dimensions, { ...empty, right: 80, avoidObstructions: true });
  assert.equal(rightCamera.paddingLeft, 0);
  assert.equal(rightCamera.paddingRight, 12);
});
