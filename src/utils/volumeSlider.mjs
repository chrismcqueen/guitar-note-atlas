import { settingsGestureDelta } from './settingsScroll.mjs';

export const SLIDER_INSET = 12;
export const sliderPositionAtX = (x, width) => Math.max(0, Math.min(1,
  (x - SLIDER_INSET) / Math.max(1, width - SLIDER_INSET * 2),
));
export const sliderPositionForGesture = (startX, gesture, rotated, width, scale = 1) =>
  sliderPositionAtX(startX + settingsGestureDelta(gesture, rotated, scale).x, width);
export const isSliderDrag = (gesture, rotated, scale = 1) => {
  const { x, y } = settingsGestureDelta(gesture, rotated, scale);
  return Math.abs(x) > 3 && Math.abs(x) > Math.abs(y);
};
