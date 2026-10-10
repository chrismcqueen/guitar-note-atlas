export const isPortraitWindow = ({ height, width }) => height >= width;

export const getLandscapeDimensions = ({ height, width }) => ({
  height: Math.min(height, width),
  width: Math.max(height, width),
});

export const getLandscapeInsets = (insets, windowDimensions) => {
  if (!isPortraitWindow(windowDimensions)) return insets;

  return {
    top: insets.left,
    right: insets.top,
    bottom: insets.right,
    left: insets.bottom,
  };
};

// Device class controls the native shell; available window space controls the
// practice layout. A small tablet window must never become a rotated phone.
export const isTabletDisplay = ({ height, width }) => Math.min(height, width) >= 600;

export const getAppViewport = ({ window, screen = window, platform, insets = {}, tablet = isTabletDisplay(screen) }) => {
  const portraitShell = (platform === "ios" || platform === "android") && !tablet;
  // Android freeform caption/status/navigation bars can cover the activity.
  // iPad intentionally keeps its blue footer flush with the screen bottom.
  const padding = platform === "android" && !portraitShell
    ? { top: insets.top || 0, bottom: insets.bottom || 0 }
    : { top: 0, bottom: 0 };
  const usableHeight = Math.max(1, window.height - padding.top - padding.bottom);
  const rotated = portraitShell && isPortraitWindow(window);
  const available = rotated ? getLandscapeDimensions(window) : {
    width: window.width,
    height: Math.min(usableHeight, window.width * 0.75),
  };
  // Small tablets and unfolded phones can fit the two-neck tablet canvas at
  // 80% scale. Choose by usable space so folding or narrowing a window returns
  // to compact mode; a phone's rotated shell never opts into tablet mode.
  const tabletCanvas = tablet && !portraitShell && available.width >= 800 && available.height >= 440;
  const minimum = tabletCanvas ? { width: 1000, height: 550 } : { width: 568, height: 320 };
  const scale = portraitShell ? 1 : Math.min(1, available.width / minimum.width, available.height / minimum.height);
  return {
    dimensions: {
      width: tabletCanvas ? Math.max(1000, available.width / scale) : available.width / scale,
      height: tabletCanvas ? Math.max(550, available.height / scale) : available.height / scale,
    },
    rotated,
    scale,
    padding,
  };
};

export const getViewportInsets = (insets, window, { dimensions, rotated, scale, padding = { top: 0, bottom: 0 } }) => {
  const mapped = rotated ? getLandscapeInsets(insets, window) : insets;
  const verticalMargin = rotated ? 0 : Math.max(0, (window.height - padding.top - padding.bottom - dimensions.height * scale) / 2);
  return {
    top: Math.max(0, mapped.top - padding.top - verticalMargin) / scale,
    bottom: Math.max(0, mapped.bottom - padding.bottom - verticalMargin) / scale,
    left: mapped.left / scale,
    right: mapped.right / scale,
  };
};
