import React, { useEffect, useRef, useContext } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { Home } from "./Home";
import { Footer } from "./Footer";
import Header from "./Header";
import Menu from "./Menu";
import Options from "./Options";
import { theme } from "../utils/theme";
import { Store } from "../../Store";

const Main = () => {
  const { dimensions, showOptions, setShowOptions } = useContext(Store);

  const overlay = () => showOptions && setShowOptions(false);

  const fullDimensions = { height: dimensions.height, width: dimensions.width };
  const fullScreen = { height: "100%", width: "100%" };

  return (
    <View style={[styles.container, fullDimensions]}>
      <Pressable style={fullScreen} onPress={overlay}>
        {showOptions && <View style={[styles.overlay, fullScreen]} />}
        <Home style={styles.home} />
        <Footer style={styles.footer} />
      </Pressable>
    </View>
  );
};

export default Main;

const styles = StyleSheet.create({
  // container: {
  //   // paddingTop: 38,
  // },
  overlay: {
    backgroundColor: "#000000aa",
    zIndex: 2000,
    position: "absolute",
  },
});
