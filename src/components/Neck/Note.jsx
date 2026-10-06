import React, { useContext } from "react";
import { G, Circle } from "react-native-svg";

import { Store } from "../../../Store";
import DegreeLabel from "./DegreeLabel";
import { theme } from "../../utils/theme";
import { getScaleDegreeLabel, normalizePitchClass } from "../../utils/music.mjs";

const Note = ({
  circleRadius = 13,
  circleStrokeWidth,
  centerInFrets = false,
  fret,
  labelFontSize = 25,
  leftHand,
  muted = false,
  noteSizeOverride,
  openStringOffset = 0,
  string,
  stringCount,
  stringOffset,
  stringOffsetY = 0,
  stringSpan = 180,
}) => {
  const { globalState } = useContext(Store);
  const degrees = globalState.scale.degrees;

  const getOffset = (f, stringOffset) => {
    return normalizePitchClass(f + stringOffset - globalState.key.key_offset);
  };

  const isNote = (f, stringOffset) => {
    const offset = getOffset(f, stringOffset);
    return degrees.some((degree) => Math.floor(degree) === offset);
  };

  const getScaleDegree = (fret, stringOffset) => {
    const offset = getOffset(fret, stringOffset);
    const selectedDegree = degrees.find((degree) => Math.floor(degree) === offset) ?? offset;

    return getScaleDegreeLabel(selectedDegree);
  };

  const getFretTranslate = (f) => {
    switch (f) {
      case 0:
        return 0;
        break;
      case 1:
        return 51;
        break;
      case 2:
        return 100;
        break;
      case 3:
        return 149;
        break;
      case 4:
        return 198;
        break;
      case 5:
        return 247;
        break;
      case 6:
        return 296;
        break;
      case 7:
        return 345;
        break;
      case 8:
        return 394;
        break;
      case 9:
        return 443;
        break;
      case 10:
        return 492;
        break;
      case 11:
        return 541;
        break;
      case 12:
        return 590;
        break;
      case 13:
        return 639;
        break;
      case 14:
        return 688;
        break;
      case 15:
        return 737;
        break;
      case 16:
        return 786;
        break;
    }
  };

  const getStringTranslate = (s) => (stringSpan / (stringCount - 1)) * (s - 1);

  const noteSize = noteSizeOverride ?? (fret === 0 ? 34 : 30);
  const fretCenter = fret === 1 ? 64.5 : 114 + 49 * (fret - 2);
  const fretTranslate = centerInFrets && fret > 0 ? fretCenter - noteSize / 2 : getFretTranslate(fret) + (fret === 0 ? openStringOffset : 0);
  const x = leftHand ? 864 - noteSize - fretTranslate : fretTranslate;
  const y = getStringTranslate(string) + stringOffsetY;
  const scaleDegree = getScaleDegree(fret, stringOffset);

  if (isNote(fret, stringOffset))
    return (
      <G>
        <Circle
          cx={x + noteSize / 2}
          cy={y + noteSize / 2}
          r={circleRadius}
          stroke={muted ? theme.colors.neckBlackAlpha : fret === 0 ? theme.colors.grey : theme.colors.black}
          fill={muted ? (scaleDegree === "1" || fret === 0 ? theme.colors.white : theme.colors.neckBlackAlpha) : fret === 0 ? theme.colors.white : scaleDegree === "1" ? theme.colors.white : theme.colors.black}
          strokeWidth={fret === 0 ? circleRadius / 12 : circleStrokeWidth ?? 3.5}
        />
        {globalState.options.showScaleDegree && (
          <DegreeLabel
            label={scaleDegree}
            x={x + noteSize * 0.545}
            y={y + noteSize * (scaleDegree.length === 1 ? 0.76 : 0.82)}
            fontSize={labelFontSize}
            fill={muted ? (scaleDegree === "1" || fret === 0 ? theme.colors.neckBlackAlpha : theme.colors.white) : fret === 0 ? theme.colors.grey : scaleDegree === "1" ? theme.colors.black : theme.colors.white}
          />
        )}
      </G>
    );
  return <></>;
};

export default Note;
