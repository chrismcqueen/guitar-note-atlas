import { fretForNeckX, positionTargetForFret } from './positions.mjs';

// Move from the initial neck-local point using stable screen coordinates.
// Android's locationX/Y can switch to another hit-tested view mid-gesture.
export const neckPointForTouch = (anchor, touch, { rotated = false, scale = 1 } = {}) => {
  const dx = (touch.pageX - anchor.pageX) / scale;
  const dy = (touch.pageY - anchor.pageY) / scale;
  return { x: anchor.x + (rotated ? dy : dx), y: anchor.y + (rotated ? -dx : dy) };
};

export const positionTargetForNeckPoint = ({ x, y }, { width, height }, keyOffset, leftHand = false) => {
  if (!Number.isFinite(x) || !Number.isFinite(y) || width <= 0 || height <= 0
    || x < 0 || x > width || y < 0 || y > height) return null;
  return positionTargetForFret(fretForNeckX(x, width, leftHand), keyOffset);
};
