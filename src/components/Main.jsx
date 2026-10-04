import React, { useContext } from "react";
import { StyleSheet, View } from "react-native";

import KeySelector from "./KeySelector";
import Neck from "./Neck";
import PositionZoom from "./PositionZoom";
import TabletNeck from "./TabletNeck";
import { Footer } from "./Footer";
import { Store } from "../../Store";
import { theme } from "../utils/theme";

export const Main = () => {
  const { dimensions, insets, showPositionOverview } = useContext(Store);
  const fullScreen = { height: "100%", width: "100%" };
  const isTablet = dimensions.width >= 1000 && dimensions.height >= 550;
  const safeSideInset = Math.max(insets.left, insets.right);
  const contentInsets = isTablet
    ? { paddingLeft: insets.left, paddingRight: insets.right }
    : { paddingLeft: safeSideInset, paddingRight: safeSideInset };

  return (
    <View style={styles.container}>
      <View style={fullScreen}>
        <View style={[styles.content, isTablet && styles.tabletContent, contentInsets]}>
          {isTablet ? (
            <>
              <PositionZoom />
              <View style={styles.tabletNeckRow}>
                <View style={styles.tabletKeySelector}>
                  <KeySelector compact />
                </View>
                <TabletNeck />
              </View>
            </>
          ) : (
            <View style={styles.phoneContent}>
              {showPositionOverview ? (
                <>
                  <KeySelector />
                  <View style={styles.phoneNeck}><Neck /></View>
                </>
              ) : (
                <PositionZoom compact />
              )}
            </View>
          )}
        </View>
        <Footer />
      </View>
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
    transform: [{ translateY: -20 }],
    width: "100%",
  },
  tabletContent: {
    transform: [{ translateY: 36 }],
  },
  tabletKeySelector: {
    left: "3%",
    position: "absolute",
    top: -80,
  },
  phoneContent: {
    alignItems: "center",
    width: "100%",
  },
  phoneNeck: {
    transform: [{ translateY: 10 }],
  },
});
