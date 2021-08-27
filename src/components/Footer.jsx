import React from "react";
import { Text, View, StyleSheet, TouchableWithoutFeedback } from "react-native";

import { theme } from "../utils/theme";

const Footer = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Clear</Text>
      <View style={styles.scaleDegreeContainer}>
        <TouchableWithoutFeedback>
          <Text style={[styles.scaleDegree, styles.scaleDegreeSelected]}>1</Text>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback>
          <Text style={styles.scaleDegree}>b2</Text>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback>
          <Text style={[styles.scaleDegree, styles.scaleDegreeSelected]}>2</Text>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback>
          <Text style={styles.scaleDegree}>b3</Text>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback>
          <Text style={[styles.scaleDegree, styles.scaleDegreeSelected]}>3</Text>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback>
          <Text style={[styles.scaleDegree, styles.scaleDegreeSelected]}>4</Text>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback>
          <View>
            <Text style={styles.scaleDegreeSmall}>#4</Text>
            <Text style={styles.scaleDegreeSmall}>b5</Text>
          </View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback>
          <Text style={[styles.scaleDegree, styles.scaleDegreeSelected]}>5</Text>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback>
          <Text style={styles.scaleDegree}>b6</Text>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback>
          <Text style={[styles.scaleDegree, styles.scaleDegreeSelected]}>6</Text>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback>
          <Text style={styles.scaleDegree}>b7</Text>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback>
          <Text style={[styles.scaleDegree, styles.scaleDegreeSelected]}>7</Text>
        </TouchableWithoutFeedback>
      </View>
      <Text style={styles.label}>All</Text>
    </View>
  );
};

export default Footer;

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    // paddingBottom: 10,
    borderBottomColor: theme.colors.blue,
    borderBottomWidth: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  scaleDegree: {
    fontSize: 30,
    paddingHorizontal: 15,
    color: theme.colors.lightBlue,
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
