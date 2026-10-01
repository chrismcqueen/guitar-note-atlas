import React, { useContext } from "react";
import { StyleSheet, View } from "react-native";
import Svg from "react-native-svg";

import AnchorFrets from "./AnchorFrets";
import Note from "./Note";
import Frets from "./Frets";
import Strings from "./Strings";
import { Store } from "../../../Store";

const Neck = () => {
  const { globalState } = useContext(Store);
  const frets = [...Array(17).keys()];
  const standardTuning = globalState.options.bassMode ? globalState.strings.slice(-4) : globalState.strings;
  const tuning = globalState.options.upsideDown ? [...standardTuning].reverse() : standardTuning;

  return (
    // TODO: make container responsive
    <View style={styles.container}>
      <Svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
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
    height: 233,
    right: 20,
    width: 838,
  },
});
