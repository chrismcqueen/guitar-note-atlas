import React, { useContext, useRef } from "react";
import { View, StyleSheet } from "react-native";

import { Store } from "../../../Store";
import { FooterButton } from "./FooterButton";
import { ScaleDegreeButton } from "./ScaleDegreeButton";
import { useFooter } from "./useFooter";
import { theme } from "../../utils/theme";
import { footerDegreeIndexAtX, isDegreeChoiceSelected, paintDegreeChoices } from "../../utils/footerSelection.mjs";

export const Footer = () => {
  const { dimensions, globalState, insets, setGlobalState } = useContext(Store);
  const { degrees, getMatchingScale, handleClear, handleAll } = useFooter();
  const isTablet = dimensions.width >= 1000 && dimensions.height >= 550;
  const degreeRowWidth = useRef(0);
  const dragStartIndex = useRef(0);
  const dragSelects = useRef(true);
  const visitedIndices = useRef(new Set());

  const indexAtX = (x) => footerDegreeIndexAtX(x, degreeRowWidth.current, degrees.length);

  const paintThroughIndex = (index) => {
    const visited = [...visitedIndices.current];
    const lastIndex = visited.length ? visited[visited.length - 1] : dragStartIndex.current;
    const start = Math.min(lastIndex, index);
    const end = Math.max(lastIndex, index);
    const indices = [];

    for (let candidate = start; candidate <= end; candidate += 1) {
      if (!visitedIndices.current.has(candidate)) {
        visitedIndices.current.add(candidate);
        indices.push(candidate);
      }
    }

    if (!indices.length) return;

    setGlobalState((currentState) => {
      const nextDegrees = paintDegreeChoices(currentState.scale.degrees, degrees, indices, dragSelects.current);
      const matchingScale = getMatchingScale(nextDegrees);
      const scale = matchingScale
        ? { ...matchingScale, degrees: nextDegrees }
        : { title: "", long_title: "", menu_title: "", degrees: nextDegrees };
      return { ...currentState, scale };
    });
  };

  const finishDrag = () => {
    visitedIndices.current = new Set();
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
        onMoveShouldSetResponderCapture={() => true}
        onResponderGrant={(event) => {
          visitedIndices.current = new Set();
          dragSelects.current = !isDegreeChoiceSelected(globalState.scale.degrees, degrees[dragStartIndex.current]);
          paintThroughIndex(indexAtX(event.nativeEvent.locationX));
        }}
        onResponderMove={(event) => paintThroughIndex(indexAtX(event.nativeEvent.locationX))}
        onResponderRelease={finishDrag}
        onResponderTerminate={finishDrag}
        style={styles.scaleDegreeContainer}
      >
        {degrees.map((d, i) => {
          const selected = globalState.scale.degrees.includes(d.d);
          const altSelected = globalState.scale.degrees.includes(d.e);
          return <ScaleDegreeButton key={i} d={d.d} e={d.e} selected={selected} altSelected={altSelected} onTouchStart={() => { dragStartIndex.current = i; }} />;
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
