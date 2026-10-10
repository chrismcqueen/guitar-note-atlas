import React, { useContext } from "react";
import { Platform, Text, View, StyleSheet, Pressable } from "react-native";

import { OverlayStore, Store } from "../../Store";
import { theme } from "../utils/theme";
import { withPressedOpacity } from "../utils/pressable";
import { getMenuLeftInset, getOptionsRightInset, getPhoneNavigationLayout, TABLET_HEADER_HEIGHT } from "../utils/practiceLayout.mjs";

const phoneMenuTextWidth = 52;
const tabletMenuTextWidth = 62;
export const getMenuVisualCenterX = (insets, isTablet) => {
  if (!isTablet) return getPhoneNavigationLayout(insets, Platform.OS).menuCenter;
  return getMenuLeftInset(insets, Platform.OS) + 24 + tabletMenuTextWidth / 2;
};

// Anchor the phone practice row to the blue header, independent of neck layout.
export const getPhonePracticeHeaderLayout = (insets) => {
  const headerBottom = phoneHeaderHeight + (Platform.OS === "android" ? 0 : insets.top);
  const top = headerBottom + 3;
  const height = 56;
  return { headerBottom, top, height, centerY: top + height / 2 };
};

const Header = () => {
  const { dimensions, globalState, insets } = useContext(Store);
  const { showMenu, setShowMenu, showOptions, setShowOptions } = useContext(OverlayStore);
  const isTablet = dimensions.width >= 1000 && dimensions.height >= 550;
  const phoneNavigation = getPhoneNavigationLayout(insets, Platform.OS);
  const activeHeaderHeight = isTablet ? tabletHeaderHeight : phoneHeaderHeight;
  const fullScreen = { height: "100%", width: "100%" };
  // Android's portrait-native shell reports the physical display-cutout inset
  // before this view is rotated. That inset belongs on the landscape side,
  // which is already handled by menuInset/optionsInset; applying it vertically
  // stretches the phone header after a standalone rebuild.
  const headerInset = isTablet || Platform.OS === "android" ? 0 : insets.top;
  const controlTop = headerInset;
  const menuInset = getMenuLeftInset(insets, Platform.OS);
  const optionsInset = getOptionsRightInset(insets, Platform.OS, isTablet ? 55 : 50);
  // The released iPad build was laid out inside an approximately 4:3 UIKit
  // canvas. Keep its navigation-item scale when immersive mode exposes a
  // wider modern iPad viewport.
  const tabletCanvasWidth = Math.min(dimensions.width, dimensions.height * (4 / 3));
  const tabletTitleSize = tabletCanvasWidth / 14.25;
  const tabletTitleTop = -((tabletTitleSize - activeHeaderHeight) / 2);
  const tabletMenuSize = 24;
  const menuTextWidth = isTablet ? tabletMenuTextWidth : phoneMenuTextWidth;
  const title = isTablet ? globalState?.scale.long_title : globalState?.scale.title;
  // Center the title on the screen, with matching space on both sides for
  // the wider navigation control and its hit slop, even with uneven insets.
  const titleSideInset = isTablet ? 0 : phoneNavigation.titleInset;

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
          style={withPressedOpacity([styles.headerControl, styles.menuButton, !isTablet && styles.phoneControl, { height: activeHeaderHeight, left: menuInset, top: controlTop }])}
          onPress={() => setShowMenu(!showMenu)}
        >
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.68}
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
        <View
          pointerEvents="none"
          style={[
            styles.headingClip,
            {
              height: activeHeaderHeight,
              left: titleSideInset,
              right: titleSideInset,
              top: controlTop,
            },
          ]}
        >
          <Text
            adjustsFontSizeToFit={!isTablet}
            minimumFontScale={0.68}
            numberOfLines={1}
            style={[
              styles.heading,
              isTablet && {
                fontSize: tabletTitleSize,
                lineHeight: tabletTitleSize * 1.06,
              },
              { top: isTablet ? tabletTitleTop : -13 },
            ]}
          >
            {title?.toUpperCase()}
          </Text>
        </View>
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
            !isTablet && styles.phoneControl,
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
export const tabletHeaderHeight = TABLET_HEADER_HEIGHT;

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
  headingClip: {
    overflow: "hidden",
    position: "absolute",
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
    // Menu's tablet label center is 24 + 62 / 2 = 55 points.
    // Mirror that center from the right edge rather than the hit area's center.
    width: 110,
  },
  phoneControl: {
    width: 100,
  },
});
