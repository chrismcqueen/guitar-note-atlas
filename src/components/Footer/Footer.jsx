import React, { useContext } from "react";
import { View, StyleSheet } from "react-native";

import { Store } from "../../../Store";
import { FooterButton } from "./FooterButton";
import { ScaleDegreeButton } from "./ScaleDegreeButton";
import { useFooter } from "./useFooter";
import { theme } from "../../utils/theme";

export const Footer = () => {
  const { dimensions, globalState, insets } = useContext(Store);
  const { degrees, handleClear, handleAll } = useFooter();
  const isTablet = dimensions.width >= 1000 && dimensions.height >= 550;

  return (
    <View
      style={[
        styles.container,
        isTablet && styles.tabletContainer,
        { paddingLeft: insets.left, paddingRight: insets.right },
      ]}
    >
      <FooterButton onPress={handleClear}>Clear</FooterButton>
      <View style={styles.scaleDegreeContainer}>
        {degrees.map((d, i) => {
          const selected = globalState.scale.degrees.includes(d.d);
          const altSelected = globalState.scale.degrees.includes(d.e);
          return <ScaleDegreeButton key={i} d={d.d} e={d.e} selected={selected} altSelected={altSelected} />;
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
