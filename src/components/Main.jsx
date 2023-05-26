import React, { useContext, useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";

import KeySelector from "./KeySelector";
import Neck from "./Neck";
import { Footer } from "./Footer";
import { Store } from "../../Store";
import { theme } from "../utils/theme";
import { headerHeight } from "./Header";

export const Main = () => {
  const { dimensions, showOptions, setShowOptions } = useContext(Store);
  const overlay = () => showOptions && setShowOptions(false);
  const fullDimensions = { height: dimensions.height, width: dimensions.width };
  const fullScreen = { height: "100%", width: "100%" };

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    showOptions
      ? Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }).start()
      : Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }).start();
  }, [fadeAnim, showOptions]);

  return (
    <View style={[styles.container, fullDimensions]}>
      <Pressable style={fullScreen} onPress={overlay}>
        {showOptions && <Animated.View style={[styles.overlay, { opacity: fadeAnim }]} />}
        <View style={styles.container}>
          <KeySelector />
          <Neck />
        </View>
        <Footer style={styles.footer} />
      </Pressable>
    </View>
  );
};

export default Main;

export const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  overlay: {
    backgroundColor: theme.colors.overlay,
    zIndex: 2000,
    position: "absolute",
    width: "100%",
    height: "100%",
    marginTop: headerHeight + 20,
  },
});
