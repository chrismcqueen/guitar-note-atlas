import React, { useContext } from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";
import { Store } from "../../Store";
import { storeGlobalState } from "../utils/functions";

import { theme } from "../utils/theme";
import { data } from "../../data";

const KeySelector = () => {
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

  return (
      <View style={styles.titleContainer}>
        <Pressable style={styles.arrowContainer} onPress={() => handlePressArrow("left")}>
          <View style={[styles.arrow, styles.arrowLeft]}></View>
        </Pressable>
        <Text style={styles.title}>KEY CENTER - {globalState?.key.title}</Text>
        <Pressable style={styles.arrowContainer} onPress={() => handlePressArrow("right")}>
          <View style={[styles.arrow, styles.arrowRight]}></View>
        </Pressable>
      </View>
  );
};

export default KeySelector;

const arrowSize = 22;

const styles = StyleSheet.create({
  arrow: {
    width: 0,
    height: 0,
    borderTopWidth: arrowSize,
    borderTopColor: "transparent",
    borderBottomWidth: arrowSize,
    borderBottomColor: "transparent",
  },
  arrowContainer: {
    padding: 20,
  },
  arrowRight: {
    borderLeftWidth: arrowSize,
    borderLeftColor: theme.colors.blue,
  },
  arrowLeft: {
    borderRightWidth: arrowSize,
    borderRightColor: theme.colors.blue,
  },
  title: {
    fontFamily: "proletarsk",
    letterSpacing: 6,
    fontSize: 26,
    textAlign: "center",
    paddingHorizontal: 15,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});
