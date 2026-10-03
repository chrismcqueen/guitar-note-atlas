import React, { useContext } from "react";
import { View } from "react-native";
import Svg, { G, Rect } from "react-native-svg";

import { Store } from "../../Store";
import AnchorFrets from "./Neck/AnchorFrets";
import Frets from "./Neck/Frets";
import Note from "./Neck/Note";
import Strings from "./Neck/Strings";
import PositionBands from "./Neck/PositionBands";
import { getPosition, positionStartFret } from "../utils/positions.mjs";
import { theme } from "../utils/theme";

const VIEWBOX_HEIGHT = 175;
const STRING_SPAN = 120;
const FRET_WIDTH = 49;
const NECK_LEFT = 40;
const NECK_RIGHT = 842;

const TabletNeck = () => {
  const { dimensions, globalState, insets, positionId } = useContext(Store);
  const frets = [...Array(17).keys()];
  const standardTuning = globalState.options.bassMode ? globalState.strings.slice(-4) : globalState.strings;
  const tuning = globalState.options.upsideDown ? [...standardTuning].reverse() : standardTuning;
  const width = dimensions.width - insets.left - insets.right - 8;
  const height = (width * VIEWBOX_HEIGHT) / 864;
  const position = getPosition(positionId);
  const selectedFret = positionStartFret(positionId, globalState.key.key_offset);
  const selectedFretCount = position.short ? 5 : 6;
  const selectedWidth = selectedFretCount * FRET_WIDTH;
  const naturalSelectedX = NECK_LEFT + selectedFret * FRET_WIDTH;
  const selectedX = globalState.options.leftHand ? 864 - naturalSelectedX - selectedWidth : naturalSelectedX;

  return (
    <View style={{ height, width }}>
      <Svg width="100%" height="100%" viewBox={`0 0 864 ${VIEWBOX_HEIGHT}`}>
        <Rect x={NECK_LEFT} y="14" width={NECK_RIGHT - NECK_LEFT} height={STRING_SPAN} fill={theme.colors.neckLightGray} />
        <Rect x={selectedX} y="14" width={selectedWidth} height={STRING_SPAN} fill={theme.colors.white} />
        {!globalState.options.hideColors && (
          <PositionBands bassMode={globalState.options.bassMode} keyOffset={globalState.key.key_offset} leftHand={globalState.options.leftHand} muted upsideDown={globalState.options.upsideDown} />
        )}
        <G opacity={0.58}>
          <Strings count={tuning.length} span={STRING_SPAN} />
          <G transform="translate(0 4) scale(1 0.67)">
            <Frets leftHand={globalState.options.leftHand} />
          </G>
          {!globalState.options.hideAnchorFrets && (
            <G transform="translate(0 -65)">
              <AnchorFrets leftHand={globalState.options.leftHand} />
            </G>
          )}
          {tuning.map((stringOffset, string) =>
            frets.map((fret) => (
              <Note
                centerInFrets
                circleRadius={9.5}
                circleStrokeWidth={2.5}
                key={`${string}-${fret}`}
                fret={fret}
                labelFontSize={18}
                leftHand={globalState.options.leftHand}
                noteSizeOverride={22}
                string={string + 1}
                stringCount={tuning.length}
                stringOffset={stringOffset}
                stringSpan={STRING_SPAN}
              />
            )),
          )}
        </G>
      </Svg>
    </View>
  );
};

export default TabletNeck;
