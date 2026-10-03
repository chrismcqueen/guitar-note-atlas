import React from "react";
import { Circle, G } from "react-native-svg";

import { theme } from "../../utils/theme";

const AnchorFrets = ({ leftHand }) => {
  return (
    <G transform={leftHand ? "translate(864 0) scale(-1 1)" : "translate(0 0) scale(1 1)"}>
      <Circle id="anchor-fret-3" transform="translate(159.25 224.5)" cx="4" cy="4" r="3" fill={theme.colors.black} stroke={theme.colors.black} />
      <Circle id="anchor-fret-5" transform="translate(257.25 224.5)" cx="4" cy="4" r="3" fill={theme.colors.black} stroke={theme.colors.black} />
      <Circle id="anchor-fret-7" transform="translate(355.25 224.5)" cx="4" cy="4" r="3" fill={theme.colors.black} stroke={theme.colors.black} />
      <Circle id="anchor-fret-9" transform="translate(452.25 224.5)" cx="4" cy="4" r="3" fill={theme.colors.black} stroke={theme.colors.black} />
      <Circle id="anchor-fret-12-a" transform="translate(595.75 224.5)" cx="4" cy="4" r="3" fill={theme.colors.black} stroke={theme.colors.black} />
      <Circle id="anchor-fret-12-b" transform="translate(606.25 224.5)" cx="4" cy="4" r="3" fill={theme.colors.black} stroke={theme.colors.black} />
      <Circle id="anchor-fret-15" transform="translate(749.25 224.5)" cx="4" cy="4" r="3" fill={theme.colors.black} stroke={theme.colors.black} />
    </G>
  );
};

export default AnchorFrets;
