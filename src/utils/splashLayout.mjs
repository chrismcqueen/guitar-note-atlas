const GAP = 12;

// Android provides exact canvas-relative cutouts and visible bars. iOS uses
// symmetric side safe areas so either landscape edge clears the native shell.
export const getSplashLayout = ({ width, height }, insets = {}, obstructions = null) => {
  let top = insets.top || 0;
  let bottom = insets.bottom || 0;
  for (const rect of obstructions || []) {
    // Side cameras are handled per artwork band; horizontal bars and centered
    // top/bottom cameras reduce the available vertical canvas instead.
    const horizontalEdge = rect.width >= width / 2 || (rect.x > GAP && rect.x + rect.width < width - GAP);
    if (!horizontalEdge) continue;
    if (rect.y <= 0) top = Math.max(top, rect.y + rect.height + GAP);
    if (rect.y + rect.height >= height) bottom = Math.max(bottom, height - rect.y + GAP);
  }
  const safeHeight = Math.max(1, height - top - bottom);
  const sidesForBand = (bandTop, bandBottom) => {
    const fallbackSide = obstructions === null ? Math.max(insets.left || 0, insets.right || 0) : 0;
    let left = fallbackSide, right = fallbackSide;
    for (const rect of obstructions || []) {
      if (rect.y >= bandBottom || rect.y + rect.height <= bandTop || rect.width >= width / 2) continue;
      if (rect.x <= 0) left = Math.max(left, rect.x + rect.width);
      if (rect.x + rect.width >= width) right = Math.max(right, width - rect.x);
    }
    return { left: left + GAP, right: right + GAP };
  };
  const titleHeight = safeHeight * 0.6;
  const neckHeight = safeHeight * 0.2;
  const neckBottom = bottom + Math.min(24, Math.max(12, safeHeight * 0.03));
  return {
    title: { top, height: titleHeight, ...sidesForBand(top, top + titleHeight) },
    neck: { bottom: neckBottom, height: neckHeight, ...sidesForBand(height - neckBottom - neckHeight, height - neckBottom) },
    error: { bottom: bottom + 20, ...sidesForBand(height - bottom - 120, height - bottom) },
  };
};
