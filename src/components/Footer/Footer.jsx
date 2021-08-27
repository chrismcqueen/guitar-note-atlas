import React, { useContext, useEffect } from "react";
import { Text, View, StyleSheet, Pressable } from "react-native";
import { Store } from "../../../Store";
import { theme } from "../../utils/theme";
import ScaleDegree from "./ScaleDegree";

const Footer = () => {
  const { globalState } = useContext(Store);
  // useEffect(() => console.log(globalState?.scale.degrees), []);
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Clear</Text>
      <View style={styles.scaleDegreeContainer}>
        <ScaleDegree scaleDegree={1} assignedNumber={0} />
        <ScaleDegree scaleDegree={2} assignedNumber={1} />
        <ScaleDegree scaleDegree={2} assignedNumber={2} />
        <ScaleDegree scaleDegree={3} assignedNumber={3} />
        <ScaleDegree scaleDegree={3} assignedNumber={4} />
        <ScaleDegree scaleDegree={4} assignedNumber={5} />
        <ScaleDegree scaleDegree={5} assignedNumber={6} />
        <ScaleDegree scaleDegree={5} assignedNumber={7} />
        <ScaleDegree scaleDegree={6} assignedNumber={8} />
        <ScaleDegree scaleDegree={6} assignedNumber={9} />
        <ScaleDegree scaleDegree={7} assignedNumber={10} />
        <ScaleDegree scaleDegree={7} assignedNumber={11} />
      </View>
      <Text style={styles.label}>All</Text>
    </View>
  );
};

export default Footer;

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    borderBottomColor: theme.colors.blue,
    borderBottomWidth: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 1000,
  },
  label: {
    fontFamily: "blackout",
    fontSize: 18,
    color: theme.colors.lightBlue,
    marginHorizontal: 35,
  },
  scaleDegreeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
