import React from "react";
import { G, Rect } from "react-native-svg";

import { theme } from "../../utils/theme";

const getFretX = (fret) => 40 + 49 * (fret - 1);

const PositionBars = ({ leftHand, positionFret }) => {
  const frets = [positionFret, positionFret + 12].filter((fret) => fret <= 16);
  const colors = [theme.colors.positionGreen, theme.colors.positionYellow, theme.colors.positionPurple];
  const color = colors[(positionFret - 1) % colors.length];

  return (
    <G transform={leftHand ? "translate(864 0) scale(-1 1)" : undefined}>
      {frets.map((fret) => (
        <Rect key={fret} x={getFretX(fret)} y="12" width="49" height="184" fill={color} opacity="0.55" />
      ))}
    </G>
  );
};

export default PositionBars;
