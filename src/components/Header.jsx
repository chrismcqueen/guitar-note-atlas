import React, { useContext } from "react";
import { Text, View, StyleSheet } from "react-native";

import { Store } from "../../Store";
import { theme } from "../utils/theme";

const Header = () => {
  const { scale } = useContext(Store);

  return (
    <View style={styles.container}>
      <Text style={styles.menu}>Menu</Text>
      <Text style={styles.heading}>{scale}</Text>
      <Text style={styles.settings}>● ● ●</Text>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.blue,
    zIndex: 1000,
  },
  heading: {
    fontFamily: "blackout",
    color: theme.colors.white,
    textAlign: "center",
    fontSize: 52,
  },
  menu: {
    fontFamily: "blackout",
    color: theme.colors.white,
    position: "absolute",
    top: 13,
    left: 35,
    fontSize: 18,
  },
  settings: {
    position: "absolute",
    color: theme.colors.white,
    fontSize: 6,
    top: 13,
    right: 35,
  },
});
