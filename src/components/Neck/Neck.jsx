import React, { useContext, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { ClipPath, Defs, G, Rect } from "react-native-svg";

import AnchorFrets from "./AnchorFrets";
import Note from "./Note";
import Frets from "./Frets";
import Strings from "./Strings";
import PositionBands from "./PositionBands";
import { PositionActionsStore, Store } from "../../../Store";
import { fretForNeckX, getPosition, positionDisplayFret, positionTargetForFret } from "../../utils/positions.mjs";
import { theme } from "../../utils/theme";

const FRET_WIDTH = 49;
const NECK_LEFT = 40;
const NECK_RIGHT = 842;
const STRING_SPAN = 180;
const LINE_WIDTH = 3;
const ACTIVE_CLIP_OVERDRAW = LINE_WIDTH;

const Neck = React.memo(() => {
  const { dimensions, globalState, insets } = useContext(Store);
  const { setPositionFret, setPositionId, setShowPositionOverview } = useContext(PositionActionsStore);
  const [pressedPositionId, setPressedPositionId] = useState(null);
  const [pressedPositionFret, setPressedPositionFret] = useState(null);
  const pressedTargetRef = useRef(null);
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
  const pressedPosition = pressedPositionId === null ? null : getPosition(pressedPositionId);
  const selectedFret = pressedPosition && positionDisplayFret(pressedPositionId, pressedPositionFret, globalState.key.key_offset);
  const selectedFretCount = pressedPosition?.short ? 5 : 6;
  const selectedWidth = selectedFretCount * FRET_WIDTH;
  const activeFretRange = pressedPosition && { start: selectedFret, end: selectedFret + selectedFretCount };
  const naturalSelectedX = NECK_LEFT + (selectedFret ?? 0) * FRET_WIDTH;
  const selectedX = globalState.options.leftHand ? 864 - naturalSelectedX - selectedWidth : naturalSelectedX;

  const positionAtX = (x) => positionTargetForFret(
    fretForNeckX(x, neckDimensions.width, globalState.options.leftHand),
    globalState.key.key_offset,
  );

  const handlePressIn = (event) => {
    const nextTarget = positionAtX(event.nativeEvent.locationX);
    if (nextTarget.id === pressedTargetRef.current?.id && nextTarget.fret === pressedTargetRef.current?.fret) return;
    pressedTargetRef.current = nextTarget;
    setPressedPositionId(nextTarget.id);
    setPressedPositionFret(nextTarget.fret);
  };

  const finishSelection = () => {
    if (pressedTargetRef.current !== null) {
      setPositionId(pressedTargetRef.current.id);
      setPositionFret(pressedTargetRef.current.fret);
      setShowPositionOverview(false);
    }
    pressedTargetRef.current = null;
    setPressedPositionId(null);
    setPressedPositionFret(null);
  };

  const cancelSelection = () => {
    pressedTargetRef.current = null;
    setPressedPositionId(null);
    setPressedPositionFret(null);
  };

  return (
    // TODO: make container responsive
    <View
      accessibilityHint="Opens the selected fretboard position"
      accessibilityLabel="Full fretboard overview"
      accessibilityRole="button"
      onMoveShouldSetResponder={() => true}
      onResponderGrant={handlePressIn}
      onResponderMove={handlePressIn}
      onResponderRelease={finishSelection}
      onResponderTerminate={cancelSelection}
      onStartShouldSetResponder={() => true}
      style={[styles.container, neckDimensions]}
    >
      <Svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 864 233">
        {pressedPosition && (
          <Defs>
            <ClipPath id="phone-active-position-clip">
              <Rect
                x={selectedX - ACTIVE_CLIP_OVERDRAW}
                y="0"
                width={selectedWidth + ACTIVE_CLIP_OVERDRAW * 2}
                height="233"
              />
            </ClipPath>
          </Defs>
        )}
        {pressedPosition && (
          <>
            <Rect x={NECK_LEFT} y="14" width={NECK_RIGHT - NECK_LEFT} height={STRING_SPAN} fill={theme.colors.neckLightGray} />
            <Rect x={selectedX} y="14" width={selectedWidth} height={STRING_SPAN} fill={theme.colors.white} />
          </>
        )}
        {!globalState.options.hideColors && (
          <PositionBands activeFretRange={activeFretRange} bassMode={globalState.options.bassMode} keyOffset={globalState.key.key_offset} leftHand={globalState.options.leftHand} muted={Boolean(pressedPosition)} stringSpan={STRING_SPAN} upsideDown={globalState.options.upsideDown} />
        )}
        <Strings color={pressedPosition ? theme.colors.neckBlackAlpha : theme.colors.black} count={tuning.length} strokeWidth={LINE_WIDTH} />
        <Frets color={pressedPosition ? theme.colors.neckBlackAlpha : theme.colors.black} fretStrokeWidth={LINE_WIDTH} nutStrokeWidth={5} />
        {pressedPosition && (
          <G clipPath="url(#phone-active-position-clip)">
            <Strings count={tuning.length} strokeWidth={LINE_WIDTH} />
            <Frets fretStrokeWidth={LINE_WIDTH} nutStrokeWidth={5} />
          </G>
        )}
        {!globalState.options.hideAnchorFrets && (
          <>
            <AnchorFrets color={pressedPosition ? theme.colors.neckBlackAlpha : theme.colors.black} leftHand={globalState.options.leftHand} />
            {pressedPosition && (
              <G clipPath="url(#phone-active-position-clip)">
                <AnchorFrets leftHand={globalState.options.leftHand} />
              </G>
            )}
          </>
        )}
        {tuning.map((stringOffset, string) =>
          frets.map((fret) => (
            <Note
              key={`${string}-${fret}`}
              fret={fret}
              circleRadius={12}
              circleStrokeWidth={3}
              labelFontSize={23}
              leftHand={globalState.options.leftHand}
              muted={Boolean(pressedPosition) && !(fret > activeFretRange.start && fret <= activeFretRange.end)}
              string={string + 1}
              stringCount={tuning.length}
              stringOffset={stringOffset}
            />
          )),
        )}
      </Svg>
    </View>
  );
});

export default Neck;

const styles = StyleSheet.create({
  container: {
    maxHeight: 303,
    maxWidth: 1123,
  },
});
