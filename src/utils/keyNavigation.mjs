export const KEY_NAVIGATION_MODES = Object.freeze({
  CHROMATIC: "chromatic",
  CIRCLE: "circle",
});

export const keyStepForMode = (mode) => (
  mode === KEY_NAVIGATION_MODES.CIRCLE ? 7 : 1
);

export const nextKeyOffset = (currentOffset, direction, mode) => {
  const step = keyStepForMode(mode);
  const signedStep = direction === "left" ? -step : step;
  return (currentOffset + signedStep + 12) % 12;
};
