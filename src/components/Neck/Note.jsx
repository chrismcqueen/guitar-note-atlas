import React, { useContext } from 'react'
import Svg, { G, Circle, Text } from "react-native-svg";

import { Store } from "../../../Store";
import { theme } from "../../utils/theme";
import { processFontFamily } from 'expo-font';

const Note = ({ fret, string }) => {
  const { globalState } = useContext(Store);
  const degrees = globalState.scale.degrees;
  
  const getString = s => globalState.strings[s-1]

  const getOffset = (f, stringOffset) => {
    let offset = Math.floor(f) + stringOffset;
    offset -= globalState.key.key_offset;
    offset = offset < 0 ? offset + 12 : offset > 11 ? offset - 12 : offset;
    return offset
  }

  const isNote = (f, stringOffset) => degrees.includes(getOffset(f, stringOffset)) ? true : false;

  const getScaleDegree = (fret, stringOffset) => {
    const offset = getOffset(fret, stringOffset);
    switch (offset) {
      case 0:
        return '1';
        break;
      case 1:
        return 'b2';
        break;
      case 2:
        return '2';
        break;
      case 3:
        return 'b3';
        break;
      case 3.1:
        return '#2';
        break;
      case 4:
        return '3';
        break;
      case 5:
        return '4';
        break;
      case 6:
        return 'b5';
        break;
      case 6.1:
        return '#4';
        break;
      case 7:
        return '5';
        break;
      case 8:
        return 'b6';
        break;
      case 8.1:
        return '#5';
        break;
      case 9:
        return '6';
        break;
      case 10:
        return 'b7';
        break;
      case 11:
        return '7';
        break;
    }
  }

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
  }

  const getStringTranslate = (s) => {
    switch (s) {
      case 1:
        return 0;
        break;
      case 2:
        return 35;
        break;
      case 3:
        return 70;
        break;
      case 4:
        return 105;
        break;
      case 5:
        return 140;
        break;
      case 6:
        return 175;
        break;
    }
  };
  
  const x = getFretTranslate(fret);
  const y = getStringTranslate(string);
  const scaleDegree = getScaleDegree(fret, getString(string));
  const noteSize = 28;

  if (isNote(fret, getString(string))) return (
    <G transform={`translate(${x}, ${y})`}  >
      <Svg width={fret === 0 ? noteSize + 4 : noteSize} height={fret === 0 ? noteSize + 4 : noteSize}>
        <Circle cx={fret === 0 ? (noteSize / 2) + 2 : noteSize / 2} cy={fret === 0 ? (noteSize / 2) + 2 : noteSize / 2} r="12" stroke={fret === 0 ? theme.colors.grey : theme.colors.black} fill={fret === 0 ? theme.colors.white : scaleDegree === "1" ? theme.colors.white : theme.colors.black} strokeWidth={fret === 0 ? 2 : 4} />
        <Text fontFamily={processFontFamily("basicManual")} textAnchor="middle" x="49%" y="68%" fontSize={16} stroke={fret === 0 ? theme.colors.black : scaleDegree === "1" ? theme.colors.black : theme.colors.white} fill={fret === 0 ? theme.colors.black : scaleDegree === "1" ? theme.colors.black : theme.colors.white}>
          {scaleDegree}
        </Text>
      </Svg>
    </G>
  )
  return <></>;
}

export default Note;
