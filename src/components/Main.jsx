import React, { useContext, useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";

import KeySelector from "./KeySelector";
import Neck from "./Neck";
import PositionZoom from "./PositionZoom";
import { Footer } from "./Footer";
import { Store } from "../../Store";
import { theme } from "../utils/theme";
import { headerHeight } from "./Header";

export const Main = () => {
  const { dimensions, insets, showOptions, setShowOptions } = useContext(Store);
  const overlay = () => showOptions && setShowOptions(false);
  const fullDimensions = { height: dimensions.height, width: dimensions.width };
  const fullScreen = { height: "100%", width: "100%" };
  const isTablet = dimensions.width >= 1000 && dimensions.height >= 550;

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
        <View style={[styles.content, { paddingLeft: insets.left, paddingRight: insets.right }]}>
          {isTablet ? (
            <>
              <PositionZoom />
              <View style={styles.tabletNeckRow}>
                <View style={styles.tabletKeySelector}>
                  <KeySelector compact />
                </View>
                <Neck />
              </View>
            </>
          ) : (
            <View style={styles.phoneContent}>
              <KeySelector />
              <Neck />
            </View>
          )}
        </View>
        <Footer />
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
  content: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  tabletNeckRow: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    width: "100%",
  },
  tabletKeySelector: {
    left: "4%",
    position: "absolute",
    top: -22,
  },
  overlay: {
    backgroundColor: theme.colors.overlay,
    zIndex: 2000,
    position: "absolute",
    width: "100%",
    height: "100%",
    marginTop: headerHeight + 20,
  },
  phoneContent: {
    alignItems: "center",
    transform: [{ translateY: 11 }],
  },
});
