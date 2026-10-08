const REPEAT_DELAY = 420;
const repeatInterval = (elapsed) => elapsed < 1000 ? 150 : elapsed < 2200 ? 100 : 80;

// Share one hold cadence across navigation, tempo and subdivision controls.
// Returning false from an action stops repeating at a bounded selector's end.
export const createRepeatPress = (action) => {
  let holding = false;
  let repeated = false;
  let startedAt = 0;
  let timer = null;

  const cancel = () => {
    holding = false;
    if (timer !== null) clearTimeout(timer);
    timer = null;
  };
  const repeat = () => {
    timer = null;
    if (!holding) return;
    if (action() === false) {
      cancel();
      return;
    }
    timer = setTimeout(repeat, repeatInterval(Date.now() - startedAt));
  };

  return {
    cancel,
    handlers: {
      delayLongPress: REPEAT_DELAY,
      onPressIn: () => {
        cancel();
        holding = true;
        repeated = false;
      },
      onLongPress: () => {
        if (!holding) return;
        repeated = true;
        startedAt = Date.now();
        repeat();
      },
      onPress: () => {
        if (!repeated) action();
        repeated = false;
      },
      onPressOut: cancel,
    },
  };
};
