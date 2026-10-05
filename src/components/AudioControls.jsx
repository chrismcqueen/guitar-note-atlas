import React, { useContext, useEffect, useRef, useState } from "react";
import { Image, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { OverlayStore, Store } from "../../Store";
import { monotonicNow } from "../utils/audioClock.mjs";
import { MAX_TEMPO, MIN_TEMPO, NOTE_RATES, tempoFromTapTimes } from "../utils/audioSequence.mjs";
import { theme } from "../utils/theme";
import { withPressedOpacity } from "../utils/pressable";
import { useRepeatPress } from "../utils/useRepeatPress";
import { getMenuVisualCenterX, phoneHeaderHeight, tabletHeaderHeight } from "./Header";
import { AudioPlaybackStore } from "./AudioPlaybackProvider";

const CONTROL_HIT_SLOP = 3;
const TRIGGER_HIT_SLOP = { bottom: 10, left: 8, right: 8, top: 0 };
const LOADING_LABEL_DELAY_MS = 180;
const TAP_TEMPO_RESET_MS = 2000;

export const AudioTrigger = () => {
  const { dimensions, insets } = useContext(Store);
  const { showMenu } = useContext(OverlayStore);
  const { drumsEnabled, isPlaying, openPopover } = useContext(AudioPlaybackStore);
  const isTablet = dimensions.width >= 1000 && dimensions.height >= 550;
  const phoneTopInset = Platform.OS === "android" ? 0 : insets.top;
  const top = (isTablet ? tabletHeaderHeight : phoneHeaderHeight + phoneTopInset) + 12;
  const left = getMenuVisualCenterX(insets, isTablet) - 22;

  if (showMenu) return null;

  const audioActive = isPlaying || drumsEnabled;

  return (
    <Pressable
      android_disableSound
      accessibilityLabel="Open audio player"
      accessibilityRole="button"
      accessibilityState={{ selected: audioActive }}
      hitSlop={TRIGGER_HIT_SLOP}
      onPress={openPopover}
      style={withPressedOpacity([styles.trigger, styles.triggerIdle, { left, top }])}
    >
      <MixerIcon filled={false} />
    </Pressable>
  );
};

const MixerIcon = ({ filled }) => (
  <View accessible={false} style={styles.mixerIcon}>
    <View style={[styles.mixerTrack, !filled && styles.mixerTrackIdle]}><View style={[styles.mixerKnob, !filled && styles.mixerKnobIdle, { left: 3 }]} /></View>
    <View style={[styles.mixerTrack, !filled && styles.mixerTrackIdle]}><View style={[styles.mixerKnob, !filled && styles.mixerKnobIdle, { right: 3 }]} /></View>
    <View style={[styles.mixerTrack, !filled && styles.mixerTrackIdle]}><View style={[styles.mixerKnob, !filled && styles.mixerKnobIdle, { left: 8 }]} /></View>
  </View>
);

export const AudioPopover = () => {
  const { dimensions, insets } = useContext(Store);
  const {
    drumsEnabled,
    error,
    isLoading,
    isPlaying,
    loopEnabled,
    noteRate,
    play,
    popoverOpen,
    sequenceEmpty,
    setDrumsEnabled,
    setLoopEnabled,
    setNoteRate,
    setPopoverOpen,
    setTempo,
    tempo,
  } = useContext(AudioPlaybackStore);
  const [tempoText, setTempoText] = useState(String(tempo));
  const [showLoadingLabel, setShowLoadingLabel] = useState(false);
  const tempoTapTimes = useRef([]);
  const isTablet = dimensions.width >= 1000 && dimensions.height >= 550;
  const slowerTempoPress = useRepeatPress(() => setTempo(tempo - 1), { accelerate: true });
  const fasterTempoPress = useRepeatPress(() => setTempo(tempo + 1), { accelerate: true });
  const noteRateIndex = Math.max(0, NOTE_RATES.findIndex(({ id }) => id === noteRate));
  const selectedNoteRate = NOTE_RATES[noteRateIndex];
  const dottedNoteRate = selectedNoteRate.label.endsWith(".");
  const noteRateMainLabel = dottedNoteRate ? selectedNoteRate.label.slice(0, -1) : selectedNoteRate.label;
  const canSelectLongerRate = noteRateIndex < NOTE_RATES.length - 1;
  const canSelectShorterRate = noteRateIndex > 0;
  const tapTempo = (event) => {
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
  useEffect(() => {
    if (!isLoading) {
      setShowLoadingLabel(false);
      return undefined;
    }
    const timeout = setTimeout(() => setShowLoadingLabel(true), LOADING_LABEL_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [isLoading]);
  if (!popoverOpen) return null;

  const cardWidth = isTablet ? 330 : 292;
  const phoneTopInset = Platform.OS === "android" ? 0 : insets.top;
  const cardTop = (isTablet ? tabletHeaderHeight : phoneHeaderHeight + phoneTopInset) + 10;
  // On tablets, align the close control with the trigger's visual center. The
  // extra card area to its left also keeps the trigger behind the opaque card,
  // including beneath the rounded top-left corner.
  const cardLeft = isTablet ? Math.max(insets.left + 20, 20) : Math.max(insets.left + 24, 72);
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
      <View style={[styles.card, { left: cardLeft, top: cardTop, width: cardWidth }]}>
        <View style={styles.titleRow}>
          <Pressable android_disableSound accessibilityLabel="Close audio controls" accessibilityRole="button" hitSlop={CONTROL_HIT_SLOP} onPress={() => setPopoverOpen(false)} style={withPressedOpacity(styles.closeButton)}>
            <Text style={styles.closeText}>×</Text>
          </Pressable>
          <Text style={styles.title}>Audio Player</Text>
          <View accessible={false} style={styles.closeButton} />
        </View>

        <Pressable
          android_disableSound
          accessibilityRole="button"
          accessibilityState={{ busy: isLoading, disabled: isLoading || sequenceEmpty }}
          disabled={isLoading || sequenceEmpty}
          hitSlop={CONTROL_HIT_SLOP}
          onPress={play}
          style={withPressedOpacity([
            styles.playButton,
            !isPlaying && styles.playButtonIdle,
            (showLoadingLabel || sequenceEmpty) && styles.disabled,
          ])}
        >
          <Text style={[styles.playText, !isPlaying && styles.playTextIdle]}>{showLoadingLabel ? "Loading sounds…" : isPlaying ? "Stop" : "Play"}</Text>
        </Pressable>

        <View style={styles.tempoRow}>
          <View style={styles.controlLead}>
            <Text style={styles.label}>Tempo</Text>
            <Pressable android_disableSound accessibilityLabel="Tap tempo" accessibilityRole="button" hitSlop={CONTROL_HIT_SLOP} onPressIn={tapTempo} style={withPressedOpacity(styles.tapTempoButton)}>
              <Text style={styles.tapTempoText}>Tap</Text>
            </Pressable>
          </View>
          <View style={styles.controlCluster}>
            <Pressable android_disableSound accessibilityLabel="Decrease tempo" accessibilityRole="button" hitSlop={CONTROL_HIT_SLOP} {...slowerTempoPress} style={withPressedOpacity(styles.stepButton)}>
              <Text style={styles.stepText}>−</Text>
            </Pressable>
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
            <Pressable android_disableSound accessibilityLabel="Increase tempo" accessibilityRole="button" hitSlop={CONTROL_HIT_SLOP} {...fasterTempoPress} style={withPressedOpacity(styles.stepButton)}>
              <Text style={styles.stepText}>+</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.noteRateRow}>
          <Text style={styles.label}>Subdivision</Text>
          <View style={styles.controlCluster}>
            <Pressable android_disableSound accessibilityLabel="Select longer subdivision" accessibilityRole="button" accessibilityState={{ disabled: !canSelectLongerRate }} disabled={!canSelectLongerRate} hitSlop={CONTROL_HIT_SLOP} onPress={() => setNoteRate(NOTE_RATES[noteRateIndex + 1].id)} style={withPressedOpacity([styles.stepButton, !canSelectLongerRate && styles.disabled])}>
              <Text style={styles.stepText}>‹</Text>
            </Pressable>
            <View accessible accessibilityLabel={`Subdivision ${selectedNoteRate.label}`} style={styles.rateValue}>
              <Text style={styles.rateMainLabel}>{noteRateMainLabel}</Text>
              {dottedNoteRate && <Text style={styles.rateDot}>.</Text>}
            </View>
            <Pressable android_disableSound accessibilityLabel="Select shorter subdivision" accessibilityRole="button" accessibilityState={{ disabled: !canSelectShorterRate }} disabled={!canSelectShorterRate} hitSlop={CONTROL_HIT_SLOP} onPress={() => setNoteRate(NOTE_RATES[noteRateIndex - 1].id)} style={withPressedOpacity([styles.stepButton, !canSelectShorterRate && styles.disabled])}>
              <Text style={styles.stepText}>›</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.toggleRow}>
          <Toggle accessibilityLabel="Loop" icon={require("../../assets/audio/icons/loop.png")} onPress={() => setLoopEnabled(!loopEnabled)} selected={loopEnabled} />
          <Toggle accessibilityLabel="Drums" icon={require("../../assets/audio/icons/drums.png")} onPress={() => setDrumsEnabled(!drumsEnabled)} selected={drumsEnabled} />
        </View>
        {sequenceEmpty && <Text style={styles.message}>Select at least one note to play.</Text>}
        {!!error && <Text style={styles.error}>{error}</Text>}
      </View>
    </View>
  );
};

const Toggle = ({ accessibilityLabel, icon, onPress, selected }) => (
  <Pressable android_disableSound accessibilityLabel={accessibilityLabel} accessibilityRole="button" accessibilityState={{ selected }} hitSlop={CONTROL_HIT_SLOP} onPress={onPress} style={withPressedOpacity([styles.toggle, selected && styles.toggleSelected])}>
    <Image source={icon} style={[styles.toggleIcon, selected && styles.toggleIconSelected]} />
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
  closeButton: { alignItems: "center", height: 38, justifyContent: "center", width: 38 },
  closeText: { color: theme.colors.blue, fontSize: 29, lineHeight: 30 },
  controlCluster: { alignItems: "center", flexDirection: "row", width: 150 },
  controlLead: { alignItems: "center", flex: 1, flexDirection: "row" },
  disabled: { opacity: 0.45 },
  dismissLayer: { backgroundColor: "rgba(0, 0, 0, 0.001)", left: 0, position: "absolute", top: 0, zIndex: 0 },
  error: { color: "#A12622", fontSize: 12, marginTop: 8, textAlign: "center" },
  label: { color: theme.colors.black, flex: 1, fontFamily: "proletarsk", fontSize: 17 },
  message: { color: theme.colors.grey, fontSize: 12, marginTop: 8, textAlign: "center" },
  mixerIcon: { gap: 5, width: 24 },
  mixerKnob: { backgroundColor: theme.colors.white, borderRadius: 3, height: 6, position: "absolute", top: -2, width: 6 },
  mixerKnobIdle: { backgroundColor: theme.colors.blue },
  mixerTrack: { backgroundColor: theme.colors.white, height: 2, position: "relative", width: 24 },
  mixerTrackIdle: { backgroundColor: theme.colors.blue },
  noteRateRow: { alignItems: "center", flexDirection: "row", marginTop: 10 },
  playButton: { alignItems: "center", backgroundColor: theme.colors.blue, borderRadius: 5, justifyContent: "center", minHeight: 44 },
  playButtonIdle: { backgroundColor: theme.colors.white, borderColor: theme.colors.blue, borderWidth: 1.5 },
  playText: { color: theme.colors.white, fontFamily: "proletarsk", fontSize: 17 },
  playTextIdle: { color: theme.colors.blue },
  popoverLayer: { ...StyleSheet.absoluteFillObject, backgroundColor: "transparent", zIndex: 4500 },
  rateDot: { color: theme.colors.black, fontFamily: "proletarsk", fontSize: 17, left: 53, position: "absolute" },
  rateMainLabel: { color: theme.colors.black, fontFamily: "proletarsk", fontSize: 17, textAlign: "center", width: 48 },
  rateValue: { alignItems: "center", justifyContent: "center", position: "relative", width: 74 },
  stepButton: { alignItems: "center", borderColor: theme.colors.blue, borderRadius: 4, borderWidth: 1.5, height: 38, justifyContent: "center", width: 38 },
  stepText: { color: theme.colors.blue, fontSize: 24, lineHeight: Platform.OS === "android" ? 28 : 25 },
  tapTempoButton: { alignItems: "center", borderColor: theme.colors.blue, borderRadius: 4, borderWidth: 1.5, height: 38, justifyContent: "center", marginRight: 6, width: 42 },
  tapTempoText: { color: theme.colors.blue, fontFamily: "proletarsk", fontSize: 13 },
  tempoInput: { color: theme.colors.black, fontFamily: "proletarsk", fontSize: 19, minHeight: 38, padding: 0, textAlign: "right", width: 30 },
  tempoRow: { alignItems: "center", flexDirection: "row", marginTop: 12 },
  tempoValue: { alignItems: "center", flexDirection: "row", justifyContent: "center", width: 74 },
  title: { color: theme.colors.black, flex: 1, fontFamily: "blackout", fontSize: 20, textAlign: "center" },
  titleRow: { alignItems: "center", flexDirection: "row", marginBottom: 10 },
  toggle: { alignItems: "center", borderColor: theme.colors.lightBlue, borderRadius: 5, borderWidth: 1.5, flex: 1, justifyContent: "center", minHeight: 38 },
  toggleIcon: { height: 27, resizeMode: "contain", tintColor: theme.colors.blue, width: 41 },
  toggleIconSelected: { tintColor: theme.colors.white },
  toggleRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  toggleSelected: { backgroundColor: theme.colors.blue, borderColor: theme.colors.blue },
  trigger: {
    alignItems: "center",
    backgroundColor: theme.colors.blue,
    borderRadius: 22,
    elevation: 7,
    height: 44,
    justifyContent: "center",
    position: "absolute",
    shadowColor: "#000",
    shadowOffset: { height: 3, width: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    width: 44,
    zIndex: 300,
  },
  triggerIdle: {
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.blue,
    borderWidth: 2,
  },
});
