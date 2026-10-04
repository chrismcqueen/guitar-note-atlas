import React, { useContext } from "react";
import { Platform, Text, View, StyleSheet, Pressable } from "react-native";

import { OverlayStore, Store } from "../../Store";
import { theme } from "../utils/theme";
import { withPressedOpacity } from "../utils/pressable";

const Header = () => {
  const { dimensions, globalState, insets } = useContext(Store);
  const { showMenu, setShowMenu, showOptions, setShowOptions } = useContext(OverlayStore);
  const isTablet = dimensions.width >= 1000 && dimensions.height >= 550;
  const activeHeaderHeight = isTablet ? tabletHeaderHeight : phoneHeaderHeight;
  const fullScreen = { height: "100%", width: "100%" };
  const headerInset = isTablet ? 0 : insets.top;
  const controlTop = headerInset;
  const optionsInset = Platform.OS === "android" ? Math.max(insets.right, 24) : insets.right;
  // The released iPad build was laid out inside an approximately 4:3 UIKit
  // canvas. Keep its navigation-item scale when immersive mode exposes a
  // wider modern iPad viewport.
  const tabletCanvasWidth = Math.min(dimensions.width, dimensions.height * (4 / 3));
  const tabletTitleSize = tabletCanvasWidth / 14.25;
  const tabletTitleTop = -((tabletTitleSize - activeHeaderHeight) / 2);
  const tabletMenuSize = 24;
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
          hitSlop={12}
          style={withPressedOpacity([styles.headerControl, styles.menuButton, { height: activeHeaderHeight, left: insets.left, top: controlTop }])}
          onPress={() => setShowMenu(!showMenu)}
        >
          <Text
            style={[
              styles.menu,
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
            { top: isTablet ? tabletTitleTop : insets.top - 13 },
          ]}
        >
          {title?.toUpperCase()}
        </Text>
        <Pressable
          android_disableSound
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
