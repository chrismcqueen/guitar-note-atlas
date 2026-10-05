export const monotonicNow = () => globalThis.performance?.now?.() ?? Date.now();

export const getMissedBeatCount = (now, deadline, beatDuration) => {
  if (now <= deadline || beatDuration <= 0) return 0;
  return Math.floor((now - deadline) / beatDuration);
};

export const getNextBeatDelay = (now, deadline, beatDuration, missedBeats = 0) => Math.max(
  0,
  deadline + ((missedBeats + 1) * beatDuration) - now,
);

export const getNextGridTime = (origin, now, step) => {
  if (now <= origin) return origin;
  if (step <= 0) return now;
  return origin + (Math.ceil((now - origin) / step) * step);
};
