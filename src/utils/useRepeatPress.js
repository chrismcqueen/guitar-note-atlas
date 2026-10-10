import { useEffect, useRef } from "react";

import { createRepeatPress } from "./repeatPress.mjs";

export const useRepeatPress = (action, { disabled = false } = {}) => {
  const actionRef = useRef(action);
  const repeatRef = useRef(null);
  actionRef.current = action;
  if (!repeatRef.current) repeatRef.current = createRepeatPress(() => actionRef.current());

  useEffect(() => {
    if (disabled) repeatRef.current.cancel();
  }, [disabled]);
  useEffect(() => () => repeatRef.current.cancel(), []);

  return repeatRef.current.handlers;
};
