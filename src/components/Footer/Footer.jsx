import React, { useContext } from "react";
import { View, StyleSheet } from "react-native";

import { Store } from "../../../Store";
import { FooterButton, ScaleDegreeButton, useFooter } from ".";
import { theme } from "../../utils/theme";

export const Footer = () => {
  const { globalState } = useContext(Store);
  const { degrees, handleClear, handleAll } = useFooter();

  return (
    <View style={styles.container}>
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
    borderBottomWidth: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    transform: [{ translateY: 4 }],
  },
  scaleDegreeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
});
