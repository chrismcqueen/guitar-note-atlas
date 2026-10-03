import React, { useContext } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Rect } from "react-native-svg";

import { Store } from "../../Store";
import AnchorFrets from "./Neck/AnchorFrets";
import Frets from "./Neck/Frets";
import Note from "./Neck/Note";
import Strings from "./Neck/Strings";
import { theme } from "../utils/theme";
import { getPosition, positionStartFret, stepPosition } from "../utils/positions.mjs";

const PositionZoom = ({ compact = false }) => {
  const { globalState, positionId, setPositionId, setShowPositionOverview } = useContext(Store);
  if (!globalState.options || !globalState.strings) return null;

  const position = getPosition(positionId);
  const startFret = positionStartFret(positionId, globalState.key.key_offset);
  const fretCount = position.short ? 5 : 6;
  const frets = [...Array(17).keys()];
  const standardTuning = globalState.options.bassMode ? globalState.strings.slice(-4) : globalState.strings;
  const tuning = globalState.options.upsideDown ? [...standardTuning].reverse() : standardTuning;
  const cropWidth = fretCount * 49 + 42;
  const cropX = Math.max(0, Math.min(864 - cropWidth, 40 + startFret * 49 - 22));
  const viewX = globalState.options.leftHand ? 864 - cropX - cropWidth : cropX;
  const bandX = globalState.options.leftHand
    ? 864 - (40 + (startFret + position.baseFret) * 49) - 49
    : 40 + (startFret + position.baseFret) * 49;
  const title = globalState.options.bassMode ? position.bassTitle : position.title;

  const neck = (
    <Svg width="100%" height="100%" viewBox={`${viewX} 0 ${cropWidth} 233`}>
      {!globalState.options.hideColors && (
        <Rect
          x={bandX}
          y={globalState.options.upsideDown ? (6 - position.height) * 36 : 0}
          width={49}
          height={position.height * 36}
          fill={theme.colors.blue}
        />
      )}
      <Strings count={tuning.length} />
      <Frets leftHand={globalState.options.leftHand} />
      {!globalState.options.hideAnchorFrets && <AnchorFrets leftHand={globalState.options.leftHand} />}
      {tuning.map((stringOffset, string) =>
        frets.map((fret) => (
          <Note key={`${string}-${fret}`} fret={fret} leftHand={globalState.options.leftHand} string={string + 1} stringCount={tuning.length} stringOffset={stringOffset} />
        )),
      )}
    </Svg>
  );

  if (compact) {
    return (
      <Pressable accessibilityHint="Returns to the full fretboard" accessibilityLabel={`${title} position`} onPress={() => setShowPositionOverview(true)} style={styles.phoneNeck}>
        {neck}
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      <Text numberOfLines={1} style={styles.title}>{title}</Text>
      <View style={styles.row}>
        <Pressable accessibilityLabel="Previous position" onPress={() => setPositionId((id) => stepPosition(id, -1))} style={styles.arrowButton}>
          <View style={[styles.arrow, styles.arrowLeft]} />
        </Pressable>
        <View style={styles.neck}>{neck}</View>
        <Pressable accessibilityLabel="Next position" onPress={() => setPositionId((id) => stepPosition(id, 1))} style={styles.arrowButton}>
          <View style={[styles.arrow, styles.arrowRight]} />
        </Pressable>
      </View>
    </View>
  );
};

export default PositionZoom;

const styles = StyleSheet.create({
  container: { alignItems: "center", height: 312, marginBottom: 144, transform: [{ translateY: 20 }], width: "100%" },
  title: { fontFamily: "proletarsk", fontSize: 40, letterSpacing: 6, marginBottom: 12 },
  row: { alignItems: "center", flex: 1, flexDirection: "row", justifyContent: "center" },
  neck: { height: 270, width: 470 },
  phoneNeck: { height: 250, width: "100%" },
  arrowButton: { marginHorizontal: 60, padding: 20 },
  arrow: { borderBottomColor: "transparent", borderBottomWidth: 90, borderTopColor: "transparent", borderTopWidth: 90, height: 0, width: 0 },
  arrowLeft: { borderRightColor: theme.colors.blue, borderRightWidth: 82 },
  arrowRight: { borderLeftColor: theme.colors.blue, borderLeftWidth: 82 },
});
