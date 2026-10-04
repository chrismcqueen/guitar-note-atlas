import React, { useContext, useState } from "react";
import { Text, StyleSheet, Pressable } from "react-native";
import { Store } from "../../../Store";

import { theme } from "../../utils/theme";
import { withPressedOpacity } from "../../utils/pressable";

export const FooterButton = ({ children, onPress }) => {
  const { dimensions, globalState, setGlobalState } = useContext(Store);
  const isTablet = dimensions.width >= 1000 && dimensions.height >= 550;

  const [prevScale, setPrevScale] = useState();
  const [undo, setUndo] = useState(false);

  const handlePress = () => {
    setPrevScale(globalState.scale);
    onPress();
    setUndo(true);
  };

  const handleUndo = () => {
    setGlobalState({
      ...globalState,
      scale: prevScale,
    });
    setUndo(false);
  };

  if (undo) {
    return (
      <Pressable accessibilityRole="button" hitSlop={FOOTER_ACTION_HIT_SLOP} onPress={handleUndo} style={withPressedOpacity([styles.button, isTablet && styles.tabletButton])}>
        <Text style={[styles.label, isTablet && styles.tabletLabel]}>Undo</Text>
      </Pressable>
    );
  }

  return (
    <Pressable accessibilityRole="button" hitSlop={FOOTER_ACTION_HIT_SLOP} onPress={handlePress} style={withPressedOpacity([styles.button, isTablet && styles.tabletButton])}>
      <Text style={[styles.label, isTablet && styles.tabletLabel]}>{children}</Text>
    </Pressable>
  );
};

const FOOTER_ACTION_HIT_SLOP = { top: 6, bottom: 6, left: 0, right: 0 };

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    height: 45,
    justifyContent: "center",
    width: 100,
  },
  label: {
    fontFamily: "blackout",
    fontSize: 23,
    color: theme.colors.lightBlue,
    textAlign: "center",
    transform: [{ translateY: 4 }],
    width: 100,
  },
  tabletButton: {
    height: 79,
    width: 140,
  },
  tabletLabel: {
    fontSize: 32,
    width: 140,
  },
});
