import React, { useContext, useEffect, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { Store } from "../../Store";
import { MAX_TEMPO, MIN_TEMPO } from "../utils/audioSequence.mjs";
import { theme } from "../utils/theme";
import { withPressedOpacity } from "../utils/pressable";
import { phoneHeaderHeight, tabletHeaderHeight } from "./Header";
import { AudioPlaybackStore } from "./AudioPlaybackProvider";

export const AudioTrigger = () => {
  const { dimensions, insets } = useContext(Store);
  const { isLoading, isPlaying, openPopover } = useContext(AudioPlaybackStore);
  const isTablet = dimensions.width >= 1000 && dimensions.height >= 550;
  const top = (isTablet ? tabletHeaderHeight : phoneHeaderHeight + (isTablet ? 0 : insets.top)) + 12;
  const left = isTablet ? Math.max(insets.left + 24, 34) : Math.max(insets.left + 24, 72);

  return (
    <Pressable
      android_disableSound
      accessibilityLabel="Open audio controls"
      accessibilityRole="button"
      onPress={openPopover}
      style={withPressedOpacity([styles.trigger, { left, top }, isPlaying && styles.triggerPlaying])}
    >
      <Text style={styles.triggerIcon}>{isLoading ? "…" : isPlaying ? "■" : "▶"}</Text>
    </Pressable>
  );
};

export const AudioPopover = () => {
  const { dimensions, insets } = useContext(Store);
  const {
    drumsEnabled,
    error,
    isLoading,
    isPlaying,
    loopEnabled,
    play,
    popoverOpen,
    sequenceEmpty,
    setDrumsEnabled,
    setLoopEnabled,
    setPopoverOpen,
    setTempo,
    tempo,
  } = useContext(AudioPlaybackStore);
  const [tempoText, setTempoText] = useState(String(tempo));
  const isTablet = dimensions.width >= 1000 && dimensions.height >= 550;

  useEffect(() => setTempoText(String(tempo)), [tempo]);
  if (!popoverOpen) return null;

  const cardWidth = isTablet ? 330 : 292;
  const cardTop = (isTablet ? tabletHeaderHeight : phoneHeaderHeight + insets.top) + 10;
  const cardLeft = isTablet ? Math.max(insets.left + 24, 34) : Math.max(insets.left + 24, 72);
  const commitTempo = () => {
    setTempo(tempoText);
    setTempoText(String(Math.max(MIN_TEMPO, Math.min(MAX_TEMPO, Math.round(Number(tempoText) || tempo)))));
  };

  return (
    <View accessibilityViewIsModal style={styles.popoverLayer}>
      <Pressable
        android_disableSound
        accessibilityLabel="Close audio controls"
        onPress={() => setPopoverOpen(false)}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={[styles.card, { left: cardLeft, top: cardTop, width: cardWidth }]}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Scale Player</Text>
          <Pressable android_disableSound onPress={() => setPopoverOpen(false)} style={withPressedOpacity(styles.closeButton)}>
            <Text style={styles.closeText}>×</Text>
          </Pressable>
        </View>

        <Pressable
          android_disableSound
          accessibilityRole="button"
          disabled={isLoading || sequenceEmpty}
          onPress={play}
          style={withPressedOpacity([styles.playButton, (isLoading || sequenceEmpty) && styles.disabled])}
        >
          <Text style={styles.playText}>{isLoading ? "Loading sounds…" : isPlaying ? "Stop" : "Play scale"}</Text>
        </Pressable>

        <View style={styles.tempoRow}>
          <Text style={styles.label}>Tempo</Text>
          <Pressable android_disableSound onPress={() => setTempo(tempo - 1)} style={withPressedOpacity(styles.stepButton)}>
            <Text style={styles.stepText}>−</Text>
          </Pressable>
          <TextInput
            accessibilityLabel="Tempo in beats per minute"
            keyboardType="number-pad"
            maxLength={3}
            onBlur={commitTempo}
            onChangeText={setTempoText}
            onSubmitEditing={commitTempo}
            selectTextOnFocus
            style={styles.tempoInput}
            value={tempoText}
          />
          <Text style={styles.bpm}>BPM</Text>
          <Pressable android_disableSound onPress={() => setTempo(tempo + 1)} style={withPressedOpacity(styles.stepButton)}>
            <Text style={styles.stepText}>+</Text>
          </Pressable>
        </View>

        <View style={styles.toggleRow}>
          <Toggle label="Loop" onPress={() => setLoopEnabled(!loopEnabled)} selected={loopEnabled} />
          <Toggle label="Drums" onPress={() => setDrumsEnabled(!drumsEnabled)} selected={drumsEnabled} />
        </View>
        {sequenceEmpty && <Text style={styles.message}>Select at least one note to play.</Text>}
        {!!error && <Text style={styles.error}>{error}</Text>}
      </View>
    </View>
  );
};

const Toggle = ({ label, onPress, selected }) => (
  <Pressable android_disableSound onPress={onPress} style={withPressedOpacity([styles.toggle, selected && styles.toggleSelected])}>
    <Text style={[styles.toggleText, selected && styles.toggleTextSelected]}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  bpm: { color: theme.colors.grey, fontFamily: "proletarsk", fontSize: 13, marginRight: 8 },
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
  },
  closeButton: { alignItems: "center", height: 32, justifyContent: "center", width: 32 },
  closeText: { color: theme.colors.blue, fontSize: 29, lineHeight: 30 },
  disabled: { opacity: 0.45 },
  error: { color: "#A12622", fontSize: 12, marginTop: 8, textAlign: "center" },
  label: { color: theme.colors.black, flex: 1, fontFamily: "proletarsk", fontSize: 17 },
  message: { color: theme.colors.grey, fontSize: 12, marginTop: 8, textAlign: "center" },
  playButton: { alignItems: "center", backgroundColor: theme.colors.blue, borderRadius: 5, justifyContent: "center", minHeight: 42 },
  playText: { color: theme.colors.white, fontFamily: "proletarsk", fontSize: 17 },
  popoverLayer: { ...StyleSheet.absoluteFillObject, backgroundColor: "#00000026", zIndex: 4500 },
  stepButton: { alignItems: "center", borderColor: theme.colors.blue, borderRadius: 4, borderWidth: 1.5, height: 34, justifyContent: "center", width: 34 },
  stepText: { color: theme.colors.blue, fontSize: 24, lineHeight: Platform.OS === "android" ? 28 : 25 },
  tempoInput: { color: theme.colors.black, fontFamily: "proletarsk", fontSize: 19, marginLeft: 8, minWidth: 40, padding: 0, textAlign: "center" },
  tempoRow: { alignItems: "center", flexDirection: "row", marginTop: 12 },
  title: { color: theme.colors.black, fontFamily: "blackout", fontSize: 20 },
  titleRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  toggle: { alignItems: "center", borderColor: theme.colors.lightBlue, borderRadius: 5, borderWidth: 1.5, flex: 1, justifyContent: "center", minHeight: 38 },
  toggleRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  toggleSelected: { backgroundColor: theme.colors.blue, borderColor: theme.colors.blue },
  toggleText: { color: theme.colors.blue, fontFamily: "proletarsk", fontSize: 15 },
  toggleTextSelected: { color: theme.colors.white },
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
  triggerIcon: { color: theme.colors.white, fontSize: 18, marginLeft: 2 },
  triggerPlaying: { backgroundColor: theme.colors.grey },
});
