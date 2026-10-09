import React, { useContext } from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";
import { Store } from "../../Store";
import { storeGlobalState } from "../utils/functions";

import { theme } from "../utils/theme";
import { data } from "../../data";
import { withPressedOpacity } from "../utils/pressable";
import { nextKeyOffset } from "../utils/keyNavigation.mjs";
import { useRepeatPress } from "../utils/useRepeatPress";
import VerticalStepButtons from "./VerticalStepButtons";
import { AUDIO_CONTROL_GROUP_WIDTH, AudioTrigger } from "./AudioControls";
import { getMenuVisualCenterX } from "./Header";

export const PHONE_KEY_ROW_HEIGHT = 88;
export const PHONE_KEY_ROW_OFFSET = 16;

const TabletKeyTitle = ({ title }) => (
  <Text adjustsFontSizeToFit minimumFontScale={0.7} numberOfLines={1} style={styles.compactTitle}>
    KEY: {String(title).split("").map((character, index) =>
      character === "#" || character === "b"
        ? <Text key={`${character}-${index}`} style={styles.compactAccidental}>{character}</Text>
        : character
    )}
  </Text>
);

const KeySelector = ({ compact = false }) => {
  const { dimensions, insets, globalState, setGlobalState } = useContext(Store);

  const handlePressArrow = (direction) => {
    const offset = nextKeyOffset(
      globalState?.key.key_offset ?? 0,
      direction,
      globalState?.options.keyNavigation,
    );
    const value = data.keys.find((key) => key.key_offset === offset);
    const nextState = { ...globalState, key: value };
    setGlobalState(nextState);
    storeGlobalState(nextState);
  };
  const previousKeyPress = useRepeatPress(() => handlePressArrow("left"));
  const nextKeyPress = useRepeatPress(() => handlePressArrow("right"));

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <VerticalStepButtons upLabel="Next key" downLabel="Previous key" upHandlers={nextKeyPress} downHandlers={previousKeyPress} />
        <TabletKeyTitle title={globalState?.key.title} />
      </View>
    );
  }

  // Leave room for the complete audio group centered beneath Menu, even
  // when Audio is off, and mirror that reserve so the title never shifts.
  const safeInset = Math.max(insets.left, insets.right);
  const safeWidth = dimensions.width - safeInset * 2;
  const sideReserve = getMenuVisualCenterX(insets, false) + AUDIO_CONTROL_GROUP_WIDTH / 2 - safeInset + 8;
  const titleWidth = Math.min(430, Math.max(0, safeWidth - 2 * (sideReserve + 44)));
  const arrowInset = (safeWidth - titleWidth) / 2 - 44;
  const titleScale = titleWidth / 430;

  return (
    <View style={styles.titleContainer}>
      {globalState.options?.audioPlayer && <AudioTrigger inline />}
      <Pressable android_disableSound accessibilityLabel="Previous key" {...previousKeyPress} style={withPressedOpacity([styles.arrowContainer, styles.phoneArrow, { left: arrowInset }])}>
        <View style={[styles.arrow, styles.arrowLeft]}></View>
      </Pressable>
      <Text adjustsFontSizeToFit minimumFontScale={0.75} numberOfLines={1} style={[styles.title, styles.phoneTitle, { width: titleWidth, marginLeft: -titleWidth / 2, fontSize: 31 * titleScale, letterSpacing: 7 * titleScale }]}>
        KEY CENTER - {globalState?.key.title}
      </Text>
      <Pressable android_disableSound accessibilityLabel="Next key" {...nextKeyPress} style={withPressedOpacity([styles.arrowContainer, styles.phoneArrow, { right: arrowInset }])}>
        <View style={[styles.arrow, styles.arrowRight]}></View>
      </Pressable>
    </View>
  );
};

export default KeySelector;

const arrowHeight = 24;
const arrowDepth = 29;

const styles = StyleSheet.create({
  arrow: {
    width: 0,
    height: 0,
    borderTopWidth: arrowHeight,
    borderTopColor: "transparent",
    borderBottomWidth: arrowHeight,
    borderBottomColor: "transparent",
  },
  arrowContainer: {
    paddingHorizontal: 7.5,
    paddingVertical: 20,
  },
  arrowRight: {
    borderLeftWidth: arrowDepth,
    borderLeftColor: theme.colors.blue,
  },
  arrowLeft: {
    borderRightWidth: arrowDepth,
    borderRightColor: theme.colors.blue,
  },
  title: {
    fontFamily: "proletarsk",
    fontSize: 31,
    letterSpacing: 7,
    textAlign: "center",
    paddingHorizontal: 12,
    width: 430,
  },
  phoneArrow: { position: "absolute" },
  phoneTitle: { left: "50%", position: "absolute" },
  titleContainer: {
    height: PHONE_KEY_ROW_HEIGHT,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    transform: [{ translateY: PHONE_KEY_ROW_OFFSET }],
  },
  compactContainer: {
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 10,
    width: 190,
  },
  compactTitle: {
    flex: 1,
    color: theme.colors.black,
    fontFamily: "basicManual",
    fontSize: 28,
    marginLeft: 12,
  },
  compactAccidental: {
    fontFamily: "opusChords",
  },
});
