import { Text, StyleSheet } from "react-native";

export const Accidental = ({ children }) => {
  return <Text style={styles.accidental}>{children}</Text>;
};

const styles = StyleSheet.create({
  accidental: {
    fontFamily: "opus",
  },
});
