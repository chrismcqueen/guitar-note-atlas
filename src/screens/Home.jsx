import React from "react";
import { StyleSheet, View, Text } from "react-native";

import { theme } from "../utils/theme";

export const Home = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Guitar Note Atlas</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    flex: 1,
  },
  title: {
    fontFamily: "blackout",
    fontSize: 30,
    textAlign: "center",
  },
});
