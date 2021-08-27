import React, { useContext } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "../../utils/theme";
import { Store } from "../../../Store";

const ScaleDegree = ({ scaleDegree, assignedNumber }) => {
  const { globalState } = useContext(Store);

  const includeFlat = () => assignedNumber === 1 || assignedNumber === 3 || assignedNumber === 6 || assignedNumber === 8 || (assignedNumber === 10 && true);
  const includeSharp = () => assignedNumber === 3.1 || assignedNumber === 6.1 || (assignedNumber === 8.1 && true);

  return (
    <Pressable onPress={() => console.log(`press ${assignedNumber}`)}>
      <Text style={[styles.scaleDegree, globalState?.scale.degrees.includes(assignedNumber) && styles.scaleDegreeSelected]}>
        {includeFlat() && <Text style={styles.opus}>b</Text>}
        {includeSharp() && <Text style={styles.opus}>#</Text>}
        {scaleDegree}
      </Text>
    </Pressable>
  );
};

export default ScaleDegree;

const styles = StyleSheet.create({
  scaleDegree: {
    fontSize: 30,
    paddingHorizontal: 15,
    color: theme.colors.lightBlue,
    fontFamily: "basicManual",
  },
  opus: {
    fontFamily: "opus",
  },
  scaleDegreeSelected: {
    backgroundColor: theme.colors.blue,
    color: theme.colors.white,
  },
  scaleDegreeSmall: {
    fontSize: 15,
    color: theme.colors.lightBlue,
  },
});
