import React, { useContext } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Defs, Line, LinearGradient, Rect, Stop, Text as SvgText } from "react-native-svg";

import { PositionActionsStore, PositionStore, Store } from "../../Store";
import coordinates from "../../data/positionCoordinates.json";
import DegreeLabel from "./Neck/DegreeLabel";
import { getScaleDegreeLabel } from "../utils/music.mjs";
import { getPosition, positionBandVerticalGeometry, resolvedPositionFret, stepPositionTarget } from "../utils/positions.mjs";
import { theme } from "../utils/theme";
import { withPressedOpacity } from "../utils/pressable";

const LEGACY_DEGREE_ID = { 0: 0, 1: 1, 2: 2, 3: 3, 3.1: 12, 4: 4, 5: 5, 6: 6, 6.1: 13, 7: 7, 8: 8, 8.1: 14, 9: 9, 10: 10, 11: 11 };
const WIDTH = 642;
const SPACING_X = 100;
const OFFSET_X = 21;
const OFFSET_Y = 24;
const PhoneNeckBackdrop = ({ bassMode, height, neckWidth, short, stringCount, width }) => {
  const activeWidth = neckWidth;
  const fretWidth = activeWidth / 6.42;
  const activeOffset = OFFSET_X + (short ? SPACING_X / 2 : 0);
  const firstFret = (width - activeWidth) / 2 + activeOffset * (activeWidth / WIDTH);
  const viewBoxHeight = WIDTH * (height / activeWidth);
  const initialVerticalSpacing = viewBoxHeight / 4.5;
  const verticalOffset = initialVerticalSpacing / 3.2;
  const gap = Math.floor((viewBoxHeight - initialVerticalSpacing) / 5.44) * (bassMode ? 1.3 : 1);
  const top = verticalOffset * (bassMode ? 2.1 : 1) * (activeWidth / WIDTH);
  const physicalGap = gap * (activeWidth / WIDTH);
  const lineColor = theme.colors.neckLightGray;
  const activeStart = (width - activeWidth) / 2;
  const activeEnd = activeStart + activeWidth;

  return (
    <Svg pointerEvents="none" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Defs>
        <LinearGradient id="position-backdrop-fade" gradientUnits="userSpaceOnUse" x1="0" x2={width} y1="0" y2="0">
          <Stop offset="0" stopColor={lineColor} stopOpacity="0" />
          <Stop offset={activeStart / width} stopColor={lineColor} stopOpacity="1" />
          <Stop offset={activeEnd / width} stopColor={lineColor} stopOpacity="1" />
          <Stop offset="1" stopColor={lineColor} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      {[...Array(13).keys()].map((index) => {
        const x = firstFret + (index - 3) * fretWidth;
        return <Line key={`backdrop-fret-${index}`} x1={x} x2={x} y1={top} y2={top + (stringCount - 1) * physicalGap} stroke="url(#position-backdrop-fade)" strokeWidth="3" />;
      })}
      {[...Array(stringCount).keys()].map((string) => {
        const y = top + string * physicalGap;
        return <Line key={`backdrop-string-${string}`} x1="0" x2={width} y1={y} y2={y} stroke="url(#position-backdrop-fade)" strokeWidth="3" />;
      })}
    </Svg>
  );
};

const PositionZoom = ({ compact = false }) => {
  const { dimensions, globalState, insets } = useContext(Store);
  const { positionFret, positionId } = useContext(PositionStore);
  const { setPositionFret, setPositionId, setShowPositionOverview } = useContext(PositionActionsStore);
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
  const compactNeckWidth = safeWidth * 0.505;
  const compactNeckHeight = dimensions.height * 0.53;
  const compactArrowRegionWidth = (safeWidth - compactNeckWidth) / 2;
  const compactArrowHeight = dimensions.height * 0.295;
  // The released iPad app drew into a narrower compatibility canvas. Using
  // that observed width preserves the original gap between the neck and its
  // position arrows on modern full-screen iPads.
  const tabletNeckWidth = dimensions.width * 0.46;
  const tabletNeckHeight = dimensions.height * 0.45;
  const tabletArrowOffsetY = -tabletNeckHeight * 0.08 + 11;
  const displayNeckWidth = compact ? compactNeckWidth : tabletNeckWidth;
  const displayNeckHeight = compact ? compactNeckHeight : tabletNeckHeight;
  const viewBoxHeight = WIDTH * (displayNeckHeight / displayNeckWidth);
  const radius = viewBoxHeight / 6.6 / 2.3;
  // The released iPad build is compatibility-letterboxed. Its UIKit radius
  // formula therefore lands at about 75% of the same formula in a modern
  // full-screen window.
  const noteRadius = radius * 0.75;
  const noteStrokeWidth = radius / 4;
  const lineWidth = radius / (compact ? 4.8 : 5.1);
  const labelFontSize = noteRadius * 1.5;
  // The released app sizes the finger labels before applying the smaller
  // main-neck note radius. Keep that independent calculation so the labels
  // retain their original scale on both phone and tablet zoom views.
  const fingerLabelFontSize = viewBoxHeight / 9.6;
  const horizontalOffset = OFFSET_X + (position.short ? SPACING_X / 2 : 0);
  const initialVerticalSpacing = viewBoxHeight / 4.5;
  const baseStringGap = Math.floor((viewBoxHeight - initialVerticalSpacing) / 5.44);
  const stringGap = baseStringGap * (bassMode ? 1.3 : 1);
  const renderedStringGap = stringGap * (compact ? 1 : 0.94);
  const baseVerticalOffset = initialVerticalSpacing / 3.2;
  const verticalOffset = baseVerticalOffset * (bassMode ? 2.1 : 1);
  const tabletGridOffset = compact ? 0 : 20;
  const compactScale = compactNeckWidth / WIDTH;
  const compactGridCenter = (verticalOffset + ((stringCount - 1) * stringGap) / 2) * compactScale;
  const compactArrowOffsetY = compactGridCenter - compactNeckHeight / 2;
  const bandFret = globalState.options.leftHand ? fretCount - 1 - position.baseFret : position.baseFret;
  const band = positionBandVerticalGeometry({
    bassMode,
    height: position.height,
    stringGap: renderedStringGap,
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
          y={band.y + tabletGridOffset}
          width={SPACING_X}
          height={band.height}
          fill={theme.colors[colorName]}
        />
      )}
      {[...Array(fretCount + 1).keys()].map((fret) => (
        <Line key={`fret-${fret}`} x1={horizontalOffset + fret * SPACING_X} x2={horizontalOffset + fret * SPACING_X} y1={verticalOffset + tabletGridOffset} y2={verticalOffset + tabletGridOffset + (stringCount - 1) * renderedStringGap} stroke={theme.colors.black} strokeWidth={compact && fret === 0 ? 7 : lineWidth} />
      ))}
      {[...Array(stringCount).keys()].map((string) => (
        <Line key={`string-${string}`} x1={position.short ? SPACING_X / 2 : 0} x2={position.short ? WIDTH - SPACING_X / 2 : WIDTH} y1={verticalOffset + tabletGridOffset + string * renderedStringGap} y2={verticalOffset + tabletGridOffset + string * renderedStringGap} stroke={theme.colors.black} strokeWidth={lineWidth} />
      ))}
      {notes.map((note) => {
        const x = horizontalOffset + note.xIndex * SPACING_X + SPACING_X / 2;
        const y = verticalOffset + tabletGridOffset + note.string * renderedStringGap;
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
        <SvgText key={label + index} x={horizontalOffset + (globalState.options.leftHand ? labels.length - 1 - index : index) * SPACING_X + SPACING_X / 2} y={verticalOffset + 5.45 * baseStringGap + fingerLabelFontSize * 0.75 + (compact ? 0 : 6)} textAnchor="middle" fontFamily="jrHand" fontSize={fingerLabelFontSize} fill={theme.colors.black}>
          {label}
        </SvgText>
      ))}
    </Svg>
  );

  const stepSelection = (amount) => {
    const currentFret = resolvedPositionFret(positionId, positionFret, globalState.key.key_offset);
    const nextTarget = stepPositionTarget(positionId, currentFret, amount, globalState.key.key_offset);
    setPositionId(nextTarget.id);
    setPositionFret(nextTarget.fret);
  };
  const previous = () => stepSelection(-1);
  const next = () => stepSelection(1);
  return (
    <View style={[styles.container, !compact && { height: dimensions.height * 0.53 }, compact && styles.phoneContainer]}>
      <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.title, compact && styles.phoneTitle]}>{title}</Text>
      <View style={[styles.row, compact && styles.phoneRow]}>
        {compact && (
          <View pointerEvents="none" style={[styles.phoneBackdrop, { height: compactNeckHeight, transform: [{ translateY: -compactNeckHeight / 2 }], width: safeWidth }]}>
            <PhoneNeckBackdrop bassMode={bassMode} height={compactNeckHeight} neckWidth={compactNeckWidth} short={position.short} stringCount={stringCount} width={safeWidth} />
          </View>
        )}
        <Pressable
          android_disableSound
          accessibilityLabel="Previous position"
          onPress={previous}
          style={withPressedOpacity([styles.arrowButton, !compact && styles.tabletArrowButton, !compact && { height: tabletNeckHeight * 0.5, left: safeWidth * 0.133, transform: [{ translateY: tabletArrowOffsetY }], width: tabletNeckHeight * 0.25 }, compact && styles.phoneArrowButton, compact && { height: compactNeckHeight, transform: [{ translateY: compactArrowOffsetY }], width: compactArrowRegionWidth }])}
        >
          <View style={[styles.arrow, styles.arrowLeft, !compact && { borderBottomWidth: tabletNeckHeight * 0.232, borderRightWidth: tabletNeckHeight * 0.232, borderTopWidth: tabletNeckHeight * 0.232 }, compact && { borderBottomWidth: compactArrowHeight / 2, borderRightWidth: compactArrowHeight / 2, borderTopWidth: compactArrowHeight / 2 }]} />
        </Pressable>
        <Pressable
          android_disableSound
          accessibilityHint={compact ? "Returns to the full fretboard" : undefined}
          accessibilityLabel={`${title} position`}
          disabled={!compact}
          onPress={() => setShowPositionOverview(true)}
          style={compact ? withPressedOpacity([styles.neck, { height: compactNeckHeight, width: compactNeckWidth }]) : [styles.neck, { height: tabletNeckHeight, width: tabletNeckWidth }]}
        >
          {neck}
        </Pressable>
        <Pressable
          android_disableSound
          accessibilityLabel="Next position"
          onPress={next}
          style={withPressedOpacity([styles.arrowButton, !compact && styles.tabletArrowButton, !compact && { height: tabletNeckHeight * 0.5, right: safeWidth * 0.133, transform: [{ translateY: tabletArrowOffsetY }], width: tabletNeckHeight * 0.25 }, compact && styles.phoneArrowButton, compact && { height: compactNeckHeight, transform: [{ translateY: compactArrowOffsetY }], width: compactArrowRegionWidth }])}
        >
          <View style={[styles.arrow, styles.arrowRight, !compact && { borderBottomWidth: tabletNeckHeight * 0.232, borderLeftWidth: tabletNeckHeight * 0.232, borderTopWidth: tabletNeckHeight * 0.232 }, compact && { borderBottomWidth: compactArrowHeight / 2, borderLeftWidth: compactArrowHeight / 2, borderTopWidth: compactArrowHeight / 2 }]} />
        </Pressable>
      </View>
    </View>
  );
};

export default PositionZoom;

const styles = StyleSheet.create({
  container: { alignItems: "center", height: 370, marginBottom: 35, transform: [{ translateY: 20 }], width: "100%" },
  phoneContainer: { height: 292, marginBottom: 0, transform: [{ translateY: 30 }] },
  title: { fontFamily: "proletarsk", fontSize: 40, letterSpacing: 6, marginBottom: 12, textAlign: "center" },
  phoneTitle: { fontSize: 31, letterSpacing: 5, lineHeight: 38, marginBottom: 18, transform: [{ translateY: 12 }], width: "62%" },
  row: { alignItems: "center", flex: 1, flexDirection: "row", justifyContent: "center", width: "100%" },
  phoneRow: { justifyContent: "center" },
  phoneBackdrop: { position: "absolute", top: "50%" },
  neck: { height: 270, width: 470 },
  arrowButton: { alignItems: "center", justifyContent: "center", padding: 0 },
  tabletArrowButton: { position: "absolute", zIndex: 2 },
  phoneArrowButton: { alignItems: "center", justifyContent: "center", marginHorizontal: 0, padding: 0, zIndex: 2 },
  arrow: { borderBottomColor: "transparent", borderBottomWidth: 90, borderTopColor: "transparent", borderTopWidth: 90, height: 0, width: 0 },
  arrowLeft: { borderRightColor: theme.colors.blue, borderRightWidth: 82 },
  arrowRight: { borderLeftColor: theme.colors.blue, borderLeftWidth: 82 },
});
