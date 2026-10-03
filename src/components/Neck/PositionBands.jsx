import React from "react";
import { Rect } from "react-native-svg";

import { theme } from "../../utils/theme";
import { positionBandFrets, positionBandVerticalGeometry } from "../../utils/positions.mjs";

const FRET_WIDTH = 49;
const X_OFFSET = 40;

const PositionBands = ({ bassMode, keyOffset = 0, leftHand, muted = false, upsideDown }) => {
  const definitions = [
    { pitch: 4, color: muted ? theme.colors.positionGreenLight : theme.colors.positionGreen, height: 5 },
    { pitch: 6, color: muted ? theme.colors.positionYellowLight : theme.colors.positionYellow, height: 3 },
    { pitch: 11, color: muted ? theme.colors.positionPurpleLight : theme.colors.positionPurple, height: 4 },
  ];
  const bands = definitions.flatMap((definition) =>
    positionBandFrets(definition.pitch, keyOffset).map((fret) => ({ ...definition, fret })),
  );
  const stringCount = bassMode ? 4 : 6;
  const span = muted ? 120 : 180;
  const stringGap = span / (stringCount - 1);

  return bands.map((band) => {
    const naturalX = X_OFFSET + band.fret * FRET_WIDTH;
    const x = leftHand ? 864 - naturalX - FRET_WIDTH : naturalX;
    const vertical = positionBandVerticalGeometry({ bassMode, height: band.height, stringGap, upsideDown, verticalOffset: 14 });
    return <Rect key={`${band.fret}-${band.height}`} x={x} y={vertical.y} width={FRET_WIDTH} height={vertical.height} fill={band.color} />;
  });
};

export default PositionBands;
