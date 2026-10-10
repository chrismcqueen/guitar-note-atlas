import { PHONE_FOOTER_HEIGHT, TABLET_FOOTER_HEIGHT, TABLET_HEADER_HEIGHT } from './practiceLayout.mjs';

// Inverse of RotatedViewport's clockwise 90-degree transform. Cutout bounds
// are relative to the native React root, including any letterbox margins.
export const getViewportObstructions = (geometry, viewport) => {
  if (!geometry) return null;
  const { dimensions: { width, height }, rotated, scale, padding = { top: 0, bottom: 0 } } = viewport;
  const originX = (geometry.width - (rotated ? height : width) * scale) / 2;
  const originY = padding.top + (geometry.height - padding.top - padding.bottom - (rotated ? width : height) * scale) / 2;
  return geometry.rects.map(rect => {
    const x = (rect.x - originX) / scale;
    const y = (rect.y - originY) / scale;
    return rotated
      ? { x: y, y: height - x - rect.width / scale, width: rect.height / scale, height: rect.width / scale }
      : { x, y, width: rect.width / scale, height: rect.height / scale };
  }).map(rect => {
    const x = Math.max(0, rect.x), y = Math.max(0, rect.y);
    return { x, y, width: Math.max(0, Math.min(width, rect.x + rect.width) - x), height: Math.max(0, Math.min(height, rect.y + rect.height) - y) };
  }).filter(rect => rect.width > 0 && rect.height > 0);
};

export const getBandInsets = ({ width }, rects, top, bottom, gap = 6) => {
  let left = 0, right = 0;
  for (const rect of rects) {
    if (rect.y >= bottom || rect.y + rect.height <= top) continue;
    // Display cutouts touch an edge; avoid reserving unrelated empty rows.
    if (rect.x <= gap) left = Math.max(left, rect.x + rect.width + gap);
    if (rect.x + rect.width >= width - gap) right = Math.max(right, width - rect.x + gap);
  }
  return { left, right, top: 0, bottom: 0 };
};

export const getPracticeSectionInsets = (dimensions, rects, fallback) => {
  if (rects === null) return { body: fallback, navigation: fallback, footer: fallback, overlay: fallback };
  const tablet = dimensions.width >= 1000 && dimensions.height >= 550;
  const header = tablet ? TABLET_HEADER_HEIGHT : 38;
  const footerTop = dimensions.height - (tablet ? TABLET_FOOTER_HEIGHT : PHONE_FOOTER_HEIGHT);
  const footer = getBandInsets(dimensions, rects, footerTop, dimensions.height);
  if (footer.left || footer.right) footer.avoidObstructions = true;
  return {
    navigation: getBandInsets(dimensions, rects, 0, header + (tablet ? 56 : 59)),
    body: getBandInsets(dimensions, rects, header + (tablet ? 8 : 67), footerTop),
    footer,
    overlay: getBandInsets(dimensions, rects, header + 6, dimensions.height - 12),
  };
};
