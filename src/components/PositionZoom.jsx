import React, { useContext } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Rect, Text as SvgText } from "react-native-svg";

import { Store } from "../../Store";
import coordinates from "../../data/positionCoordinates.json";
import { getScaleDegreeLabel } from "../utils/music.mjs";
import { getPosition, stepPosition } from "../utils/positions.mjs";
import { theme } from "../utils/theme";

const LEGACY_DEGREE_ID = { 0: 0, 1: 1, 2: 2, 3: 3, 3.1: 12, 4: 4, 5: 5, 6: 6, 6.1: 13, 7: 7, 8: 8, 8.1: 14, 9: 9, 10: 10, 11: 11 };
const WIDTH = 642;
const HEIGHT = 260;
const SPACING_X = 100;
const OFFSET_X = 21;
const OFFSET_Y = 24;
const STRING_GAP = 31;

const PositionZoom = ({ compact = false }) => {
  const { dimensions, globalState, insets, positionId, setPositionId, setShowPositionOverview } = useContext(Store);
  if (!globalState.options || !globalState.strings) return null;

  const position = getPosition(positionId);
  const bassMode = globalState.options.bassMode;
  const stringCount = bassMode ? 4 : 6;
  const fretCount = position.short ? 5 : 6;
  const title = bassMode ? position.bassTitle : position.title;
  const colorName = `position${position.color[0].toUpperCase()}${position.color.slice(1)}`;
  const labels = position.short ? ["1", "2", "3", "4", "(4)"] : ["(1)", "1", "2", "3", "4", "(4)"];
  const noteRadius = 16;
  const bandFret = globalState.options.leftHand ? fretCount - 1 - position.baseFret : position.baseFret;

  const notes = globalState.scale.degrees.flatMap((degree) => {
    const legacyId = LEGACY_DEGREE_ID[degree];
    return (coordinates[legacyId]?.[positionId] ?? []).flatMap((coordinate, index) => {
      if ((!bassMode && coordinate.y === 6) || (bassMode && coordinate.y < 2)) return [];
      let string = bassMode ? (coordinate.y === 6 ? 0 : coordinate.y - 2) : coordinate.y;
      if (globalState.options.upsideDown) string = stringCount - 1 - string;
      const xIndex = globalState.options.leftHand ? fretCount - coordinate.x : coordinate.x;
      return [{ ...coordinate, degree, key: `${degree}-${index}`, string, xIndex }];
    });
  });

  const neck = (
    <Svg width="100%" height="100%" viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
      {!globalState.options.hideColors && (
        <Rect
          x={OFFSET_X + bandFret * SPACING_X}
          y={globalState.options.upsideDown ? OFFSET_Y + (stringCount - Math.min(position.height, stringCount)) * STRING_GAP - STRING_GAP / 2 : 0}
          width={SPACING_X}
          height={Math.min(position.height, stringCount) * STRING_GAP + OFFSET_Y}
          fill={theme.colors[colorName]}
        />
      )}
      {[...Array(fretCount + 1).keys()].map((fret) => (
        <Line key={`fret-${fret}`} x1={OFFSET_X + fret * SPACING_X} x2={OFFSET_X + fret * SPACING_X} y1={OFFSET_Y} y2={OFFSET_Y + (stringCount - 1) * STRING_GAP} stroke={theme.colors.black} strokeWidth={fret === 0 ? 7 : 4} />
      ))}
      {[...Array(stringCount).keys()].map((string) => (
        <Line key={`string-${string}`} x1={position.short ? OFFSET_X : 0} x2={OFFSET_X + fretCount * SPACING_X} y1={OFFSET_Y + string * STRING_GAP} y2={OFFSET_Y + string * STRING_GAP} stroke={theme.colors.black} strokeWidth="4" />
      ))}
      {notes.map((note) => {
        const x = OFFSET_X + note.xIndex * SPACING_X + SPACING_X / 2;
        const y = OFFSET_Y + note.string * STRING_GAP;
        const gray = note.color === "gray";
        const white = note.color === "white";
        const fill = gray ? theme.colors.neckLightGray : white ? theme.colors.white : theme.colors.black;
        const stroke = gray ? theme.colors.neckDarkGray : theme.colors.black;
        const text = gray ? theme.colors.neckDarkGray : white ? theme.colors.black : theme.colors.white;
        return (
          <React.Fragment key={note.key}>
            <Circle cx={x} cy={y} r={noteRadius} fill={fill} stroke={stroke} strokeWidth={gray ? 2 : 4} />
            {globalState.options.showScaleDegree && (
              <SvgText x={x + 1} y={y + (String(getScaleDegreeLabel(note.degree)).length === 1 ? 9 : 11)} textAnchor="middle" fontFamily="basicManual" fontSize="27" fill={text}>
                {getScaleDegreeLabel(note.degree)}
              </SvgText>
            )}
          </React.Fragment>
        );
      })}
      {labels.map((label, index) => (
        <SvgText key={label + index} x={OFFSET_X + (globalState.options.leftHand ? labels.length - 1 - index : index) * SPACING_X + SPACING_X / 2} y="225" textAnchor="middle" fontFamily="basicManual" fontSize="27" fill={theme.colors.black}>
          {label}
        </SvgText>
      ))}
    </Svg>
  );

  const previous = () => setPositionId((id) => stepPosition(id, -1));
  const next = () => setPositionId((id) => stepPosition(id, 1));
  const safeWidth = dimensions.width - insets.left - insets.right;
  const compactNeckWidth = Math.min(safeWidth * 0.58, 560);

  return (
    <View style={[styles.container, compact && styles.phoneContainer]}>
      <Text numberOfLines={1} style={[styles.title, compact && styles.phoneTitle]}>{title}</Text>
      <View style={styles.row}>
        <Pressable accessibilityLabel="Previous position" onPress={previous} style={[styles.arrowButton, compact && styles.phoneArrowButton]}>
          <View style={[styles.arrow, styles.arrowLeft, compact && styles.phoneArrow]} />
        </Pressable>
        <Pressable
          accessibilityHint={compact ? "Returns to the full fretboard" : undefined}
          accessibilityLabel={`${title} position`}
          disabled={!compact}
          onPress={() => setShowPositionOverview(true)}
          style={[styles.neck, compact && { height: Math.min(245, (compactNeckWidth * HEIGHT) / WIDTH), width: compactNeckWidth }]}
        >
          {neck}
        </Pressable>
        <Pressable accessibilityLabel="Next position" onPress={next} style={[styles.arrowButton, compact && styles.phoneArrowButton]}>
          <View style={[styles.arrow, styles.arrowRight, compact && styles.phoneArrow]} />
        </Pressable>
      </View>
    </View>
  );
};

export default PositionZoom;

const styles = StyleSheet.create({
  container: { alignItems: "center", height: 312, marginBottom: 144, transform: [{ translateY: 20 }], width: "100%" },
  phoneContainer: { height: 292, marginBottom: 0, transform: [{ translateY: 8 }] },
  title: { fontFamily: "proletarsk", fontSize: 40, letterSpacing: 6, marginBottom: 12 },
  phoneTitle: { fontSize: 31, letterSpacing: 5, marginBottom: 2 },
  row: { alignItems: "center", flex: 1, flexDirection: "row", justifyContent: "center" },
  neck: { height: 270, width: 470 },
  arrowButton: { marginHorizontal: 60, padding: 20 },
  phoneArrowButton: { marginHorizontal: 12, padding: 8 },
  arrow: { borderBottomColor: "transparent", borderBottomWidth: 90, borderTopColor: "transparent", borderTopWidth: 90, height: 0, width: 0 },
  phoneArrow: { borderBottomWidth: 58, borderTopWidth: 58 },
  arrowLeft: { borderRightColor: theme.colors.blue, borderRightWidth: 82 },
  arrowRight: { borderLeftColor: theme.colors.blue, borderLeftWidth: 82 },
});
