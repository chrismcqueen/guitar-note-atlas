// Touch page coordinates belong to the unrotated native root. The portrait
// shell turns the app clockwise, so physical +X is app -Y, and +Y is app +X.
export const settingsGestureDelta = ({ dx, dy }, rotated, scale = 1) => rotated
  ? { x: dy / scale, y: -dx / scale }
  : { x: dx / scale, y: dy / scale };

export const shouldScrollSettings = (gesture, rotated, maxOffset, scale = 1) => {
  const { x, y } = settingsGestureDelta(gesture, rotated, scale);
  return maxOffset > 0 && Math.abs(y) > 6 && Math.abs(y) > Math.abs(x);
};

export const clampSettingsOffset = (offset, maxOffset) => Math.max(0, Math.min(offset, maxOffset));

export const settingsOffsetForGesture = (startOffset, gesture, rotated, maxOffset, scale = 1) =>
  clampSettingsOffset(startOffset - settingsGestureDelta(gesture, rotated, scale).y, maxOffset);
