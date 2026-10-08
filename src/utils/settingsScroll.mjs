// Touch page coordinates belong to the unrotated native root. The portrait
// shell turns the app clockwise, so physical +X is app -Y, and +Y is app +X.
export const settingsGestureDelta = ({ dx, dy }, rotated) => rotated
  ? { x: dy, y: -dx }
  : { x: dx, y: dy };

export const shouldScrollSettings = (gesture, rotated, maxOffset) => {
  const { x, y } = settingsGestureDelta(gesture, rotated);
  return maxOffset > 0 && Math.abs(y) > 6 && Math.abs(y) > Math.abs(x);
};

export const clampSettingsOffset = (offset, maxOffset) => Math.max(0, Math.min(offset, maxOffset));

export const settingsOffsetForGesture = (startOffset, gesture, rotated, maxOffset) =>
  clampSettingsOffset(startOffset - settingsGestureDelta(gesture, rotated).y, maxOffset);
