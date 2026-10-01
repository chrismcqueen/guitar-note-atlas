import React, { useContext } from "react";
import Svg, { G, Circle, Text } from "react-native-svg";

import { Store } from "../../../Store";
import { theme } from "../../utils/theme";
import { getNoteName, getScaleDegreeLabel, normalizePitchClass } from "../../utils/music.mjs";

const Note = ({ fret, leftHand, string, stringCount, stringOffset }) => {
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

  const getStringTranslate = (s) => (180 / (stringCount - 1)) * (s - 1);

  const noteSize = fret === 0 ? 34 : 30;
  const fretTranslate = getFretTranslate(fret);
  const x = leftHand ? 864 - noteSize - fretTranslate : fretTranslate;
  const y = getStringTranslate(string);
  const scaleDegree = getScaleDegree(fret, stringOffset);
  const noteName = getNoteName(fret + stringOffset, globalState.key.title.includes("b"));
  const noteLabel = globalState.options.showScaleDegree ? scaleDegree : noteName;

  if (isNote(fret, stringOffset))
    return (
      <G transform={`translate(${x}, ${y})`}>
        <Svg width={noteSize} height={noteSize}>
          <Circle
            cx={noteSize / 2}
            cy={noteSize / 2}
            r="13"
            stroke={fret === 0 ? theme.colors.grey : theme.colors.black}
            fill={fret === 0 ? theme.colors.white : scaleDegree === "1" ? theme.colors.white : theme.colors.black}
            strokeWidth={fret === 0 ? 2 : 3.5}
          />
          <Text
            fontFamily="basicManual"
            textAnchor="middle"
            x="55%"
            y="78%"
            fontSize={26}
            stroke={fret === 0 ? theme.colors.black : scaleDegree === "1" ? theme.colors.black : theme.colors.white}
            strokeWidth={0.4}
            fill={fret === 0 ? theme.colors.black : scaleDegree === "1" ? theme.colors.black : theme.colors.white}
          >
            {noteLabel}
          </Text>
        </Svg>
      </G>
    );
  return <></>;
};

export default Note;
