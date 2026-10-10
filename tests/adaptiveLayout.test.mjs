import assert from 'node:assert/strict';
import test from 'node:test';
import { getAppViewport, getViewportInsets } from '../src/utils/orientation.mjs';
import { positionFingerLabelY } from '../src/utils/positions.mjs';
import { getFooterGeometry } from '../src/utils/footerSelection.mjs';
import { settingsOffsetForGesture } from '../src/utils/settingsScroll.mjs';
import { sliderPositionForGesture } from '../src/utils/volumeSlider.mjs';
import { getMenuLeftInset, getPhoneNavigationLayout, getPhonePracticeBodyHeight, getPositionNeckSize, getTabletPracticeLayout, TABLET_BODY_GAP, TABLET_HEADER_HEIGHT, TABLET_FOOTER_HEIGHT, PHONE_FOOTER_HEIGHT } from '../src/utils/practiceLayout.mjs';

test('phone navigation reserves actual safe areas without adding notched-phone margins to the SE', () => {
  for (const insets of [{ left: 0, right: 0 }, { left: 27, right: 0 }, { left: 59, right: 34 }]) {
    const layout = getPhoneNavigationLayout(insets);
    assert.equal(layout.menuCenter - insets.left, 50);
    assert.equal(layout.optionsRight, insets.right);
    assert.ok(layout.titleInset >= Math.max(insets.left, insets.right) + layout.controlWidth);
  }
  const se = getPhoneNavigationLayout({ left: 0, right: 0 });
  // At the bundled Blackout font's 6.494-em advance, Major Scale can retain
  // its oversized 58-point font instead of shrinking to fit old side reserves.
  assert.ok(667 - se.titleInset * 2 >= 58 * 6.494);
});

test('Android Menu/audio alignment adds breathing room without moving iOS controls', () => {
  for (const insets of [{ left: 0, right: 0 }, { left: 27, right: 0 }, { left: 59, right: 34 }]) {
    const ios = getPhoneNavigationLayout(insets, 'ios');
    const android = getPhoneNavigationLayout(insets, 'android');
    assert.equal(ios.menuLeft, insets.left);
    assert.equal(android.menuCenter - ios.menuCenter, android.menuLeft - ios.menuLeft);
    // The 92-point audio pair has room beyond the safe edge, and the title
    // clears the shifted navigation target without changing its midpoint.
    assert.ok(android.menuCenter - 92 / 2 - insets.left >= 24);
    assert.ok(android.titleInset >= android.menuLeft + android.controlWidth + 12);
    assert.equal(android.optionsRight, android.menuLeft);
    assert.equal(android.optionsRight + android.controlWidth / 2, android.menuCenter);
    assert.equal(getMenuLeftInset(insets, 'android'), android.menuLeft);
  }
  // A larger right-side cutout still takes precedence over visual symmetry.
  const pixel = getPhoneNavigationLayout({ left: 0, right: 51 }, 'android');
  assert.equal(pixel.optionsRight + 50, pixel.menuCenter);
  const cutout = getPhoneNavigationLayout({ left: 0, right: 80 }, 'android');
  assert.equal(cutout.optionsRight + 50 - 12, 80);
  assert.ok(cutout.titleInset >= cutout.optionsRight + cutout.controlWidth);
});

const screen = { width: 1280, height: 800 };

test('tablet resizing uses the available window and never rotates a small portrait window', () => {
  for (const window of [screen, { width: 1100, height: 650 }, { width: 800, height: 550 }, { width: 500, height: 700 }, { width: 304, height: 400 }, { width: 900, height: 250 }]) {
    const viewport = getAppViewport({ window, screen, platform: 'android' });
    const { dimensions, scale, rotated } = viewport;
    assert.equal(rotated, false);
    assert.ok(dimensions.width * scale <= window.width + 1e-8);
    assert.ok(dimensions.height * scale <= window.height + 1e-8);
    assert.ok(dimensions.width >= 568 - 1e-8);
    assert.ok(dimensions.height >= 320 - 1e-8);
    assert.ok(dimensions.width > dimensions.height);
  }
  assert.deepEqual(getAppViewport({ window: screen, screen, platform: 'android' }).dimensions, screen);
  const compact = getAppViewport({ window: { width: 500, height: 700 }, screen, platform: 'android' });
  assert.ok(compact.dimensions.width < 1000);
  assert.ok(compact.scale < 1);
});

test('portrait phones and iOS retain their established rotated shell', () => {
  for (const platform of ['android', 'ios']) {
    const window = { width: 393, height: 852 };
    assert.deepEqual(getAppViewport({ window, screen: window, platform }), {
      dimensions: { width: 852, height: 393 }, rotated: true, scale: 1, padding: { top: 0, bottom: 0 },
    });
  }
  assert.equal(getAppViewport({ window: { width: 834, height: 1210 }, platform: 'ios' }).rotated, true);
});

test('tablet window safe areas and scaled gestures share canvas coordinates', () => {
  const window = { width: 284, height: 300 };
  const viewport = getAppViewport({ window, screen, platform: 'android' });
  assert.equal(viewport.scale, 0.5);
  assert.deepEqual(getViewportInsets({ top: 24, bottom: 20, left: 3, right: 4 }, window, viewport), { top: 0, bottom: 0, left: 6, right: 8 });
  assert.equal(settingsOffsetForGesture(0, { dx: 0, dy: -50 }, false, 300, 0.5), 100);
  assert.equal(sliderPositionForGesture(12, { dx: 50, dy: 0 }, false, 224, 0.5), 0.5);
});

test('all footer actions and degrees fit their available window at either layout size', () => {
  for (const width of [568, 667, 752, 900, 1000, 1100, 1280]) {
    const insets = { left: 20, right: 30 };
    const geometry = getFooterGeometry({ width, height: 600 }, insets);
    assert.ok(geometry.actionWidth * 2 + geometry.degreeWidth * 12 <= width - 50 + 1e-8);
  }
});

test('bass and guitar finger labels clear the last note and remain inside the zoom SVG', () => {
  for (const dimensions of [screen, { width: 1194, height: 834 }, { width: 1000, height: 550 }, { width: 1800, height: 550 }, { width: 844, height: 390 }, { width: 1152, height: 320 }, { width: 568, height: 320 }]) {
    const compact = dimensions.width < 1000 || dimensions.height < 550;
    const { zoomHeight } = getTabletPracticeLayout(dimensions, { left: 0, right: 0 });
    const maxHeight = getPhonePracticeBodyHeight(dimensions.height, { top: 41, height: 56 });
    const neck = getPositionNeckSize(dimensions, { compact, zoomHeight, maxHeight });
    const viewBoxHeight = 642 * neck.height / neck.width;
    const baseGap = Math.floor((viewBoxHeight - viewBoxHeight / 4.5) / 5.44);
    for (const bass of [true, false]) {
      const stringOriginY = viewBoxHeight / 4.5 / 3.2 * (bass ? 2.1 : 1) + (compact ? 0 : 20);
      const stringCount = bass ? 4 : 6;
      const stringGap = baseGap * (bass ? 1.3 : 1) * (compact ? 1 : 0.94);
      const radius = viewBoxHeight / 6.6 / 2.3;
      const noteRadius = radius * 0.75;
      const noteStrokeWidth = radius / 4;
      const fontSize = viewBoxHeight / 9.6;
      const y = positionFingerLabelY({ stringOriginY, stringCount, stringGap, noteRadius, noteStrokeWidth, fontSize });
      const lastNoteBottom = stringOriginY + (stringCount - 1) * stringGap + noteRadius + noteStrokeWidth / 2;
      assert.ok(y - fontSize * 0.75 > lastNoteBottom, `${dimensions.width}, bass=${bass}: label clearance`);
      assert.ok(y + fontSize * 0.25 < viewBoxHeight, `${dimensions.width}, bass=${bass}: SVG clipping`);
    }
  }
});

test('short phone necks fit below the fixed practice row and above the footer', () => {
  const header = { top: 41, height: 56 };
  for (const dimensions of [{ width: 568, height: 320 }, { width: 667, height: 375 }, { width: 852, height: 393 }]) {
    const maxHeight = getPhonePracticeBodyHeight(dimensions.height, header);
    const neck = getPositionNeckSize(dimensions, { compact: true, maxHeight });
    assert.ok(neck.height <= maxHeight);
    assert.ok(header.top + header.height + TABLET_BODY_GAP + neck.height + TABLET_BODY_GAP + PHONE_FOOTER_HEIGHT <= dimensions.height);
    assert.ok(neck.height > 140);
  }
});

test('tablet necks share the remaining space without overlapping navigation', () => {
  for (const dimensions of [screen, { width: 1280, height: 674 }, { width: 1000, height: 550 }, { width: 1800, height: 550 }]) {
    const layout = getTabletPracticeLayout(dimensions, { left: 0, right: 0 });
    assert.equal(TABLET_HEADER_HEIGHT + TABLET_BODY_GAP * 2 + layout.zoomHeight + layout.overviewHeight + TABLET_FOOTER_HEIGHT, dimensions.height);
    assert.ok(layout.zoomHeight > 200);
    assert.ok(layout.overviewHeight > 100);
  }
});

test('Android window captions and system bars cannot cover the practice canvas', () => {
  const window = { width: 1280, height: 800 };
  const insets = { top: 48, bottom: 40, left: 0, right: 0 };
  const viewport = getAppViewport({ window, screen, platform: 'android', insets });
  assert.equal(viewport.dimensions.height, 712);
  assert.deepEqual(viewport.padding, { top: 48, bottom: 40 });
  assert.deepEqual(getViewportInsets(insets, window, viewport), { top: 0, bottom: 0, left: 0, right: 0 });
});
