import React, { useContext } from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";
import { Store } from "../../Store";
import { storeGlobalState } from "../utils/functions";

import { theme } from "../utils/theme";
import { data } from "../../data";
import { withPressedOpacity } from "../utils/pressable";
import { nextKeyOffset } from "../utils/keyNavigation.mjs";
import { useRepeatPress } from "../utils/useRepeatPress";

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
  const { globalState, setGlobalState } = useContext(Store);

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
        <View>
          <Pressable android_disableSound accessibilityLabel="Next key" {...nextKeyPress} style={withPressedOpacity(styles.compactArrowButton)}>
            <View style={[styles.compactArrow, styles.arrowUp]} />
          </Pressable>
          <Pressable android_disableSound accessibilityLabel="Previous key" {...previousKeyPress} style={withPressedOpacity(styles.compactArrowButton)}>
            <View style={[styles.compactArrow, styles.arrowDown]} />
          </Pressable>
        </View>
        <TabletKeyTitle title={globalState?.key.title} />
      </View>
    );
  }

  return (
    <View style={styles.titleContainer}>
      <Pressable android_disableSound accessibilityLabel="Previous key" {...previousKeyPress} style={withPressedOpacity(styles.arrowContainer)}>
        <View style={[styles.arrow, styles.arrowLeft]}></View>
      </Pressable>
      <Text adjustsFontSizeToFit minimumFontScale={0.75} numberOfLines={1} style={styles.title}>
        KEY CENTER - {globalState?.key.title}
      </Text>
      <Pressable android_disableSound accessibilityLabel="Next key" {...nextKeyPress} style={withPressedOpacity(styles.arrowContainer)}>
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
    padding: 20,
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
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    transform: [{ translateY: 16 }],
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
  compactArrowButton: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  compactArrow: {
    borderLeftColor: "transparent",
    borderLeftWidth: 14,
    borderRightColor: "transparent",
    borderRightWidth: 14,
    height: 0,
    width: 0,
  },
  arrowUp: {
    borderBottomColor: theme.colors.black,
    borderBottomWidth: 24,
  },
  arrowDown: {
    borderTopColor: theme.colors.black,
    borderTopWidth: 24,
  },
});
