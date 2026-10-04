export const monotonicNow = () => globalThis.performance?.now?.() ?? Date.now();

export const getMissedBeatCount = (now, deadline, beatDuration) => {
  if (now <= deadline || beatDuration <= 0) return 0;
  return Math.floor((now - deadline) / beatDuration);
};

export const getNextBeatDelay = (now, deadline, beatDuration, missedBeats = 0) => Math.max(
  0,
  deadline + ((missedBeats + 1) * beatDuration) - now,
);
