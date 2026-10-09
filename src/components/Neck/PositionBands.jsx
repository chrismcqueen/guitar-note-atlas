import React from "react";
import { Rect } from "react-native-svg";

import { theme } from "../../utils/theme";
import { positionBandFrets, positionBandVerticalGeometry } from "../../utils/positions.mjs";

const FRET_WIDTH = 49;
const X_OFFSET = 40;

const PositionBands = ({ activeFretRange, bassMode, keyOffset = 0, leftHand, muted = false, stringSpan, upsideDown }) => {
  const definitions = [
    { pitch: 4, color: theme.colors.positionGreen, mutedColor: theme.colors.positionGreenLight, height: 5 },
    { pitch: 6, color: theme.colors.positionYellow, mutedColor: theme.colors.positionYellowLight, height: 3 },
    { pitch: 11, color: theme.colors.positionPurple, mutedColor: theme.colors.positionPurpleLight, height: 4 },
  ];
  const bands = definitions.flatMap((definition) =>
    positionBandFrets(definition.pitch, keyOffset).map((fret) => ({ ...definition, fret })),
  );
  const stringCount = bassMode ? 4 : 6;
  const span = stringSpan ?? (muted ? 120 : 180);
  const stringGap = span / (stringCount - 1);
  // FullStringView.m scales its original gap by 1.3 and its half-gap
  // inset by 2.1 in bass mode. Retain that band overhang while anchoring
  // it to this renderer's strings at y=14.
  const verticalOffset = bassMode ? (stringGap / 1.3 / 2) * 2.1 : 14;

  return bands.map((band) => {
    const isActive = activeFretRange
      && band.fret >= activeFretRange.start
      && band.fret < activeFretRange.end;
    const naturalX = X_OFFSET + band.fret * FRET_WIDTH;
    const x = leftHand ? 864 - naturalX - FRET_WIDTH : naturalX;
    const vertical = positionBandVerticalGeometry({ bassMode, height: band.height, stringGap, upsideDown, verticalOffset, stringOriginY: 14 });
    return <Rect key={`${band.fret}-${band.height}`} x={x} y={vertical.y} width={FRET_WIDTH} height={vertical.height} fill={muted && !isActive ? band.mutedColor : band.color} />;
  });
};

export default PositionBands;
