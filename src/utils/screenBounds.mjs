export const orientScreenBounds = (screen, viewport) => {
  const longSide = Math.max(screen.width, screen.height);
  const shortSide = Math.min(screen.width, screen.height);
  const isLandscape = viewport.width >= viewport.height;

  return isLandscape
    ? { width: longSide, height: shortSide }
    : { width: shortSide, height: longSide };
};

export const getOptionsDrawerWidth = (viewportWidth) => Math.ceil(viewportWidth / 3);
