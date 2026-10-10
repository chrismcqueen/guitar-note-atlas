const GAP = 6;
const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

// Button coverage is a preferred anchor, never a reason to cross a safe area.
// Android supplies exact rectangles; iOS reserves both safe sides because the
// portrait shell can put its physical notch on either landscape edge.
export const getAudioPopoverLayout = ({ dimensions, insets = {}, obstructions = null, left, top, width }) => {
  const side = obstructions === null ? Math.max(insets.left || 0, insets.right || 0) : 0;
  const bounds = {
    left: side + GAP,
    right: dimensions.width - side - GAP,
    top: (obstructions === null ? insets.top || 0 : 0) + GAP,
    bottom: dimensions.height - (obstructions === null ? insets.bottom || 0 : 0) - 12,
  };
  const cardWidth = Math.min(width, Math.max(0, bounds.right - bounds.left));
  const preferredLeft = clamp(left, bounds.left, bounds.right - cardWidth);
  const preferredTop = clamp(top, bounds.top, bounds.bottom);
  const rects = (obstructions || []).map(rect => ({
    left: rect.x - GAP, right: rect.x + rect.width + GAP,
    top: rect.y - GAP, bottom: rect.y + rect.height + GAP,
  }));
  const lefts = [preferredLeft, bounds.left, bounds.right - cardWidth,
    ...rects.flatMap(rect => [rect.right, rect.left - cardWidth])];
  const tops = [preferredTop, ...rects.map(rect => Math.max(preferredTop, rect.bottom))];
  let best = null;
  for (const x of lefts) {
    if (x < bounds.left || x + cardWidth > bounds.right) continue;
    for (const y of tops) {
      if (y > bounds.bottom) continue;
      let bottom = bounds.bottom;
      for (const rect of rects) {
        if (x >= rect.right || x + cardWidth <= rect.left || y >= rect.bottom) continue;
        bottom = Math.min(bottom, Math.max(y, rect.top));
      }
      const maxHeight = Math.max(0, bottom - y);
      // Preserve scrolling room first, then stay near the controls. All
      // candidates already avoid every cutout, including one crossing the top.
      const score = maxHeight * (dimensions.width + dimensions.height + 1)
        - Math.abs(x - preferredLeft) - Math.abs(y - preferredTop);
      if (!best || score > best.score) best = { left: x, top: y, width: cardWidth, maxHeight, score };
    }
  }
  const { score, ...frame } = best;
  return frame;
};
