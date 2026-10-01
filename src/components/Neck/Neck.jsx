import React, { useContext } from "react";
import { StyleSheet, View } from "react-native";
import Svg from "react-native-svg";

import AnchorFrets from "./AnchorFrets";
import Note from "./Note";
import Frets from "./Frets";
import Strings from "./Strings";
import { Store } from "../../../Store";

const Neck = () => {
  const { dimensions, globalState, insets } = useContext(Store);
  const frets = [...Array(17).keys()];
  const standardTuning = globalState.options.bassMode ? globalState.strings.slice(-4) : globalState.strings;
  const tuning = globalState.options.upsideDown ? [...standardTuning].reverse() : standardTuning;
  const safeWidth = dimensions.width - insets.left - insets.right;
  const isTablet = dimensions.width >= 1000 && dimensions.height >= 550;
  const horizontalMargin = isTablet ? 32 : 8;
  const heightRatio = isTablet ? 0.25 : 0.56;
  const scale = Math.min((safeWidth - horizontalMargin) / 864, (dimensions.height * heightRatio) / 233, 1.3);
  const neckDimensions = { height: 233 * scale, width: 864 * scale };

  return (
    // TODO: make container responsive
    <View style={[styles.container, neckDimensions]}>
      <Svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 864 233">
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
    </View>
  );
};

export default Neck;

const styles = StyleSheet.create({
  container: {
    maxHeight: 303,
    maxWidth: 1123,
  },
});
