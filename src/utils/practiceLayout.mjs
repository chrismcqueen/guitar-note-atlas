export const TABLET_HEADER_HEIGHT = 51;
export const TABLET_FOOTER_HEIGHT = 87;
export const PHONE_FOOTER_HEIGHT = 53;
export const TABLET_POSITION_TITLE_HEIGHT = 64;
export const TABLET_BODY_GAP = 8;

export const getNavigationSideInset = (insets, platform = "ios", centerOffset = 50) =>
  // Mirror both control centers, moving both inward if a right-side cutout
  // needs extra clearance for the visible dots (24 points).
  Math.max(insets.left + (platform === "android" ? 24 : 0), insets.right + 12 - centerOffset);

export const getPhoneNavigationLayout = (insets, platform = "ios") => {
  const sideInset = getNavigationSideInset(insets, platform);
  return {
    menuLeft: sideInset,
    optionsRight: sideInset,
    controlWidth: 100,
    menuCenter: sideInset + 50,
    titleInset: Math.max(sideInset, insets.right) + 112,
  };
};

// Allocate the usable body between the zoom neck and overview. Both SVGs
// preserve their proportions, and neither can borrow space from navigation.
export const getTabletPracticeLayout = ({ width, height }, insets) => {
  const bodyHeight = height - TABLET_HEADER_HEIGHT - TABLET_FOOTER_HEIGHT - TABLET_BODY_GAP * 2;
  const overviewWidth = width - insets.left - insets.right - 8;
  const overviewHeight = Math.min(overviewWidth * 175 / 864, bodyHeight * 0.36);
  return { overviewHeight, zoomHeight: bodyHeight - overviewHeight };
};

export const getPhonePracticeBodyHeight = (height, header) =>
  height - header.top - header.height - PHONE_FOOTER_HEIGHT - TABLET_BODY_GAP * 2;

export const getPositionNeckSize = (dimensions, { compact, sideInset = 0, zoomHeight, maxHeight = Infinity }) => {
  const height = compact ? Math.min(dimensions.height * 0.53, maxHeight) : zoomHeight - TABLET_POSITION_TITLE_HEIGHT;
  const preferredWidth = compact ? (dimensions.width - sideInset * 2) * 0.505 : dimensions.width * 0.46;
  // Avoid stretching a very wide, short window into an unreadable fretboard.
  return { height, width: Math.min(preferredWidth, height * 642 / 300) };
};
