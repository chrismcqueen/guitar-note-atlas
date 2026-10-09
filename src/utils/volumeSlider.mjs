import { settingsGestureDelta } from './settingsScroll.mjs';

export const SLIDER_INSET = 12;
export const sliderPositionAtX = (x, width) => Math.max(0, Math.min(1,
  (x - SLIDER_INSET) / Math.max(1, width - SLIDER_INSET * 2),
));
export const sliderPositionForGesture = (startX, gesture, rotated, width) =>
  sliderPositionAtX(startX + settingsGestureDelta(gesture, rotated).x, width);
export const isSliderDrag = (gesture, rotated) => {
  const { x, y } = settingsGestureDelta(gesture, rotated);
  return Math.abs(x) > 3 && Math.abs(x) > Math.abs(y);
};
