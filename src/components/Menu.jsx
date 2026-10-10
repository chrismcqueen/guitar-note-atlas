import React, { useContext, useRef, useEffect, useState } from "react";
import { StyleSheet, Text, View, Pressable, Animated, Easing, Platform } from "react-native";

import { data } from "../../data";
import { OverlayStore, Store } from "../../Store";
import { storeGlobalState } from "../utils/functions";
import { theme } from "../utils/theme";
import { phoneHeaderHeight, tabletHeaderHeight } from "./Header";
import { pressedOpacity } from "../utils/pressable";
import { PHONE_FOOTER_HEIGHT, TABLET_FOOTER_HEIGHT } from "../utils/practiceLayout.mjs";

const splitToColumns = (items) => {
  const midpoint = Math.ceil(items.length / 2);
  return [items.slice(0, midpoint), items.slice(midpoint)];
};

const headings = Object.keys(data.scales);
const scales = splitToColumns(data.scales.scales);
const arpeggios = splitToColumns(data.scales.arpeggios);
const intervals = splitToColumns(data.scales.intervals);
const majorModes = splitToColumns(data.scales.major);
const melodicMinorModes = splitToColumns(data.scales["Melodic Minor"]);
const harmonicMinorModes = splitToColumns(data.scales["Harmonic Minor"]);
const harmonicMajorModes = splitToColumns(data.scales["Harmonic Major"]);

const Menu = () => {
  const { dimensions, insets, footerBottomInset, globalState, setGlobalState } = useContext(Store);
  const { showMenu } = useContext(OverlayStore);
  const menuAnim = useRef(new Animated.Value(1)).current;
  const [mounted, setMounted] = useState(false);
  const isTablet = dimensions.width >= 1000 && dimensions.height >= 550;
  const menuTop = (isTablet ? tabletHeaderHeight : phoneHeaderHeight) + (isTablet ? 0 : insets.top);
  const footerHeight = (isTablet ? TABLET_FOOTER_HEIGHT : PHONE_FOOTER_HEIGHT) + footerBottomInset;
  const menuItemFontSize = isTablet ? dimensions.width / 40 : 19;
  const menuRowHeight = isTablet ? dimensions.width / 27 : 28;
  const sectionHeaderFontSize = isTablet ? dimensions.width / 36 : 21;
  const sectionHeaderHeight = isTablet ? dimensions.width / 20.84 : 36;

  useEffect(() => {
    const task = requestIdleCallback(() => setMounted(true));
    return () => cancelIdleCallback(task);
  }, []);

  useEffect(() => {
    menuAnim.stopAnimation();

    if (showMenu) {
      if (!mounted) {
        setMounted(true);
        return;
      }

      Animated.timing(menuAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }).start();
      return;
    }

    if (mounted) {
      Animated.timing(menuAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }).start();
    } else {
      menuAnim.setValue(1);
    }
  }, [mounted, showMenu]);

  const modesOf = <Text style={styles.lowercase}>modes of </Text>;

  const handlePress = (item) => {
    setGlobalState({ ...globalState, scale: item });
    storeGlobalState({ ...globalState, scale: item });
  };

  const isCurrentItem = (item) => globalState.scale.menu_title === item.menu_title;

  const menuItemStyle = (item) => [
    styles.menuItem,
    {
      fontSize: menuItemFontSize,
      lineHeight: menuItemFontSize * 1.08,
    },
    isCurrentItem(item) && styles.menuItemSelectedText,
  ];

  const menuItemPressableStyle = (item) => [
    styles.menuItemPressable,
    { height: menuRowHeight },
    isCurrentItem(item) && styles.menuItemSelected,
  ];
  const menuHeaderWrapperStyle = [styles.menuHeaderWrapper, { height: sectionHeaderHeight }];
  const menuHeaderStyle = [
    styles.menuHeader,
    {
      fontSize: sectionHeaderFontSize,
      lineHeight: sectionHeaderFontSize * 1.08,
      transform: [{ translateY: isTablet ? 14 : 8 }],
    },
  ];

  if (!mounted) return null;

  return (
    <Animated.ScrollView
      pointerEvents={showMenu ? "auto" : "none"}
      removeClippedSubviews={Platform.OS === "android"}
      renderToHardwareTextureAndroid={Platform.OS === "android"}
      style={[
        styles.menu,
        {
          bottom: footerHeight,
          opacity: menuAnim.interpolate({
            inputRange: [0, 0.9, 1],
            outputRange: [1, 1, 0],
          }),
          width: "100%",
          top: menuTop,
          transform: [{ translateY: menuAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -dimensions.height],
          }) }],
        },
      ]}
      contentContainerStyle={styles.menuContent}
      stickyHeaderIndices={[0, 2, 4, 6, 8, 10, 12]}
    >
      {/* SCALES */}
      <View style={menuHeaderWrapperStyle}>
        <Text style={menuHeaderStyle}>{headings[0]}</Text>
      </View>
      <View style={styles.menuColumnContainer}>
        <View style={styles.menuColumn}>
          {scales[0].map((scale, i) => (
            <Pressable android_disableSound key={i} onPress={() => handlePress(scale)} style={({ pressed }) => [menuItemPressableStyle(scale), pressedOpacity({ pressed })]}>
              <Text style={menuItemStyle(scale)}>{scale.menu_title}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.menuColumn}>
          {scales[1].map((scale, i) => (
            <Pressable android_disableSound key={i} onPress={() => handlePress(scale)} style={({ pressed }) => [menuItemPressableStyle(scale), pressedOpacity({ pressed })]}>
              <Text style={menuItemStyle(scale)}>{scale.menu_title}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      {/* ARPEGGIOS */}
      <View style={menuHeaderWrapperStyle}>
        <Text style={menuHeaderStyle}>{headings[1]}</Text>
      </View>
      <View style={styles.menuColumnContainer}>
        <View style={styles.menuColumn}>
          {arpeggios[0].map((arp, i) => (
            <Pressable android_disableSound key={i} onPress={() => handlePress(arp)} style={({ pressed }) => [menuItemPressableStyle(arp), pressedOpacity({ pressed })]}>
              <Text style={menuItemStyle(arp)}>{arp.menu_title}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.menuColumn}>
          {arpeggios[1].map((arp, i) => (
            <Pressable android_disableSound key={i} onPress={() => handlePress(arp)} style={({ pressed }) => [menuItemPressableStyle(arp), pressedOpacity({ pressed })]}>
              <Text style={menuItemStyle(arp)}>{arp.menu_title}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      {/* INTERVALS */}
      <View style={menuHeaderWrapperStyle}>
        <Text style={menuHeaderStyle}>{headings[2]}</Text>
      </View>
      <View style={styles.menuColumnContainer}>
        <View style={styles.menuColumn}>
          {intervals[0].map((int, i) => (
            <Pressable android_disableSound key={i} onPress={() => handlePress(int)} style={({ pressed }) => [menuItemPressableStyle(int), pressedOpacity({ pressed })]}>
              <Text style={menuItemStyle(int)}>{int.menu_title}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.menuColumn}>
          {intervals[1].map((int, i) => (
            <Pressable android_disableSound key={i} onPress={() => handlePress(int)} style={({ pressed }) => [menuItemPressableStyle(int), pressedOpacity({ pressed })]}>
              <Text style={menuItemStyle(int)}>{int.menu_title}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      {/* MODES OF MAJOR */}
      <View style={menuHeaderWrapperStyle}>
        <Text style={menuHeaderStyle}>
          {modesOf}
          {headings[3]}
        </Text>
      </View>
      <View style={styles.menuColumnContainer}>
        <View style={styles.menuColumn}>
          {majorModes[0].map((mode, i) => (
            <Pressable android_disableSound key={i} onPress={() => handlePress(mode)} style={({ pressed }) => [menuItemPressableStyle(mode), pressedOpacity({ pressed })]}>
              <Text style={menuItemStyle(mode)}>{mode.menu_title}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.menuColumn}>
          {majorModes[1].map((mode, i) => (
            <Pressable android_disableSound key={i} onPress={() => handlePress(mode)} style={({ pressed }) => [menuItemPressableStyle(mode), pressedOpacity({ pressed })]}>
              <Text style={menuItemStyle(mode)}>{mode.menu_title}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      {/* MODES OF MELODIC MINOR */}
      <View style={menuHeaderWrapperStyle}>
        <Text style={menuHeaderStyle}>
          {modesOf}
          {headings[4]}
        </Text>
      </View>
      <View style={styles.menuColumnContainer}>
        <View style={styles.menuColumn}>
          {melodicMinorModes[0].map((mode, i) => (
            <Pressable android_disableSound key={i} onPress={() => handlePress(mode)} style={({ pressed }) => [menuItemPressableStyle(mode), pressedOpacity({ pressed })]}>
              <Text style={menuItemStyle(mode)}>{mode.menu_title}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.menuColumn}>
          {melodicMinorModes[1].map((mode, i) => (
            <Pressable android_disableSound key={i} onPress={() => handlePress(mode)} style={({ pressed }) => [menuItemPressableStyle(mode), pressedOpacity({ pressed })]}>
              <Text style={menuItemStyle(mode)}>{mode.menu_title}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      {/* MODES OF HARMONIC MINOR */}
      <View style={menuHeaderWrapperStyle}>
        <Text style={menuHeaderStyle}>
          {modesOf}
          {headings[5]}
        </Text>
      </View>
      <View style={styles.menuColumnContainer}>
        <View style={styles.menuColumn}>
          {harmonicMinorModes[0].map((mode, i) => (
            <Pressable android_disableSound key={i} onPress={() => handlePress(mode)} style={({ pressed }) => [menuItemPressableStyle(mode), pressedOpacity({ pressed })]}>
              <Text style={menuItemStyle(mode)}>{mode.menu_title}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.menuColumn}>
          {harmonicMinorModes[1].map((mode, i) => (
            <Pressable android_disableSound key={i} onPress={() => handlePress(mode)} style={({ pressed }) => [menuItemPressableStyle(mode), pressedOpacity({ pressed })]}>
              <Text style={menuItemStyle(mode)}>{mode.menu_title}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      {/* MODES OF HARMONIC MAJOR */}
      <View style={menuHeaderWrapperStyle}>
        <Text style={menuHeaderStyle}>
          {modesOf}
          {headings[6]}
        </Text>
      </View>
      <View style={styles.menuColumnContainer}>
        <View style={styles.menuColumn}>
          {harmonicMajorModes[0].map((mode, i) => (
            <Pressable android_disableSound key={i} onPress={() => handlePress(mode)} style={({ pressed }) => [menuItemPressableStyle(mode), pressedOpacity({ pressed })]}>
              <Text style={menuItemStyle(mode)}>{mode.menu_title}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.menuColumn}>
          {harmonicMajorModes[1].map((mode, i) => (
            <Pressable android_disableSound key={i} onPress={() => handlePress(mode)} style={({ pressed }) => [menuItemPressableStyle(mode), pressedOpacity({ pressed })]}>
              <Text style={menuItemStyle(mode)}>{mode.menu_title}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Animated.ScrollView>
  );
};

export default Menu;

const styles = StyleSheet.create({
  menu: {
    backgroundColor: theme.colors.blue,
    position: "absolute",
    zIndex: 1000,
  },
  menuContent: {
    paddingBottom: 0,
  },
  menuHeader: {
    fontFamily: "proletarsk",
    includeFontPadding: false,
    letterSpacing: 0,
    textAlign: "center",
    textTransform: "uppercase",
  },
  menuHeaderWrapper: {
    alignItems: "center",
    backgroundColor: theme.colors.menuHeader,
    justifyContent: "center",
    width: "100%",
  },
  menuItem: {
    color: theme.colors.white,
    fontFamily: "proletarsk",
    includeFontPadding: false,
    letterSpacing: 1,
    textAlign: "center",
  },
  menuItemPressable: {
    justifyContent: "center",
    width: "100%",
  },
  menuItemSelected: {
    backgroundColor: theme.colors.menuSelection,
  },
  menuItemSelectedText: {
    color: theme.colors.menuSelectionText,
  },
  menuColumnContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: "5.4%",
  },
  menuColumn: {
    width: "41.67%",
  },
  lowercase: {
    textTransform: "lowercase",
  },
});
