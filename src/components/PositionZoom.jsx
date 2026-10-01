import React, { useContext } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg from "react-native-svg";

import { Store } from "../../Store";
import AnchorFrets from "./Neck/AnchorFrets";
import Frets from "./Neck/Frets";
import Note from "./Neck/Note";
import Strings from "./Neck/Strings";
import { theme } from "../utils/theme";

const PositionZoom = () => {
  const { globalState, positionFret, setPositionFret } = useContext(Store);
  if (!globalState.options || !globalState.strings) return null;

  const frets = [...Array(17).keys()];
  const standardTuning = globalState.options.bassMode ? globalState.strings.slice(-4) : globalState.strings;
  const tuning = globalState.options.upsideDown ? [...standardTuning].reverse() : standardTuning;
  const cropX = 40 + 49 * (positionFret - 1);
  const viewX = globalState.options.leftHand ? 864 - cropX - 294 : cropX;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>POSITION · FRETS {positionFret}–{positionFret + 5}</Text>
      <View style={styles.row}>
        <Pressable
          accessibilityLabel="Previous position"
          disabled={positionFret === 1}
          onPress={() => setPositionFret((fret) => Math.max(1, fret - 1))}
          style={styles.arrowButton}
        >
          <View style={[styles.arrow, styles.arrowLeft, positionFret === 1 && styles.disabled]} />
        </Pressable>
        <View style={styles.neck}>
          <Svg width="100%" height="100%" viewBox={`${viewX} 0 294 210`}>
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
        <Pressable
          accessibilityLabel="Next position"
          disabled={positionFret === 11}
          onPress={() => setPositionFret((fret) => Math.min(11, fret + 1))}
          style={styles.arrowButton}
        >
          <View style={[styles.arrow, styles.arrowRight, positionFret === 11 && styles.disabled]} />
        </Pressable>
      </View>
    </View>
  );
};

export default PositionZoom;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    height: 210,
    width: "100%",
  },
  title: {
    fontFamily: "proletarsk",
    fontSize: 20,
    letterSpacing: 4,
  },
  row: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
  },
  neck: {
    height: 170,
    width: 330,
  },
  arrowButton: {
    padding: 24,
  },
  arrow: {
    borderBottomColor: "transparent",
    borderBottomWidth: 28,
    borderTopColor: "transparent",
    borderTopWidth: 28,
    height: 0,
    width: 0,
  },
  arrowLeft: {
    borderRightColor: theme.colors.blue,
    borderRightWidth: 28,
  },
  arrowRight: {
    borderLeftColor: theme.colors.blue,
    borderLeftWidth: 28,
  },
  disabled: {
    opacity: 0.25,
  },
});
