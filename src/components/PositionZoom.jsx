import React, { useContext } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Rect, Text as SvgText } from "react-native-svg";

import { Store } from "../../Store";
import coordinates from "../../data/positionCoordinates.json";
import DegreeLabel from "./Neck/DegreeLabel";
import { getScaleDegreeLabel } from "../utils/music.mjs";
import { getPosition, positionBandVerticalGeometry, stepPosition } from "../utils/positions.mjs";
import { theme } from "../utils/theme";

const LEGACY_DEGREE_ID = { 0: 0, 1: 1, 2: 2, 3: 3, 3.1: 12, 4: 4, 5: 5, 6: 6, 6.1: 13, 7: 7, 8: 8, 8.1: 14, 9: 9, 10: 10, 11: 11 };
const WIDTH = 642;
const SPACING_X = 100;
const OFFSET_X = 21;
const OFFSET_Y = 24;
const PHONE_HEIGHT = 290;
const PHONE_STRING_GAP = 44;

const PhoneNeckBackdrop = ({ bassMode, height, short, stringCount, width }) => {
  const activeWidth = width * 0.53;
  const fretWidth = activeWidth / 6.42;
  const activeOffset = OFFSET_X + (short ? SPACING_X / 2 : 0);
  const firstFret = (width - activeWidth) / 2 + activeOffset * (activeWidth / WIDTH);
  const yScale = height / PHONE_HEIGHT;
  const top = OFFSET_Y * (bassMode ? 2.1 : 1) * yScale;
  const gap = PHONE_STRING_GAP * (bassMode ? 1.3 : 1) * yScale;
  const bottom = top + (stringCount - 1) * gap;
  const lineColor = theme.colors.neckLightGray;

  return (
    <Svg pointerEvents="none" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {[...Array(13).keys()].map((index) => {
        const x = firstFret + (index - 3) * fretWidth;
        return <Line key={`backdrop-fret-${index}`} x1={x} x2={x} y1={top} y2={bottom} stroke={lineColor} strokeWidth="3" />;
      })}
      {[...Array(stringCount).keys()].map((string) => {
        const y = top + string * gap;
        return <Line key={`backdrop-string-${string}`} x1="0" x2={width} y1={y} y2={y} stroke={lineColor} strokeWidth="3" />;
      })}
    </Svg>
  );
};

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
  const safeSideInset = Math.max(insets.left, insets.right);
  const safeWidth = dimensions.width - safeSideInset * 2;
  const compactNeckWidth = safeWidth * 0.53;
  const compactNeckHeight = compactNeckWidth * (PHONE_HEIGHT / WIDTH);
  const compactArrowRegionWidth = (safeWidth - compactNeckWidth) / 2;
  const compactArrowHeight = dimensions.height * 0.32;
  const tabletNeckWidth = Math.min(dimensions.width * 0.5, safeWidth * 0.56, 650);
  // The legacy controller's height excluded the iOS navigation chrome. On a
  // modern full-screen window that works out to roughly 320 points.
  const tabletNeckHeight = Math.min(dimensions.height * 0.45, 320);
  const tabletViewBoxHeight = WIDTH * (tabletNeckHeight / tabletNeckWidth);
  const tabletRadius = tabletViewBoxHeight / 6.6 / 2.3;
  const noteRadius = compact ? 16 : tabletRadius * 0.75;
  const noteStrokeWidth = compact ? 4 : tabletRadius / 4;
  const lineWidth = compact ? 4 : tabletRadius / 5.1;
  const labelFontSize = compact ? 27 : tabletRadius * 1.5;
  const horizontalOffset = OFFSET_X + (position.short ? SPACING_X / 2 : 0);
  const tabletStringGap = Math.floor((tabletViewBoxHeight - tabletViewBoxHeight / 4.5) / 5.44);
  const baseStringGap = compact ? PHONE_STRING_GAP : tabletStringGap;
  const stringGap = baseStringGap * (bassMode ? 1.3 : 1);
  const baseVerticalOffset = compact ? OFFSET_Y : tabletViewBoxHeight / 4.5 / 3.2;
  const verticalOffset = baseVerticalOffset * (bassMode ? 2.1 : 1);
  const viewBoxHeight = compact ? PHONE_HEIGHT : tabletViewBoxHeight;
  const bandFret = globalState.options.leftHand ? fretCount - 1 - position.baseFret : position.baseFret;
  const band = positionBandVerticalGeometry({
    bassMode,
    height: position.height,
    stringGap,
    upsideDown: globalState.options.upsideDown,
    verticalOffset: baseVerticalOffset,
  });

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
    <Svg width="100%" height="100%" viewBox={`0 0 ${WIDTH} ${viewBoxHeight}`}>
      {!globalState.options.hideColors && (
        <Rect
          x={horizontalOffset + bandFret * SPACING_X}
          y={band.y}
          width={SPACING_X}
          height={band.height}
          fill={theme.colors[colorName]}
        />
      )}
      {[...Array(fretCount + 1).keys()].map((fret) => (
        <Line key={`fret-${fret}`} x1={horizontalOffset + fret * SPACING_X} x2={horizontalOffset + fret * SPACING_X} y1={verticalOffset} y2={verticalOffset + (stringCount - 1) * stringGap} stroke={theme.colors.black} strokeWidth={compact && fret === 0 ? 7 : lineWidth} />
      ))}
      {[...Array(stringCount).keys()].map((string) => (
        <Line key={`string-${string}`} x1={position.short ? SPACING_X / 2 : 0} x2={position.short ? WIDTH - SPACING_X / 2 : WIDTH} y1={verticalOffset + string * stringGap} y2={verticalOffset + string * stringGap} stroke={theme.colors.black} strokeWidth={lineWidth} />
      ))}
      {notes.map((note) => {
        const x = horizontalOffset + note.xIndex * SPACING_X + SPACING_X / 2;
        const y = verticalOffset + note.string * stringGap;
        const gray = note.color === "gray";
        const white = note.color === "white";
        const fill = gray ? theme.colors.neckLightGray : white ? theme.colors.white : theme.colors.black;
        const stroke = gray ? theme.colors.neckDarkGray : theme.colors.black;
        const text = gray ? theme.colors.neckDarkGray : white ? theme.colors.black : theme.colors.white;
        return (
          <React.Fragment key={note.key}>
            <Circle cx={x} cy={y} r={noteRadius} fill={fill} stroke={stroke} strokeWidth={gray ? Math.max(1, noteStrokeWidth - 1) : noteStrokeWidth} />
            {globalState.options.showScaleDegree && (
              <DegreeLabel
                fill={text}
                fontSize={labelFontSize}
                label={getScaleDegreeLabel(note.degree)}
                x={x + 1}
                y={y + (String(getScaleDegreeLabel(note.degree)).length === 1 ? 9 : 11)}
              />
            )}
          </React.Fragment>
        );
      })}
      {labels.map((label, index) => (
        <SvgText key={label + index} x={horizontalOffset + (globalState.options.leftHand ? labels.length - 1 - index : index) * SPACING_X + SPACING_X / 2} y={compact ? 280 : verticalOffset + (stringCount - 1) * stringGap + labelFontSize * 1.15} textAnchor="middle" fontFamily="jrHand" fontSize={labelFontSize} fill={theme.colors.black}>
          {label}
        </SvgText>
      ))}
    </Svg>
  );

  const previous = () => setPositionId((id) => stepPosition(id, -1));
  const next = () => setPositionId((id) => stepPosition(id, 1));
  return (
    <View style={[styles.container, compact && styles.phoneContainer]}>
      <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.title, compact && styles.phoneTitle]}>{title}</Text>
      <View style={[styles.row, compact && styles.phoneRow]}>
        {compact && (
          <View pointerEvents="none" style={[styles.phoneBackdrop, { height: compactNeckHeight, transform: [{ translateY: -compactNeckHeight / 2 }], width: safeWidth }]}>
            <PhoneNeckBackdrop bassMode={bassMode} height={compactNeckHeight} short={position.short} stringCount={stringCount} width={safeWidth} />
          </View>
        )}
        <Pressable
          accessibilityLabel="Previous position"
          onPress={previous}
          style={[styles.arrowButton, compact && styles.phoneArrowButton, compact && { height: compactNeckHeight, width: compactArrowRegionWidth }]}
        >
          <View style={[styles.arrow, styles.arrowLeft, compact && { borderBottomWidth: compactArrowHeight / 2, borderRightWidth: compactArrowHeight / 2, borderTopWidth: compactArrowHeight / 2 }]} />
        </Pressable>
        <Pressable
          accessibilityHint={compact ? "Returns to the full fretboard" : undefined}
          accessibilityLabel={`${title} position`}
          disabled={!compact}
          onPress={() => setShowPositionOverview(true)}
          style={[styles.neck, compact ? { height: compactNeckHeight, width: compactNeckWidth } : { height: tabletNeckHeight, width: tabletNeckWidth }]}
        >
          {neck}
        </Pressable>
        <Pressable
          accessibilityLabel="Next position"
          onPress={next}
          style={[styles.arrowButton, compact && styles.phoneArrowButton, compact && { height: compactNeckHeight, width: compactArrowRegionWidth }]}
        >
          <View style={[styles.arrow, styles.arrowRight, compact && { borderBottomWidth: compactArrowHeight / 2, borderLeftWidth: compactArrowHeight / 2, borderTopWidth: compactArrowHeight / 2 }]} />
        </Pressable>
      </View>
    </View>
  );
};

export default PositionZoom;

const styles = StyleSheet.create({
  container: { alignItems: "center", height: 370, marginBottom: 35, transform: [{ translateY: 20 }], width: "100%" },
  phoneContainer: { height: 292, marginBottom: 0, transform: [{ translateY: 8 }] },
  title: { fontFamily: "proletarsk", fontSize: 40, letterSpacing: 6, marginBottom: 12, textAlign: "center" },
  phoneTitle: { fontSize: 31, letterSpacing: 5, lineHeight: 38, marginBottom: 18, width: "62%" },
  row: { alignItems: "center", flex: 1, flexDirection: "row", justifyContent: "space-between", width: "100%" },
  phoneRow: { justifyContent: "center" },
  phoneBackdrop: { position: "absolute", top: "50%" },
  neck: { height: 270, width: 470 },
  arrowButton: { marginHorizontal: 60, padding: 20 },
  phoneArrowButton: { alignItems: "center", justifyContent: "center", marginHorizontal: 0, padding: 0, zIndex: 2 },
  arrow: { borderBottomColor: "transparent", borderBottomWidth: 90, borderTopColor: "transparent", borderTopWidth: 90, height: 0, width: 0 },
  arrowLeft: { borderRightColor: theme.colors.blue, borderRightWidth: 82 },
  arrowRight: { borderLeftColor: theme.colors.blue, borderLeftWidth: 82 },
});
