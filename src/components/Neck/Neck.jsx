import React, { useContext } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Svg from "react-native-svg";

import AnchorFrets from "./AnchorFrets";
import Note from "./Note";
import Frets from "./Frets";
import Strings from "./Strings";
import PositionBands from "./PositionBands";
import { Store } from "../../../Store";
import { positionForFret } from "../../utils/positions.mjs";

const Neck = () => {
  const { dimensions, globalState, insets, setPositionId, setShowPositionOverview } = useContext(Store);
  const frets = [...Array(17).keys()];
  const standardTuning = globalState.options.bassMode ? globalState.strings.slice(-4) : globalState.strings;
  const tuning = globalState.options.upsideDown ? [...standardTuning].reverse() : standardTuning;
  const safeWidth = dimensions.width - insets.left - insets.right;
  const isTablet = dimensions.width >= 1000 && dimensions.height >= 550;
  const horizontalMargin = 8;
  const heightRatio = isTablet ? 0.38 : 0.56;
  const maxScale = isTablet ? 1.85 : 1.3;
  const scale = Math.min((safeWidth - horizontalMargin) / 864, (dimensions.height * heightRatio) / 233, maxScale);
  const neckDimensions = { height: 233 * scale, width: 864 * scale };

  return (
    // TODO: make container responsive
    <Pressable
      accessibilityHint="Opens the selected fretboard position"
      accessibilityLabel="Full fretboard overview"
      onPress={(event) => {
        const x = event.nativeEvent.locationX / scale;
        const visualFret = Math.max(0, Math.min(16, Math.floor((x - 40) / 49)));
        const fret = globalState.options.leftHand ? 16 - visualFret : visualFret;
        setPositionId(positionForFret(fret, globalState.key.key_offset));
        setShowPositionOverview(false);
      }}
      style={[styles.container, neckDimensions]}
    >
      <Svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 864 233">
        {!globalState.options.hideColors && (
          <PositionBands bassMode={globalState.options.bassMode} leftHand={globalState.options.leftHand} upsideDown={globalState.options.upsideDown} />
        )}
        <Strings count={tuning.length} />
        <Frets leftHand={globalState.options.leftHand} />
        {!globalState.options.hideAnchorFrets && <AnchorFrets leftHand={globalState.options.leftHand} />}
        {tuning.map((stringOffset, string) =>
          frets.map((fret) => (
            <Note
              key={`${string}-${fret}`}
              fret={fret}
              leftHand={globalState.options.leftHand}
              string={string + 1}
              stringCount={tuning.length}
              stringOffset={stringOffset}
            />
          )),
        )}
      </Svg>
    </Pressable>
  );
};

export default Neck;

const styles = StyleSheet.create({
  container: {
    maxHeight: 303,
    maxWidth: 1123,
  },
});
