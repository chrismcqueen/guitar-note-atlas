import React from "react";
import { Circle, G } from "react-native-svg";

import { theme } from "../../utils/theme";

const AnchorFrets = ({ color = theme.colors.black, leftHand, radius = 3 }) => {
  return (
    <G transform={leftHand ? "translate(864 0) scale(-1 1)" : "translate(0 0) scale(1 1)"}>
      {[159.25, 257.25, 355.25, 452.25, 595.75, 606.25, 749.25].map((x) => (
        <Circle key={x} cx={x + 4} cy="228.5" r={radius} fill={color} />
      ))}
    </G>
  );
};

export default AnchorFrets;
