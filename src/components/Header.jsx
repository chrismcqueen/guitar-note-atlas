import React, { useContext, useEffect, useRef } from "react";
import { Animated, Text, View, StyleSheet, Pressable } from "react-native";

import { Store } from "../../Store";
import { theme } from "../utils/theme";


const Header = () => {
  const { globalState, showMenu, setShowMenu, showOptions, setShowOptions } = useContext(Store);
  const overlay = () => showOptions && setShowOptions(false);
  const fullScreen = { height: "100%", width: "100%" };

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    showOptions 
    ? Animated.timing(
      fadeAnim,
      {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }
    ).start()
    : Animated.timing(
      fadeAnim,
      {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }
    ).start()
  }, [fadeAnim, showOptions])

  return (
    <View style={styles.container}>
      <Pressable style={fullScreen} onPress={overlay}>
        <Pressable style={styles.menuButton} onPress={() => setShowMenu(!showMenu)}>
          <Text style={styles.menu}>Menu</Text>
        </Pressable>
        <Text style={styles.heading}>{globalState?.scale.title}</Text>
        <Pressable style={styles.settingsButtonContainer} onPress={() => !showMenu && setShowOptions(!showOptions)}>
          <Text style={[styles.settingsButton, showMenu && styles.disableOptions]}>● ● ●</Text>
        </Pressable>
        {showOptions && <Animated.View style={[styles.overlay, {opacity: fadeAnim}]} />}
      </Pressable>
    </View>
  );
};

export default Header;

export const headerHeight = 38;

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.blue,
    height: headerHeight,
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
    left: 0,
    right: 0,
    top: -4,
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
  overlay: {
    backgroundColor: theme.colors.overlay,
    zIndex: 2000,
    position: "absolute",
    width: '100%',
    height: headerHeight + 20,
  },
  settingsButton: {
    color: theme.colors.white,
    fontSize: 6,
    paddingHorizontal: 40,
    paddingVertical: 30,
    marginHorizontal: -40,
    marginVertical: -30,
  },
  settingsButtonContainer: {
    position: "absolute",
    top: 2,
    right: 35,
    padding: 15,
  },
});
