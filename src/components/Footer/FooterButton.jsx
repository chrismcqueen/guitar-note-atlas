import React, { useContext, useEffect, useRef, useState } from "react";
import { Text, StyleSheet, Pressable } from "react-native";
import { Store } from "../../../Store";

import { theme } from "../../utils/theme";

export const FooterButton = ({ children, onPress }) => {
  const { globalState, setGlobalState } = useContext(Store);

  const [prevScale, setPrevScale] = useState();
  const [undo, setUndo] = useState(false);

  // const isMounted = useRef(false);

  // useEffect(() => {
  //   if (isMounted.current && undo) {
  //     setUndo(false);
  //   } else {
  //     isMounted.current = true;
  //   }
  // }, [globalState.scale]);

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
      <Pressable onPress={handleUndo}>
        <Text style={styles.label}>Undo</Text>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={handlePress}>
      <Text style={styles.label}>{children}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  label: {
    fontFamily: "blackout",
    fontSize: 25,
    color: theme.colors.lightBlue,
    transform: [{ translateY: 8 }],
    width: 75,
  },
});
