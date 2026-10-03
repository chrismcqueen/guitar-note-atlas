import React from "react";
import { Rect } from "react-native-svg";

import { theme } from "../../utils/theme";

const FRET_WIDTH = 49;
const X_OFFSET = 40;

const PositionBands = ({ bassMode, leftHand, muted = false, upsideDown }) => {
  const bands = [
    { fret: 4, color: muted ? theme.colors.positionGreenLight : theme.colors.positionGreen, strings: bassMode ? 4 : 6, start: 0 },
    { fret: 6, color: muted ? theme.colors.positionYellowLight : theme.colors.positionYellow, strings: bassMode ? 2 : 4, start: upsideDown ? (bassMode ? 2 : 2) : 0 },
    { fret: 11, color: muted ? theme.colors.positionPurpleLight : theme.colors.positionPurple, strings: bassMode ? 3 : 5, start: upsideDown ? 1 : 0 },
  ];
  const stringCount = bassMode ? 4 : 6;
  const span = muted ? 120 : 180;
  const stringGap = span / (stringCount - 1);

  return bands.map((band) => {
    const naturalX = X_OFFSET + band.fret * FRET_WIDTH;
    const x = leftHand ? 864 - naturalX - FRET_WIDTH : naturalX;
    const y = 14 + band.start * stringGap - stringGap / 2;
    const height = (band.strings - 1) * stringGap + stringGap;
    return <Rect key={`${band.fret}-${band.start}`} x={x} y={Math.max(0, y)} width={FRET_WIDTH} height={height} fill={band.color} />;
  });
};

export default PositionBands;
