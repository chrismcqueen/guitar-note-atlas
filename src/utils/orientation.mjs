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

export const getAppViewport = ({ window, screen = window, platform, insets = {} }) => {
  const portraitShell = platform === "ios" || (platform === "android" && !isTabletDisplay(screen));
  // Android freeform caption/status/navigation bars can cover the activity.
  // Consume their vertical safe area before sizing and centering the canvas.
  const padding = platform === "android" && !portraitShell
    ? { top: insets.top || 0, bottom: insets.bottom || 0 }
    : { top: 0, bottom: 0 };
  const usableHeight = Math.max(1, window.height - padding.top - padding.bottom);
  const rotated = portraitShell && isPortraitWindow(window);
  const available = rotated ? getLandscapeDimensions(window) : {
    width: window.width,
    height: Math.min(usableHeight, window.width * 0.75),
  };
  // Keep the compact controls usable even in a very small desktop window.
  const scale = portraitShell ? 1 : Math.min(1, available.width / 568, available.height / 320);
  return {
    dimensions: { width: available.width / scale, height: available.height / scale },
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
