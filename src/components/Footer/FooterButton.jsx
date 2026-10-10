import React, { useContext, useState } from "react";
import { Text, StyleSheet, Pressable } from "react-native";
import { Store } from "../../../Store";

import { theme } from "../../utils/theme";
import { getFooterGeometry } from "../../utils/footerSelection.mjs";

export const FooterButton = ({ children, onPress }) => {
  const { dimensions, footerInsets: insets, globalState, setGlobalState } = useContext(Store);
  const isTablet = dimensions.width >= 1000 && dimensions.height >= 550;
  const { actionWidth, scale } = getFooterGeometry(dimensions, insets);
  const buttonStyle = [styles.button, isTablet && styles.tabletButton, { width: actionWidth }];
  const labelStyle = [styles.label, isTablet && styles.tabletLabel, { width: actionWidth, fontSize: (isTablet ? 32 : 23) * scale }];

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
      <Pressable android_disableSound accessibilityRole="button" hitSlop={FOOTER_ACTION_HIT_SLOP} onPress={handleUndo} style={buttonStyle}>
        <Text numberOfLines={1} adjustsFontSizeToFit style={labelStyle}>Undo</Text>
      </Pressable>
    );
  }

  return (
    <Pressable android_disableSound accessibilityRole="button" hitSlop={FOOTER_ACTION_HIT_SLOP} onPress={handlePress} style={buttonStyle}>
      <Text numberOfLines={1} adjustsFontSizeToFit style={labelStyle}>{children}</Text>
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
    flexShrink: 0,
  },
  label: {
    fontFamily: "blackout",
    fontSize: 23,
    color: theme.colors.lightBlue,
    textAlign: "center",
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
