import assert from 'node:assert/strict';
import test from 'node:test';
import { createRepeatPress } from '../src/utils/repeatPress.mjs';
import { NOTE_RATES } from '../src/utils/audioSequence.mjs';

const clock = (t) => {
  t.mock.timers.enable({ apis: ['setTimeout', 'Date'], now: 0 });
  return (duration) => {
    for (let elapsed = 0; elapsed < duration; elapsed += 10) t.mock.timers.tick(10);
  };
};
const hold = (press, advance) => {
  press.handlers.onPressIn();
  advance(press.handlers.delayLongPress);
  press.handlers.onLongPress();
};

test('a short tap steps once, and a hold accelerates gradually with a bounded maximum speed', t => {
  const advance = clock(t);
  const times = [];
  const press = createRepeatPress(() => times.push(Date.now()));
  press.handlers.onPressIn();
  advance(200);
  assert.equal(times.length, 0);
  press.handlers.onPressOut();
  press.handlers.onPress();
  assert.equal(times.length, 1);

  times.length = 0;
  hold(press, advance);
  advance(4000);
  const gaps = times.slice(1).map((time, i) => time - times[i]);
  assert.equal(gaps[0], 150);
  assert.ok(gaps.includes(100));
  assert.equal(gaps.at(-1), 80);
  assert.ok(gaps.every(gap => gap >= 80));
  press.handlers.onPressOut();
  press.handlers.onPress();
  const count = times.length;
  advance(2000);
  assert.equal(times.length, count, 'release neither adds a step nor leaves repeating timers');
});

test('each new hold starts at the slow cadence', t => {
  const advance = clock(t);
  const times = [];
  const press = createRepeatPress(() => times.push(Date.now()));
  hold(press, advance);
  advance(3000);
  press.handlers.onPressOut();
  hold(press, advance);
  const start = times.at(-1);
  advance(140);
  assert.equal(times.at(-1), start);
  advance(10);
  assert.equal(times.at(-1) - start, 150);
  press.cancel();
});

test('cancelling a hold stops immediately and does not swallow the next tap', t => {
  const advance = clock(t);
  let count = 0;
  const press = createRepeatPress(() => count++);
  hold(press, advance);
  advance(700);
  press.cancel();
  const stopped = count;
  advance(2000);
  press.handlers.onLongPress();
  assert.equal(count, stopped, 'late long-press events after cancellation do nothing');
  press.handlers.onPressIn();
  press.handlers.onPressOut();
  press.handlers.onPress();
  assert.equal(count, stopped + 1);
});

for (const direction of [-1, 1]) {
  test(`held subdivision selection stops at the ${direction > 0 ? 'longest' : 'shortest'} value`, t => {
    const advance = clock(t);
    let index = direction > 0 ? 0 : NOTE_RATES.length - 1;
    const selected = [];
    let attempts = 0;
    const press = createRepeatPress(() => {
      attempts++;
      const next = index + direction;
      if (next < 0 || next >= NOTE_RATES.length) return false;
      index = next;
      selected.push(NOTE_RATES[index].id);
    });
    hold(press, advance);
    advance(3000);
    assert.equal(index, direction > 0 ? NOTE_RATES.length - 1 : 0);
    assert.equal(selected.length, NOTE_RATES.length - 1);
    const stopped = attempts;
    advance(3000);
    press.handlers.onPressOut();
    press.handlers.onPress();
    assert.equal(attempts, stopped, 'endpoint stops the timer and release adds no selection');
  });
}
