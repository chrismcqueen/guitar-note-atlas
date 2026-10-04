import { useCallback, useEffect, useRef } from "react";

const REPEAT_DELAY = 420;
const REPEAT_INTERVAL = 110;
const repeatInterval = (elapsed, accelerate) => {
  if (!accelerate || elapsed < 1200) return REPEAT_INTERVAL;
  if (elapsed < 2500) return 75;
  return 50;
};

export const useRepeatPress = (action, { accelerate = false } = {}) => {
  const actionRef = useRef(action);
  const holdingRef = useRef(false);
  const timerRef = useRef(null);
  const repeatedRef = useRef(false);
  const repeatStartedAtRef = useRef(0);

  actionRef.current = action;

  const stopRepeating = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  const scheduleRepeat = useCallback(() => {
    const elapsed = Date.now() - repeatStartedAtRef.current;
    timerRef.current = setTimeout(() => {
      if (!holdingRef.current) return;
      actionRef.current();
      scheduleRepeat();
    }, repeatInterval(elapsed, accelerate));
  }, [accelerate]);

  const onLongPress = useCallback(() => {
    repeatedRef.current = true;
    holdingRef.current = true;
    repeatStartedAtRef.current = Date.now();
    actionRef.current();
    scheduleRepeat();
  }, [scheduleRepeat]);

  const onPress = useCallback(() => {
    if (!repeatedRef.current) actionRef.current();
    repeatedRef.current = false;
  }, []);

  const onPressOut = useCallback(() => {
    holdingRef.current = false;
    stopRepeating();
  }, [stopRepeating]);

  useEffect(() => stopRepeating, [stopRepeating]);

  return { delayLongPress: REPEAT_DELAY, onLongPress, onPress, onPressOut };
};
