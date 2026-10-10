import React, { useContext } from "react";
import { View } from "react-native";
import Svg, { ClipPath, Defs, G, Rect } from "react-native-svg";

import { PositionActionsStore, PositionStore, Store } from "../../Store";
import AnchorFrets from "./Neck/AnchorFrets";
import Frets from "./Neck/Frets";
import Note from "./Neck/Note";
import Strings from "./Neck/Strings";
import PositionBands from "./Neck/PositionBands";
import { getPosition, positionDisplayFret, resolvedPositionFret, stepPositionTarget } from "../utils/positions.mjs";
import { useNeckSelectionGesture } from "./Neck/useNeckSelectionGesture";
import { theme } from "../utils/theme";

const VIEWBOX_HEIGHT = 175;
const STRING_SPAN = 120;
const FRET_WIDTH = 49;
const NECK_LEFT = 40;
const NECK_RIGHT = 842;
const LINE_WIDTH = 2.25;
const ACTIVE_CLIP_OVERDRAW = LINE_WIDTH;

const TabletNeck = ({ maxHeight = Infinity }) => {
  const { dimensions, globalState, insets } = useContext(Store);
  const { positionFret, positionId } = useContext(PositionStore);
  const { setPositionSelection } = useContext(PositionActionsStore);
  const frets = [...Array(17).keys()];
  const standardTuning = globalState.options.bassMode ? globalState.strings.slice(-4) : globalState.strings;
  const tuning = globalState.options.upsideDown ? [...standardTuning].reverse() : standardTuning;
  // Leave room for the zoom view, header and footer in short tablet windows.
  // The overview keeps its aspect ratio instead of pushing the title upward.
  const availableWidth = dimensions.width - insets.left - insets.right - 8;
  const width = Math.min(availableWidth, maxHeight * 864 / VIEWBOX_HEIGHT);
  const height = (width * VIEWBOX_HEIGHT) / 864;
  const position = getPosition(positionId);
  const selectedOccurrenceFret = resolvedPositionFret(positionId, positionFret, globalState.key.key_offset);
  const selectedFret = positionDisplayFret(positionId, selectedOccurrenceFret, globalState.key.key_offset);
  const selectedFretCount = position.short ? 5 : 6;
  const selectedWidth = selectedFretCount * FRET_WIDTH;
  const activeFretRange = { start: selectedFret, end: selectedFret + selectedFretCount };
  const naturalSelectedX = NECK_LEFT + selectedFret * FRET_WIDTH;
  const selectedX = globalState.options.leftHand ? 864 - naturalSelectedX - selectedWidth : naturalSelectedX;
  // Refresh Android's cached clipping region when the position window moves.
  const activeClipId = `tablet-active-position-${selectedX}-${selectedWidth}`;

  const selectTarget = (nextTarget) => {
    if (nextTarget.id !== positionId || nextTarget.fret !== positionFret) {
      setPositionSelection({ id: nextTarget.id, fret: nextTarget.fret });
    }
  };

  const stepSelection = (amount) => {
    const nextTarget = stepPositionTarget(positionId, selectedOccurrenceFret, amount, globalState.key.key_offset);
    setPositionSelection({ id: nextTarget.id, fret: nextTarget.fret });
  };

  const selectionGesture = useNeckSelectionGesture({
    width, height,
    keyOffset: globalState.key.key_offset,
    leftHand: globalState.options.leftHand,
    onSelect: selectTarget,
  });

  return (
    <View
      accessibilityActions={[{ name: "decrement" }, { name: "increment" }]}
      accessibilityHint="Tap or drag across the fretboard to select a position"
      accessibilityLabel="Full fretboard position selector"
      accessibilityRole="adjustable"
      onAccessibilityAction={(event) => {
        if (event.nativeEvent.actionName === "increment") stepSelection(1);
        if (event.nativeEvent.actionName === "decrement") stepSelection(-1);
      }}
      {...selectionGesture}
      style={{ height, width }}
    >
      <Svg width="100%" height="100%" viewBox={`0 0 864 ${VIEWBOX_HEIGHT}`}>
        <Defs>
          <ClipPath key={activeClipId} id={activeClipId}>
            <Rect
              x={selectedX - ACTIVE_CLIP_OVERDRAW}
              y="0"
              width={selectedWidth + ACTIVE_CLIP_OVERDRAW * 2}
              height={VIEWBOX_HEIGHT}
            />
          </ClipPath>
        </Defs>
        <Rect x={NECK_LEFT} y="14" width={NECK_RIGHT - NECK_LEFT} height={STRING_SPAN} fill={theme.colors.neckLightGray} />
        <Rect x={selectedX} y="14" width={selectedWidth} height={STRING_SPAN} fill={theme.colors.white} />
        {!globalState.options.hideColors && (
          <PositionBands
            activeFretRange={activeFretRange}
            bassMode={globalState.options.bassMode}
            keyOffset={globalState.key.key_offset}
            leftHand={globalState.options.leftHand}
            muted
            upsideDown={globalState.options.upsideDown}
          />
        )}
        <G>
          <Strings color={theme.colors.neckBlackAlpha} count={tuning.length} span={STRING_SPAN} startX={41} strokeWidth={LINE_WIDTH} />
          <Frets
            color={theme.colors.neckBlackAlpha}
            fretStrokeWidth={LINE_WIDTH}
            nutStrokeWidth={3.5}
            y1={14}
            y2={14 + STRING_SPAN}
          />
          <G clipPath={`url(#${activeClipId})`}>
            <Strings color={theme.colors.black} count={tuning.length} span={STRING_SPAN} startX={41} strokeWidth={LINE_WIDTH} />
            <Frets
              color={theme.colors.black}
              fretStrokeWidth={LINE_WIDTH}
              nutStrokeWidth={3.5}
              y1={14}
              y2={14 + STRING_SPAN}
            />
          </G>
          {!globalState.options.hideAnchorFrets && (
            <>
              <G transform="translate(0 -75)">
                <AnchorFrets color={theme.colors.neckBlackAlpha} leftHand={globalState.options.leftHand} radius={2} />
              </G>
              <G clipPath={`url(#${activeClipId})`}>
                <G transform="translate(0 -75)">
                  <AnchorFrets color={theme.colors.black} leftHand={globalState.options.leftHand} radius={2} />
                </G>
              </G>
            </>
          )}
          {tuning.map((stringOffset, string) =>
            frets.map((fret) => (
              <Note
                centerInFrets
                circleRadius={8}
                circleStrokeWidth={2}
                key={`${string}-${fret}`}
                fret={fret}
                labelFontSize={16}
                leftHand={globalState.options.leftHand}
                muted={!(fret > activeFretRange.start && fret <= activeFretRange.end)}
                noteSizeOverride={20}
                openStringOffset={15}
                string={string + 1}
                stringCount={tuning.length}
                stringOffset={stringOffset}
                stringOffsetY={4}
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
