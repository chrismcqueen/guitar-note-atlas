import React, { useContext, useEffect } from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";
import Svg, { Path, Circle, Rect } from "react-native-svg";
import { Store } from "../../Store";
import { storeGlobalState, removeStorage } from "../utils/functions";

import { theme } from "../utils/theme";
import { data } from "../../data/GNA";

import Neck from "./Neck";

export const Home = () => {
  const { globalState, setGlobalState } = useContext(Store);
  // useEffect(() => {
  //   removeStorage();
  // }, []);
  // useEffect(() => console.log(`global key: ${globalState?.key}`), []);

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
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Pressable style={styles.arrowContainer} onPress={() => handlePressArrow("left")}>
          <View style={[styles.arrow, styles.arrowLeft]}></View>
        </Pressable>
        <Text style={styles.title}>KEY CENTER - {globalState?.key.title}</Text>
        <Pressable style={styles.arrowContainer} onPress={() => handlePressArrow("right")}>
          <View style={[styles.arrow, styles.arrowRight]}></View>
        </Pressable>
      </View>
      <Neck />
    </View>
  );
};

const arrowSize = 22;

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontFamily: "proletarsk",
    letterSpacing: 6,
    fontSize: 26,
    textAlign: "center",
    paddingHorizontal: 15,
  },
  arrowContainer: {
    padding: 20,
  },
  arrow: {
    width: 0,
    height: 0,
    borderTopWidth: arrowSize,
    borderTopColor: "transparent",
    borderBottomWidth: arrowSize,
    borderBottomColor: "transparent",
  },
  arrowRight: {
    borderLeftWidth: arrowSize,
    borderLeftColor: theme.colors.blue,
  },
  arrowLeft: {
    borderRightWidth: arrowSize,
    borderRightColor: theme.colors.blue,
  },
});
