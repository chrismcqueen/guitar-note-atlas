import React, { useContext, useEffect, useRef, useState } from "react";
import { Image, Platform, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import Svg, { Circle, Path, Rect, Text as SvgText } from "react-native-svg";

import { OverlayStore, PositionVisibilityStore, Store } from "../../Store";
import { monotonicNow } from "../utils/audioClock.mjs";
import { MAX_TEMPO, MIN_TEMPO, NOTE_RATES, tempoFromTapTimes } from "../utils/audioSequence.mjs";
import { theme } from "../utils/theme";
import { withPressedOpacity } from "../utils/pressable";
import { useRepeatPress } from "../utils/useRepeatPress";
import { getMenuVisualCenterX, phoneHeaderHeight, tabletHeaderHeight } from "./Header";
import { AudioPlaybackStore } from "./AudioPlaybackProvider";
import DegreeLabel from "./Neck/DegreeLabel";
import AudioSettingsScroll from "./AudioSettingsScroll";
import VerticalStepButtons from "./VerticalStepButtons";

const CONTROL_HIT_SLOP = 3;
const TAP_TEMPO_RESET_MS = 2000;
const AUDIO_BUTTON_SIZE = 44;

const audioControlPlacement = (dimensions, insets) => {
  const isTablet = dimensions.width >= 1000 && dimensions.height >= 550;
  const phoneTopInset = Platform.OS === "android" ? 0 : insets.top;
  const top = (isTablet ? tabletHeaderHeight : phoneHeaderHeight + phoneTopInset) + 12;
  const left = isTablet ? getMenuVisualCenterX(insets, true) - AUDIO_BUTTON_SIZE / 2 : Math.max(insets.left, insets.right) + 8;
  return { isTablet, left, top };
};

export const AudioTrigger = () => {
  const { dimensions, insets } = useContext(Store);
  const { showMenu } = useContext(OverlayStore);
  const { canPlay, countInBeat, isLoading, isPlaying, openPopover, play, popoverOpen, error } = useContext(AudioPlaybackStore);
  const { left, top } = audioControlPlacement(dimensions, insets);

  // The settings card replaces both controls until it is dismissed.
  if (showMenu || popoverOpen) return null;

  return (
    <View style={[styles.triggerGroup, { left, top }]}>
      <Pressable
        android_disableSound
        accessibilityLabel={isPlaying ? "Stop audio" : isLoading ? "Cancel audio loading" : "Play audio"}
        accessibilityRole="button"
        accessibilityValue={countInBeat > 0 ? { text: `Count in ${countInBeat} of 4` } : undefined}
        accessibilityState={{ busy: isLoading, disabled: !canPlay && !isPlaying }}
        disabled={!canPlay && !isPlaying}
        onPress={play}
        style={withPressedOpacity([styles.trigger, !isPlaying && styles.triggerIdle])}
      >
        <TransportIcon count={countInBeat} loading={isLoading} playing={isPlaying} color={isPlaying ? theme.colors.white : theme.colors.blue} />
      </Pressable>
      <Pressable android_disableSound accessibilityLabel="Expand audio settings" accessibilityRole="button" onPress={openPopover} style={withPressedOpacity([styles.trigger, styles.triggerIdle, styles.settingsTrigger])}>
        <MixerIcon filled={false} />
        {!!error && <View style={styles.errorDot} />}
      </Pressable>
    </View>
  );
};

// Center the actual ink bounds of Basic Manual's digits at (12, 12), using
// the bundled font's metrics at size 24. Keep their natural proportions.
const COUNT_CENTERS = {
  1: { x: 12.983, y: 19.783 },
  2: { x: 12.633, y: 19.783 },
  3: { x: 12.65, y: 19.783 },
  4: { x: 12.25, y: 19.667 },
};
const TransportIcon = ({ count, loading, playing, color }) => (
  <Svg accessible={false} pointerEvents="none" width={24} height={24} viewBox="0 0 24 24">
    {count > 0 ? <DegreeLabel label={count} fill={color} fontSize={24} {...COUNT_CENTERS[count]} />
      : loading ? [6, 12, 18].map(cx => <Circle key={cx} cx={cx} cy={12} r={1.5} fill={color} />)
        : playing ? <Rect x={5} y={5} width={14} height={14} fill={color} />
          : <Path d="M7 4 L22 12 L7 20 Z" fill={color} />}
  </Svg>
);

const MixerIcon = ({ filled }) => (
  <View accessible={false} style={styles.mixerIcon}>
    <View style={[styles.mixerTrack, !filled && styles.mixerTrackIdle]}><View style={[styles.mixerKnob, !filled && styles.mixerKnobIdle, { left: 3 }]} /></View>
    <View style={[styles.mixerTrack, !filled && styles.mixerTrackIdle]}><View style={[styles.mixerKnob, !filled && styles.mixerKnobIdle, { right: 3 }]} /></View>
    <View style={[styles.mixerTrack, !filled && styles.mixerTrackIdle]}><View style={[styles.mixerKnob, !filled && styles.mixerKnobIdle, { left: 8 }]} /></View>
  </View>
);

export const AudioPopover = () => {
  const { dimensions, insets } = useContext(Store);
  const { showPositionOverview } = useContext(PositionVisibilityStore);
  const window = useWindowDimensions();
  const {
    accompaniment,
    countIn,
    notesEnabled,
    startOnRoot,
    error,
    loopEnabled,
    noteRate,
    popoverOpen,
    setAccompaniment,
    setCountIn,
    setNotesEnabled,
    setStartOnRoot,
    setLoopEnabled,
    setNoteRate,
    setPopoverOpen,
    setTempo,
    tapClick,
    tempo,
  } = useContext(AudioPlaybackStore);
  const [tempoText, setTempoText] = useState(String(tempo));
  const [settingsContentHeight, setSettingsContentHeight] = useState(null);
  const tempoTapTimes = useRef([]);
  const { isTablet, left: triggerLeft, top: triggerTop } = audioControlPlacement(dimensions, insets);
  const showOverviewHint = !isTablet && showPositionOverview;
  const slowerTempoPress = useRepeatPress(() => {
    if (tempo <= MIN_TEMPO) return false;
    setTempo(tempo - 1);
  }, { disabled: !popoverOpen });
  const fasterTempoPress = useRepeatPress(() => {
    if (tempo >= MAX_TEMPO) return false;
    setTempo(tempo + 1);
  }, { disabled: !popoverOpen });
  const noteRateIndex = Math.max(0, NOTE_RATES.findIndex(({ id }) => id === noteRate));
  const selectedNoteRate = NOTE_RATES[noteRateIndex];
  const canSelectLongerRate = noteRateIndex < NOTE_RATES.length - 1;
  const canSelectShorterRate = noteRateIndex > 0;
  const longerSubdivisionPress = useRepeatPress(() => {
    if (!canSelectLongerRate) return false;
    setNoteRate(NOTE_RATES[noteRateIndex + 1].id);
  }, { disabled: !popoverOpen || !canSelectLongerRate });
  const shorterSubdivisionPress = useRepeatPress(() => {
    if (!canSelectShorterRate) return false;
    setNoteRate(NOTE_RATES[noteRateIndex - 1].id);
  }, { disabled: !popoverOpen || !canSelectShorterRate });
  const tapTempo = (event) => {
    tapClick();
    // Use the native touch-down timestamp so JS/rendering delays do not become
    // part of the measured interval. Fall back to the monotonic clock for
    // accessibility activations or platforms that omit the timestamp.
    const nativeTimestamp = event?.nativeEvent?.timestamp;
    const now = Number.isFinite(nativeTimestamp) ? nativeTimestamp : monotonicNow();
    const previousTap = tempoTapTimes.current[tempoTapTimes.current.length - 1];
    if (previousTap === undefined || now - previousTap > TAP_TEMPO_RESET_MS) {
      tempoTapTimes.current = [now];
      return;
    }
    tempoTapTimes.current = [...tempoTapTimes.current, now].slice(-6);
    const tappedTempo = tempoFromTapTimes(tempoTapTimes.current);
    if (tappedTempo !== null) setTempo(tappedTempo);
  };

  useEffect(() => setTempoText(String(tempo)), [tempo]);
  if (!popoverOpen) return null;

  const cardWidth = isTablet ? 330 : 292;
  // Anchor to the same button group on every platform, with enough overhang
  // to cover both buttons inside the card's rounded border.
  const cardTop = triggerTop - 12;
  const cardLeft = Math.max(0, triggerLeft - 14);
  const viewportHeight = Math.min(dimensions.height, Platform.OS === "web" ? window.height : Math.min(window.width, window.height));
  const cardMaxHeight = Math.max(0, viewportHeight - cardTop - 12);
  // Reserve padding/borders (32) and the fixed header plus gap (38). Native
  // ScrollView needs a bounded height; maxHeight/flex shrink alone can leave
  // its viewport as tall as the content inside the rotated Android shell.
  const scrollHeight = Math.min(settingsContentHeight ?? 300, Math.max(0, cardMaxHeight - 70));
  const commitTempo = () => {
    setTempo(tempoText);
    setTempoText(String(Math.max(MIN_TEMPO, Math.min(MAX_TEMPO, Math.round(Number(tempoText) || tempo)))));
  };

  return (
    <View
      accessibilityViewIsModal
      pointerEvents="auto"
      style={styles.popoverLayer}
    >
      <Pressable
        accessible={false}
        android_disableSound
        onPress={() => setPopoverOpen(false)}
        style={[styles.dismissLayer, { height: dimensions.height, width: dimensions.width }]}
      />
      <View style={[styles.card, { left: cardLeft, top: cardTop, width: cardWidth, maxHeight: cardMaxHeight }]}>
        <View style={styles.titleRow}>
          <Pressable android_disableSound accessibilityLabel="Close audio settings" accessibilityRole="button" hitSlop={CONTROL_HIT_SLOP} onPress={() => setPopoverOpen(false)} style={withPressedOpacity(styles.closeButton)}>
            <Text style={styles.closeText}>×</Text>
          </Pressable>
          <Text style={styles.title}>Audio Settings</Text>
          <View accessible={false} style={styles.closeButton} />
        </View>

        <AudioSettingsScroll
          height={scrollHeight}
          onContentSizeChange={(_, height) => setSettingsContentHeight(height)}
          contentContainerStyle={styles.settingsContent}
        >
        {showOverviewHint && (
          <Text style={styles.mobileHint}>
            Select a position to play notes.{"\n"}Full neck view plays accompaniment only.
          </Text>
        )}
        <View style={[styles.tempoRow, !showOverviewHint && styles.tempoWithoutHint]}>
          <View style={styles.controlLead}>
            <Text style={styles.label}>Tempo</Text>
            <Pressable android_disableSound accessibilityLabel="Tap tempo" accessibilityRole="button" hitSlop={CONTROL_HIT_SLOP} onPressIn={tapTempo} style={withPressedOpacity(styles.tapTempoButton)}>
              <Text style={styles.tapTempoText}>Tap</Text>
            </Pressable>
          </View>
          <View style={styles.controlCluster}>
            <VerticalStepButtons upLabel="Increase tempo" downLabel="Decrease tempo" upHandlers={fasterTempoPress} downHandlers={slowerTempoPress} upDisabled={tempo >= MAX_TEMPO} downDisabled={tempo <= MIN_TEMPO} />
            <View style={styles.tempoValue}>
              <TextInput
                accessibilityLabel="Tempo in beats per minute"
                keyboardType="number-pad"
                hitSlop={CONTROL_HIT_SLOP}
                maxLength={3}
                onBlur={commitTempo}
                onChangeText={setTempoText}
                onSubmitEditing={commitTempo}
                selectTextOnFocus
                style={styles.tempoInput}
                value={tempoText}
              />
              <Text style={styles.bpm}>BPM</Text>
            </View>
          </View>
        </View>

        <View style={styles.noteRateRow}>
          <Text style={styles.label}>Subdivision</Text>
          <View style={styles.controlCluster}>
            <VerticalStepButtons upLabel="Select shorter subdivision" downLabel="Select longer subdivision" upHandlers={shorterSubdivisionPress} downHandlers={longerSubdivisionPress} upDisabled={!canSelectShorterRate} downDisabled={!canSelectLongerRate} />
            <View accessible accessibilityLabel={`Subdivision: ${selectedNoteRate.name}`} style={styles.rateValue}>
              <Text accessible={false} style={styles.rateLabel}>{selectedNoteRate.label}</Text>
              <Svg accessible={false} pointerEvents="none" width={30} height={24} viewBox="0 0 30 24">
                {/* Fixed note origin/baseline: flags, dots and triplets never recenter the note. */}
                <SvgText fill={theme.colors.black} fontFamily="opus" fontSize={16} x={12} y={21}>{selectedNoteRate.notation[0]}</SvgText>
                {selectedNoteRate.notation.endsWith(".") && <SvgText fill={theme.colors.black} fontFamily="opus" fontSize={16} x={24} y={21}>.</SvgText>}
                {selectedNoteRate.triplet && <SvgText fill={theme.colors.black} fontFamily="opus" fontSize={8} textAnchor="middle" x={27} y={9}>3</SvgText>}
              </Svg>
            </View>
          </View>
        </View>

        <View style={styles.toggleRow}>
          <Toggle accessibilityLabel="Notes" label="Notes" onPress={() => setNotesEnabled(!notesEnabled)} selected={notesEnabled} />
          <Toggle accessibilityLabel="Loop" icon={require("../../assets/audio/icons/loop.png")} onPress={() => setLoopEnabled(!loopEnabled)} selected={loopEnabled} />
          <Toggle accessibilityLabel="Four-click count-in" label="Count in" onPress={() => setCountIn(!countIn)} selected={countIn} />
        </View>
        <View style={styles.toggleRow}>
          <Toggle accessibilityLabel="Start at lowest root" label="Root start" selected={startOnRoot} onPress={() => setStartOnRoot(true)} />
          <Toggle accessibilityLabel="Start at lowest note" label="Lowest note" selected={!startOnRoot} onPress={() => setStartOnRoot(false)} />
        </View>
        <Text style={styles.accompanimentLabel}>Accompaniment</Text>
        <View style={[styles.toggleRow, styles.accompanimentRow]}>
          {[['off', 'Off'], ['metronome', 'Click'], ['drums', 'Drums']].map(([mode, label]) => (
            <Toggle key={mode} accessibilityLabel={`Accompaniment ${label}`} label={label} selected={accompaniment === mode} onPress={() => setAccompaniment(mode)} />
          ))}
        </View>
        {!!error && <Text style={styles.error}>{error}</Text>}
        </AudioSettingsScroll>
      </View>
    </View>
  );
};

const Toggle = ({ accessibilityLabel, icon, label, onPress, selected }) => (
  <Pressable android_disableSound accessibilityLabel={accessibilityLabel} accessibilityRole="button" accessibilityState={{ selected }} hitSlop={CONTROL_HIT_SLOP} onPress={onPress} style={withPressedOpacity([styles.toggle, selected && styles.toggleSelected])}>
    {icon ? <Image source={icon} style={[styles.toggleIcon, selected && styles.toggleIconSelected]} /> : <Text style={[styles.toggleLabel, selected && { color: theme.colors.white }]}>{label}</Text>}
  </Pressable>
);

const styles = StyleSheet.create({
  bpm: { color: theme.colors.grey, fontFamily: "proletarsk", fontSize: 13, marginLeft: 2 },
  card: {
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.blue,
    borderRadius: 10,
    borderWidth: 2,
    elevation: 12,
    padding: 14,
    position: "absolute",
    shadowColor: "#000",
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    zIndex: 1,
  },
  closeButton: { alignItems: "center", height: 32, justifyContent: "center", width: 32 },
  closeText: { color: theme.colors.blue, fontSize: 29, lineHeight: 30 },
  controlCluster: { alignItems: "center", flexDirection: "row", gap: 12, justifyContent: "flex-end", width: 136 },
  controlLead: { alignItems: "center", flex: 1, flexDirection: "row" },
  dismissLayer: { backgroundColor: "rgba(0, 0, 0, 0.001)", left: 0, position: "absolute", top: 0, zIndex: 0 },
  error: { color: "#A12622", fontSize: 12, marginTop: 8, textAlign: "center" },
  label: { color: theme.colors.black, flex: 1, fontFamily: "proletarsk", fontSize: 17 },
  mobileHint: { color: theme.colors.grey, fontSize: 12, lineHeight: 16, textAlign: "center" },
  accompanimentLabel: { color: theme.colors.grey, fontSize: 12, marginTop: 12, textAlign: "center" },
  accompanimentRow: { marginTop: 6 },
  mixerIcon: { gap: 5, width: 24 },
  mixerKnob: { backgroundColor: theme.colors.white, borderRadius: 3, height: 6, position: "absolute", top: -2, width: 6 },
  mixerKnobIdle: { backgroundColor: theme.colors.blue },
  mixerTrack: { backgroundColor: theme.colors.white, height: 2, position: "relative", width: 24 },
  mixerTrackIdle: { backgroundColor: theme.colors.blue },
  noteRateRow: { alignItems: "center", flexDirection: "row", marginTop: 10 },
  popoverLayer: { ...StyleSheet.absoluteFillObject, backgroundColor: "transparent", zIndex: 4500 },
  rateValue: { alignItems: "center", height: 42, width: 74 },
  rateLabel: { color: theme.colors.black, fontFamily: "proletarsk", fontSize: 15, height: 18, lineHeight: 18, padding: 0, includeFontPadding: false, textAlign: "center", width: 74 },
  settingsContent: { paddingBottom: 8 },
  tapTempoButton: { alignItems: "center", borderColor: theme.colors.blue, borderRadius: 4, borderWidth: 1.5, height: 38, justifyContent: "center", marginRight: 6, width: 42 },
  tapTempoText: { color: theme.colors.blue, fontFamily: "proletarsk", fontSize: 13 },
  tempoInput: { color: theme.colors.black, fontFamily: "proletarsk", fontSize: 19, minHeight: 38, padding: 0, textAlign: "right", width: 30 },
  tempoWithoutHint: { marginTop: 0 },
  tempoRow: { alignItems: "center", flexDirection: "row", marginTop: 12 },
  tempoValue: { alignItems: "center", flexDirection: "row", justifyContent: "center", width: 74 },
  title: { color: theme.colors.black, flex: 1, fontFamily: "blackout", fontSize: 20, textAlign: "center" },
  titleRow: { alignItems: "center", backgroundColor: theme.colors.white, flexDirection: "row", flexShrink: 0, height: 32, marginBottom: 6, zIndex: 1 },
  toggle: { alignItems: "center", borderColor: theme.colors.lightBlue, borderRadius: 5, borderWidth: 1.5, flex: 1, justifyContent: "center", minHeight: 38 },
  toggleIcon: { height: 27, resizeMode: "contain", tintColor: theme.colors.blue, width: 41 },
  toggleIconSelected: { tintColor: theme.colors.white },
  toggleRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  toggleSelected: { backgroundColor: theme.colors.blue, borderColor: theme.colors.blue },
  triggerGroup: { position: "absolute", alignItems: "center", flexDirection: "row", gap: 6, zIndex: 300 },
  settingsTrigger: { height: 40, width: 38, borderRadius: 8 },
  errorDot: { position: "absolute", right: 0, top: 0, width: 8, height: 8, borderRadius: 4, backgroundColor: "#A12622" },
  toggleLabel: { fontSize: 14, color: theme.colors.blue, fontFamily: "proletarsk" },
  trigger: {
    alignItems: "center",
    backgroundColor: theme.colors.blue,
    borderColor: theme.colors.blue,
    borderWidth: 2,
    borderRadius: AUDIO_BUTTON_SIZE / 2,
    elevation: 7,
    height: AUDIO_BUTTON_SIZE,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { height: 3, width: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    width: AUDIO_BUTTON_SIZE,
    zIndex: 300,
  },
  triggerIdle: {
    backgroundColor: theme.colors.white,
  },
});
