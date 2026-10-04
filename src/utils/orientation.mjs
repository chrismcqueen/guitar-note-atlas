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
