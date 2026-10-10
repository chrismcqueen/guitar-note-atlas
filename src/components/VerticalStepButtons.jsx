import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { theme } from "../utils/theme";
import { withPressedOpacity } from "../utils/pressable";

// Use the tablet key selector's paired triangles wherever a value is stepped.
const VerticalStepButtons = ({ upLabel, downLabel, upHandlers, downHandlers, upDisabled = false, downDisabled = false, color = theme.colors.black }) => (
  <View style={styles.container}>
    <Pressable android_disableSound accessibilityRole="button" accessibilityLabel={upLabel} accessibilityState={{ disabled: upDisabled }} disabled={upDisabled} {...upHandlers} style={withPressedOpacity([styles.button, upDisabled && styles.disabled])}>
      <View style={[styles.arrow, styles.up, { borderBottomColor: color }]} />
    </Pressable>
    <Pressable android_disableSound accessibilityRole="button" accessibilityLabel={downLabel} accessibilityState={{ disabled: downDisabled }} disabled={downDisabled} {...downHandlers} style={withPressedOpacity([styles.button, downDisabled && styles.disabled])}>
      <View style={[styles.arrow, styles.down, { borderTopColor: color }]} />
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  container: { flexShrink: 0 },
  button: { alignItems: "center", paddingHorizontal: 8, paddingVertical: 3 },
  arrow: { borderLeftColor: "transparent", borderLeftWidth: 14, borderRightColor: "transparent", borderRightWidth: 14, height: 0, width: 0 },
  up: { borderBottomWidth: 24 },
  down: { borderTopWidth: 24 },
  disabled: { opacity: 0.45 },
});

export default VerticalStepButtons;
