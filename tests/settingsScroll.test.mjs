import assert from 'node:assert/strict';
import test from 'node:test';
import { clampSettingsOffset, settingsOffsetForGesture, shouldScrollSettings } from '../src/utils/settingsScroll.mjs';

for (const platform of ['iOS', 'Android']) {
  test(`${platform} portrait shell maps app up/down swipes to only the vertical content offset`, () => {
    const maxOffset = 122; // 312 points of controls inside a 190-point body.
    const appUp = { dx: 80, dy: 2 };
    const appDown = { dx: -40, dy: 1 };
    assert.equal(shouldScrollSettings(appUp, true, maxOffset), true);
    assert.equal(settingsOffsetForGesture(0, appUp, true, maxOffset), 80);
    assert.equal(settingsOffsetForGesture(80, appDown, true, maxOffset), 40);
    assert.equal(settingsOffsetForGesture(80, { dx: 200, dy: 0 }, true, maxOffset), maxOffset);
    assert.equal(settingsOffsetForGesture(40, { dx: -200, dy: 0 }, true, maxOffset), 0);
    assert.equal(shouldScrollSettings({ dx: 2, dy: 100 }, true, maxOffset), false, 'app horizontal swipes never take over');
    assert.equal(shouldScrollSettings({ dx: 3, dy: 0 }, true, maxOffset), false, 'small movements preserve control taps');
  });
}

test('unrotated landscape tablet/browser uses ordinary vertical coordinates', () => {
  assert.equal(shouldScrollSettings({ dx: 2, dy: -80 }, false, 122), true);
  assert.equal(settingsOffsetForGesture(0, { dx: 2, dy: -80 }, false, 122), 80);
  assert.equal(settingsOffsetForGesture(80, { dx: 0, dy: 40 }, false, 122), 40);
  assert.equal(shouldScrollSettings({ dx: 80, dy: 2 }, false, 122), false);
});

test('fitting content does not capture gestures; shrinking overflow clamps the saved offset', () => {
  assert.equal(shouldScrollSettings({ dx: 100, dy: 0 }, true, 0), false);
  assert.equal(settingsOffsetForGesture(0, { dx: 100, dy: 0 }, true, 0), 0);
  assert.equal(clampSettingsOffset(122, 50), 50);
});
