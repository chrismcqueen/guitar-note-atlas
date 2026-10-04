import React, { useContext, useRef, useEffect } from "react";
import { StyleSheet, Text, View, Pressable, Animated, Easing } from "react-native";

import { data } from "../../data";
import { Store } from "../../Store";
import { storeGlobalState } from "../utils/functions";
import { theme } from "../utils/theme";
import { phoneHeaderHeight, tabletHeaderHeight } from "./Header";
import { pressedOpacity } from "../utils/pressable";

const Menu = () => {
  const { dimensions, insets, showMenu, globalState, setGlobalState } = useContext(Store);
  const menuAnim = useRef(new Animated.Value(1)).current;
  const isTablet = dimensions.width >= 1000 && dimensions.height >= 550;
  const menuTop = (isTablet ? tabletHeaderHeight : phoneHeaderHeight) + (isTablet ? 0 : insets.top);
  const footerHeight = isTablet ? 87 : 53;
  const menuItemFontSize = dimensions.width / (isTablet ? 40 : 32);
  const menuRowHeight = dimensions.width / (isTablet ? 27 : 22);
  const sectionHeaderFontSize = dimensions.width / 36;
  const sectionHeaderHeight = dimensions.width / 20.84;

  useEffect(() => {
    showMenu
      ? Animated.timing(menuAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }).start()
      : Animated.timing(menuAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }).start();
  }, [showMenu]);

  const splitToColumns = (arr) => {
    const col1 = [];
    const col2 = [];
    arr.forEach((item, i) => {
      i < arr.length / 2 ? col1.push(item) : col2.push(item);
    });
    return new Array(col1, col2);
  };

  const headings = Object.keys(data.scales);
  const scales = splitToColumns(data.scales.scales);
  const arpeggios = splitToColumns(data.scales.arpeggios);
  const intervals = splitToColumns(data.scales.intervals);
  const majorModes = splitToColumns(data.scales.major);
  const melodicMinorModes = splitToColumns(data.scales["Melodic Minor"]);
  const harmonicMinorModes = splitToColumns(data.scales["Harmonic Minor"]);
  const harmonicMajorModes = splitToColumns(data.scales["Harmonic Major"]);
  const modesOf = <Text style={styles.lowercase}>modes of </Text>;

  const handlePress = (item) => {
    setGlobalState({ ...globalState, scale: item });
    storeGlobalState({ ...globalState, scale: item });
  };

  const menuItemStyle = (item) => [
    styles.menuItem,
    {
      fontSize: menuItemFontSize,
      lineHeight: menuItemFontSize * 1.08,
    },
    globalState.scale.menu_title === item.menu_title && styles.menuItemSelected,
  ];

  const menuItemPressableStyle = [styles.menuItemPressable, { height: menuRowHeight }];
  const menuHeaderWrapperStyle = [styles.menuHeaderWrapper, { height: sectionHeaderHeight }];
  const menuHeaderStyle = [
    styles.menuHeader,
    {
      fontSize: sectionHeaderFontSize,
      lineHeight: sectionHeaderFontSize * 1.08,
    },
  ];

  return (
    <Animated.ScrollView
      style={[
        styles.menu,
        {
          bottom: footerHeight,
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
            <Pressable key={i} onPress={() => handlePress(scale)} style={({ pressed }) => [menuItemPressableStyle, pressedOpacity({ pressed })]}>
              <Text style={menuItemStyle(scale)}>{scale.menu_title}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.menuColumn}>
          {scales[1].map((scale, i) => (
            <Pressable key={i} onPress={() => handlePress(scale)} style={({ pressed }) => [menuItemPressableStyle, pressedOpacity({ pressed })]}>
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
            <Pressable key={i} onPress={() => handlePress(arp)} style={({ pressed }) => [menuItemPressableStyle, pressedOpacity({ pressed })]}>
              <Text style={menuItemStyle(arp)}>{arp.menu_title}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.menuColumn}>
          {arpeggios[1].map((arp, i) => (
            <Pressable key={i} onPress={() => handlePress(arp)} style={({ pressed }) => [menuItemPressableStyle, pressedOpacity({ pressed })]}>
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
            <Pressable key={i} onPress={() => handlePress(int)} style={({ pressed }) => [menuItemPressableStyle, pressedOpacity({ pressed })]}>
              <Text style={menuItemStyle(int)}>{int.menu_title}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.menuColumn}>
          {intervals[1].map((int, i) => (
            <Pressable key={i} onPress={() => handlePress(int)} style={({ pressed }) => [menuItemPressableStyle, pressedOpacity({ pressed })]}>
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
            <Pressable key={i} onPress={() => handlePress(mode)} style={({ pressed }) => [menuItemPressableStyle, pressedOpacity({ pressed })]}>
              <Text style={menuItemStyle(mode)}>{mode.menu_title}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.menuColumn}>
          {majorModes[1].map((mode, i) => (
            <Pressable key={i} onPress={() => handlePress(mode)} style={({ pressed }) => [menuItemPressableStyle, pressedOpacity({ pressed })]}>
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
            <Pressable key={i} onPress={() => handlePress(mode)} style={({ pressed }) => [menuItemPressableStyle, pressedOpacity({ pressed })]}>
              <Text style={menuItemStyle(mode)}>{mode.menu_title}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.menuColumn}>
          {melodicMinorModes[1].map((mode, i) => (
            <Pressable key={i} onPress={() => handlePress(mode)} style={({ pressed }) => [menuItemPressableStyle, pressedOpacity({ pressed })]}>
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
            <Pressable key={i} onPress={() => handlePress(mode)} style={({ pressed }) => [menuItemPressableStyle, pressedOpacity({ pressed })]}>
              <Text style={menuItemStyle(mode)}>{mode.menu_title}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.menuColumn}>
          {harmonicMinorModes[1].map((mode, i) => (
            <Pressable key={i} onPress={() => handlePress(mode)} style={({ pressed }) => [menuItemPressableStyle, pressedOpacity({ pressed })]}>
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
            <Pressable key={i} onPress={() => handlePress(mode)} style={({ pressed }) => [menuItemPressableStyle, pressedOpacity({ pressed })]}>
              <Text style={menuItemStyle(mode)}>{mode.menu_title}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.menuColumn}>
          {harmonicMajorModes[1].map((mode, i) => (
            <Pressable key={i} onPress={() => handlePress(mode)} style={({ pressed }) => [menuItemPressableStyle, pressedOpacity({ pressed })]}>
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
