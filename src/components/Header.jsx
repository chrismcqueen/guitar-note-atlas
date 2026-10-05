import React, { useContext } from "react";
import { Platform, Text, View, StyleSheet, Pressable } from "react-native";

import { OverlayStore, Store } from "../../Store";
import { theme } from "../utils/theme";
import { withPressedOpacity } from "../utils/pressable";

const phoneMenuTextWidth = 52;
const tabletMenuTextWidth = 62;
export const getMenuVisualCenterX = (insets, isTablet) => {
  const menuInset = isTablet ? insets.left : Math.max(insets.left, 59);
  const textWidth = isTablet ? tabletMenuTextWidth : phoneMenuTextWidth;
  return menuInset + 24 + textWidth / 2;
};

const Header = () => {
  const { dimensions, globalState, insets } = useContext(Store);
  const { showMenu, setShowMenu, showOptions, setShowOptions } = useContext(OverlayStore);
  const isTablet = dimensions.width >= 1000 && dimensions.height >= 550;
  const activeHeaderHeight = isTablet ? tabletHeaderHeight : phoneHeaderHeight;
  const fullScreen = { height: "100%", width: "100%" };
  // Android's portrait-native shell reports the physical display-cutout inset
  // before this view is rotated. That inset belongs on the landscape side,
  // which is already handled by menuInset/optionsInset; applying it vertically
  // stretches the phone header after a standalone rebuild.
  const headerInset = isTablet || Platform.OS === "android" ? 0 : insets.top;
  const controlTop = headerInset;
  const menuInset = isTablet ? insets.left : Math.max(insets.left, 59);
  const optionsInset = isTablet
    ? insets.right
    : Math.max(84, Platform.OS === "android" ? Math.max(insets.right, 24) : insets.right);
  // The released iPad build was laid out inside an approximately 4:3 UIKit
  // canvas. Keep its navigation-item scale when immersive mode exposes a
  // wider modern iPad viewport.
  const tabletCanvasWidth = Math.min(dimensions.width, dimensions.height * (4 / 3));
  const tabletTitleSize = tabletCanvasWidth / 14.25;
  const tabletTitleTop = -((tabletTitleSize - activeHeaderHeight) / 2);
  const tabletMenuSize = 24;
  const menuTextWidth = isTablet ? tabletMenuTextWidth : phoneMenuTextWidth;
  const title = isTablet ? globalState?.scale.long_title : globalState?.scale.title;

  return (
    <View style={[styles.container, { height: activeHeaderHeight + headerInset }]}>
      <View
        style={[
          styles.headerBand,
          isTablet
            ? { height: activeHeaderHeight, top: 0 }
            : fullScreen,
        ]}
      >
        <Pressable
          android_disableSound
          accessibilityLabel="Menu"
          accessibilityRole="button"
          hitSlop={12}
          style={withPressedOpacity([styles.headerControl, styles.menuButton, { height: activeHeaderHeight, left: menuInset, top: controlTop }])}
          onPress={() => setShowMenu(!showMenu)}
        >
          <Text
            style={[
              styles.menu,
              { width: menuTextWidth },
              isTablet && {
                fontSize: tabletMenuSize,
              },
            ]}
          >
            Menu
          </Text>
        </Pressable>
        <Text
          style={[
            styles.heading,
            isTablet && {
              fontSize: tabletTitleSize,
              lineHeight: tabletTitleSize * 1.06,
            },
            { top: isTablet ? tabletTitleTop : headerInset - 13 },
          ]}
        >
          {title?.toUpperCase()}
        </Text>
        <Pressable
          android_disableSound
          accessibilityLabel="Options"
          accessibilityRole="button"
          accessibilityState={{ disabled: showMenu }}
          disabled={showMenu}
          hitSlop={12}
          style={withPressedOpacity([
            styles.headerControl,
            styles.settingsButtonContainer,
            Platform.OS === "android" && styles.androidSettingsButtonContainer,
            { height: activeHeaderHeight, right: optionsInset, top: controlTop },
          ])}
          onPress={() => setShowOptions(!showOptions)}
        >
          <Text style={[styles.settingsButton, showMenu && styles.disableOptions]}>● ● ●</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default Header;

export const phoneHeaderHeight = 38;
export const tabletHeaderHeight = 51;

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.blue,
    height: tabletHeaderHeight,
    overflow: "hidden",
    position: "absolute",
    top: 0,
    width: "100%",
  },
  headerBand: {
    backgroundColor: theme.colors.blue,
    left: 0,
    overflow: "hidden",
    position: "absolute",
    right: 0,
  },
  disableOptions: {
    opacity: 0.5,
  },
  heading: {
    position: "absolute",
    fontFamily: "blackout",
    color: theme.colors.white,
    textAlign: "center",
    fontSize: 58,
    lineHeight: 64,
    left: 0,
    right: 0,
    top: -18,
  },
  menu: {
    fontFamily: "blackout",
    color: theme.colors.white,
    fontSize: 20,
    includeFontPadding: false,
    textAlign: "center",
  },
  headerControl: {
    justifyContent: "center",
    position: "absolute",
    zIndex: 100,
  },
  menuButton: {
    alignItems: "flex-start",
    paddingLeft: 24,
    width: 120,
  },
  settingsButton: {
    color: theme.colors.white,
    fontSize: 7,
    includeFontPadding: false,
  },
  settingsButtonContainer: {
    alignItems: "center",
    width: 75,
  },
  androidSettingsButtonContainer: {
    width: 120,
  },
});
