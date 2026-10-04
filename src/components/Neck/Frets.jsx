import React from "react";
import { Line } from "react-native-svg";

import { theme } from "../../utils/theme";

const Frets = ({ color = theme.colors.black, fretStrokeWidth = 4, nutStrokeWidth = 6, y1 = 14, y2 = 194 }) => {
  const fretXs = [39.5, 89.5, 138.5, 187.5, 236.5, 285.5, 334.5, 383.5, 432.5, 481.5, 530.5, 579.5, 628.5, 677.5, 726.5, 775.5, 824.5];
  return (
    <>
      {fretXs.map((x, index) => (
        <Line
          key={x}
          id={`fret-${index}`}
          x1={x}
          x2={x}
          y1={index === 0 ? y1 - fretStrokeWidth / 2 : y1}
          y2={index === 0 ? y2 + fretStrokeWidth / 2 : y2}
          stroke={color}
          strokeWidth={index === 0 ? nutStrokeWidth : fretStrokeWidth}
        />
      ))}
    </>
  );
};

export default Frets;
