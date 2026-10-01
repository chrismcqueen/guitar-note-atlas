import React, { useContext } from "react";
import { Text, View, StyleSheet, Pressable } from "react-native";

import { Store } from "../../Store";
import { theme } from "../utils/theme";

const Header = () => {
  const { dimensions, globalState, insets, showMenu, setShowMenu, showOptions, setShowOptions } = useContext(Store);
  const isTablet = dimensions.width >= 1000 && dimensions.height >= 550;
  const fullScreen = { height: "100%", width: "100%" };

  return (
    <View style={[styles.container, { height: headerHeight + insets.top }]}>
      <View style={fullScreen}>
        <Pressable style={[styles.menuButton, { left: insets.left, top: insets.top }]} onPress={() => setShowMenu(!showMenu)}>
          <Text style={[styles.menu, isTablet && styles.tabletMenu, { left: isTablet ? 25 : 4 }]}>Menu</Text>
        </Pressable>
        {!showMenu && (
          <Text style={[styles.heading, isTablet && styles.tabletHeading, { top: insets.top - (isTablet ? 52 : 18) }]}>{globalState?.scale.title}</Text>
        )}
        <Pressable
          style={[styles.settingsButtonContainer, { right: (isTablet ? 25 : 4) + insets.right, top: insets.top + 2 }]}
          onPress={() => !showMenu && setShowOptions(!showOptions)}
        >
          <Text style={[styles.settingsButton, showMenu && styles.disableOptions]}>● ● ●</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default Header;

export const headerHeight = 44;

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.blue,
    height: headerHeight,
    overflow: "hidden",
    position: "absolute",
    top: 0,
    width: "100%",
  },
  disableOptions: {
    opacity: 0.5,
  },
  heading: {
    position: "absolute",
    fontFamily: "blackout",
    color: theme.colors.white,
    textAlign: "center",
    fontSize: 76,
    lineHeight: 82,
    left: 0,
    right: 0,
    top: -18,
  },
  tabletHeading: {
    fontSize: 118,
    lineHeight: 125,
  },
  menu: {
    fontFamily: "blackout",
    color: theme.colors.white,
    position: "absolute",
    top: 13,
    fontSize: 26,
  },
  menuButton: {
    position: "absolute",
    zIndex: 100,
    width: 100,
    height: 50,
  },
  tabletMenu: {
    fontSize: 24,
  },
  settingsButton: {
    color: theme.colors.white,
    fontSize: 8,
    paddingHorizontal: 40,
    paddingVertical: 30,
    marginHorizontal: -40,
    marginVertical: -30,
  },
  settingsButtonContainer: {
    position: "absolute",
    top: 2,
    padding: 15,
  },
});
