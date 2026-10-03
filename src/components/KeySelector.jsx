import React, { useContext } from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";
import { Store } from "../../Store";
import { storeGlobalState } from "../utils/functions";

import { theme } from "../utils/theme";
import { data } from "../../data";

const KeySelector = ({ compact = false }) => {
  const { globalState, setGlobalState } = useContext(Store);

  const handlePressArrow = (direction) => {
    data.keys.forEach((key, i) => {
      if (key.title === globalState?.key.title) {
        const value = data.keys[i === 11 && direction === "right" ? 0 : i === 0 && direction === "left" ? 11 : direction === "right" ? i + 1 : i - 1];
        setGlobalState({ ...globalState, key: value });
        storeGlobalState({ ...globalState, key: value });
      }
    });
  };

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View>
          <Pressable accessibilityLabel="Next key" onPress={() => handlePressArrow("right")} style={styles.compactArrowButton}>
            <View style={[styles.compactArrow, styles.arrowUp]} />
          </Pressable>
          <Pressable accessibilityLabel="Previous key" onPress={() => handlePressArrow("left")} style={styles.compactArrowButton}>
            <View style={[styles.compactArrow, styles.arrowDown]} />
          </Pressable>
        </View>
        <Text adjustsFontSizeToFit minimumFontScale={0.7} numberOfLines={1} style={styles.compactTitle}>
          KEY: {globalState?.key.title}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.titleContainer}>
      <Pressable style={styles.arrowContainer} onPress={() => handlePressArrow("left")}>
        <View style={[styles.arrow, styles.arrowLeft]}></View>
      </Pressable>
      <Text adjustsFontSizeToFit minimumFontScale={0.75} numberOfLines={1} style={styles.title}>
        KEY CENTER - {globalState?.key.title}
      </Text>
      <Pressable style={styles.arrowContainer} onPress={() => handlePressArrow("right")}>
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
    textShadowColor: theme.colors.black,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 0.65,
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
    fontSize: 24,
    fontWeight: "700",
    marginLeft: 12,
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
    borderBottomColor: theme.colors.grey,
    borderBottomWidth: 24,
  },
  arrowDown: {
    borderTopColor: theme.colors.grey,
    borderTopWidth: 24,
  },
});
