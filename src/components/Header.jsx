import React, { useContext } from "react";
import { Text, View, StyleSheet, Pressable } from "react-native";

import { Store } from "../../Store";
import { theme } from "../utils/theme";

const Header = () => {
  const { globalState, showMenu, setShowMenu, showOptions, setShowOptions, dimensions } = useContext(Store);

  return (
    <View style={styles.container}>
      <Pressable style={styles.menuButton} onPress={() => setShowMenu(!showMenu)}>
        <Text style={styles.menu}>Menu</Text>
      </Pressable>
      <Text style={styles.heading}>{globalState?.scale.title}</Text>
      <Pressable style={styles.settingsButtonContainer} onPress={() => !showMenu && setShowOptions(!showOptions)}>
        <Text style={[styles.settingsButton, showMenu && styles.disableOptions]}>● ● ●</Text>
      </Pressable>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.blue,
    height: 38,
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
    fontSize: 60,
    // overflow: "hidden",
    // height: 43,
    left: 0,
    right: 0,
    top: -4,
    // zIndex: 3000,
    // lineHeight: 65,
    // top: -55,
  },
  menu: {
    fontFamily: "blackout",
    color: theme.colors.white,
    position: "absolute",
    top: 15,
    left: 35,
    fontSize: 18,
  },
  menuButton: {
    zIndex: 100,
    width: 100,
    height: 50,
  },
  settingsButton: {
    color: theme.colors.white,
    fontSize: 6,
  },
  settingsButtonContainer: {
    position: "absolute",
    top: 2,
    right: 35,
    padding: 15,
  },
});
