import React, { useContext } from "react";
import { View } from "react-native";
import Svg, { G } from "react-native-svg";

import { Store } from "../../Store";
import AnchorFrets from "./Neck/AnchorFrets";
import Frets from "./Neck/Frets";
import Note from "./Neck/Note";
import Strings from "./Neck/Strings";

const VIEWBOX_HEIGHT = 175;
const STRING_SPAN = 120;

const TabletNeck = () => {
  const { dimensions, globalState, insets } = useContext(Store);
  const frets = [...Array(17).keys()];
  const standardTuning = globalState.options.bassMode ? globalState.strings.slice(-4) : globalState.strings;
  const tuning = globalState.options.upsideDown ? [...standardTuning].reverse() : standardTuning;
  const width = dimensions.width - insets.left - insets.right - 8;
  const height = (width * VIEWBOX_HEIGHT) / 864;

  return (
    <View style={{ height, width }}>
      <Svg width="100%" height="100%" viewBox={`0 0 864 ${VIEWBOX_HEIGHT}`}>
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
                key={`${string}-${fret}`}
                fret={fret}
                leftHand={globalState.options.leftHand}
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
