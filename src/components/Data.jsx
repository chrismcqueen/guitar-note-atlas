import React, { useContext } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Store } from "../../Store";

const Data = () => {
  const { globalState } = useContext(Store);

  const getOffset = (offset) => {
    const frets = []
    globalState?.scale.degrees.forEach((degree) => {
      let fret = Math.floor(degree) + offset
      fret = fret > 11 ? fret - 12 : fret;
      frets.push(fret)
    })
    // return frets.sort((a, b) => a - b)
    return frets
  }

  return (
    <View style={{ alignItems: "center" }}>
      {/* <Text style={styles.text}>title: {globalState?.key.title}</Text> */}
      <Text style={styles.text}>key offset: {globalState?.key.key_offset}</Text>
      {/* title: "Major Scale", //blackout top long_title: "Major Scale", //ipad or bigger phones for top blackout menu_title: "Major Scale", //menu degrees: [0, 2, 4, 5, 7, 9, 11], */}
      {/* <Text style={styles.text}>title: {globalState?.scale.title}</Text> */}
      {/* <Text style={styles.text}>long title: {globalState?.scale.long_title}</Text> */}
      {/* <Text style={styles.text}>menu title: {globalState?.scale.menu_title}</Text> */}
      <Text style={styles.text}>degrees: {globalState?.scale.degrees}</Text>
      <Text style={styles.text}>E: {getOffset(4)}</Text>
      <Text style={styles.text}>B: {getOffset(11)}</Text>
      <Text style={styles.text}>G: {getOffset(7)}</Text>
      <Text style={styles.text}>D: {getOffset(2)}</Text>
      <Text style={styles.text}>A: {getOffset(9)}</Text>
      <Text style={styles.text}>E: {getOffset(4)}</Text>
    </View>
  );
};

export default Data;

const styles = StyleSheet.create({
  text: {
    fontSize: 20,
  },
});
