import React, { useContext, useRef } from "react";
import { View, StyleSheet } from "react-native";

import { Store } from "../../../Store";
import { FooterButton } from "./FooterButton";
import { ScaleDegreeButton } from "./ScaleDegreeButton";
import { useFooter } from "./useFooter";
import { theme } from "../../utils/theme";
import { footerDegreeIndexFromGestureX, toggleDegreeRange } from "../../utils/footerSelection.mjs";

export const Footer = () => {
  const { dimensions, globalState, insets, setGlobalState } = useContext(Store);
  const { degrees, getMatchingScale, handleClear, handleAll } = useFooter();
  const isTablet = dimensions.width >= 1000 && dimensions.height >= 550;
  const degreeRowWidth = useRef(0);
  const dragInitialDegrees = useRef([]);
  const dragStartIndex = useRef(0);
  const dragCurrentIndex = useRef(null);

  const indexAtGestureX = (x) => footerDegreeIndexFromGestureX(
    x,
    degreeRowWidth.current,
    degrees.length,
    dragStartIndex.current,
  );

  const paintThroughIndex = (index) => {
    if (index === dragCurrentIndex.current) return;
    dragCurrentIndex.current = index;

    setGlobalState((currentState) => {
      const nextDegrees = toggleDegreeRange(
        dragInitialDegrees.current,
        degrees,
        dragStartIndex.current,
        index,
      );
      const matchingScale = getMatchingScale(nextDegrees);
      const scale = matchingScale
        ? { ...matchingScale, degrees: nextDegrees }
        : { title: "", long_title: "", menu_title: "", degrees: nextDegrees };
      return { ...currentState, scale };
    });
  };

  const finishDrag = () => {
    dragCurrentIndex.current = null;
    dragInitialDegrees.current = [];
  };

  return (
    <View
      style={[
        styles.container,
        isTablet && styles.tabletContainer,
        { paddingLeft: insets.left, paddingRight: insets.right },
      ]}
    >
      <FooterButton onPress={handleClear}>Clear</FooterButton>
      <View
        onLayout={(event) => {
          degreeRowWidth.current = event.nativeEvent.layout.width;
        }}
        onMoveShouldSetResponderCapture={(_, gestureState) => (
          Math.abs(gestureState.dx) > 4
          && Math.abs(gestureState.dx) > Math.abs(gestureState.dy)
        )}
        onResponderGrant={(event) => {
          dragCurrentIndex.current = null;
          paintThroughIndex(indexAtGestureX(event.nativeEvent.locationX));
        }}
        onResponderMove={(event) => paintThroughIndex(indexAtGestureX(event.nativeEvent.locationX))}
        onResponderRelease={finishDrag}
        onResponderTerminate={finishDrag}
        style={styles.scaleDegreeContainer}
      >
        {degrees.map((d, i) => {
          const selected = globalState.scale.degrees.includes(d.d);
          const altSelected = globalState.scale.degrees.includes(d.e);
          return (
            <ScaleDegreeButton
              key={i}
              d={d.d}
              e={d.e}
              selected={selected}
              altSelected={altSelected}
              onTouchStart={() => {
                dragStartIndex.current = i;
                dragInitialDegrees.current = [...globalState.scale.degrees];
              }}
            />
          );
        })}
      </View>
      <FooterButton onPress={handleAll}>All</FooterButton>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    borderBottomColor: theme.colors.blue,
    borderBottomWidth: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    minHeight: 49,
  },
  scaleDegreeContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  tabletContainer: {
    minHeight: 83,
  },
});
