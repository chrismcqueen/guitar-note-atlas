import { useCallback, useEffect, useRef } from "react";

const REPEAT_DELAY = 420;
const REPEAT_INTERVAL = 110;

export const useRepeatPress = (action) => {
  const actionRef = useRef(action);
  const intervalRef = useRef(null);
  const repeatedRef = useRef(false);

  actionRef.current = action;

  const stopRepeating = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, []);

  const onLongPress = useCallback(() => {
    repeatedRef.current = true;
    actionRef.current();
    intervalRef.current = setInterval(() => actionRef.current(), REPEAT_INTERVAL);
  }, []);

  const onPress = useCallback(() => {
    if (!repeatedRef.current) actionRef.current();
    repeatedRef.current = false;
  }, []);

  const onPressOut = useCallback(() => {
    stopRepeating();
  }, [stopRepeating]);

  useEffect(() => stopRepeating, [stopRepeating]);

  return { delayLongPress: REPEAT_DELAY, onLongPress, onPress, onPressOut };
};
