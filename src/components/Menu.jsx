import React, { useContext, useRef, useEffect } from "react";
import { StyleSheet, Text, View, Pressable, Animated } from "react-native";

import { data } from "../../data";
import { Store } from "../../Store";
import { storeGlobalState } from "../utils/functions";
import { theme } from "../utils/theme";

const Menu = () => {
  const { dimensions, showMenu, globalState, setGlobalState } = useContext(Store);
  const menuAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    showMenu
      ? Animated.timing(menuAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }).start()
      : Animated.timing(menuAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }).start();
  }, [showMenu]);

  const splitToColumns = (arr) => {
    const col1 = [];
    const col2 = [];
    arr.forEach((item, i) => {
      i < arr.length / 2 ? col1.push(item) : col2.push(item);
    });
    return new Array(col1, col2);
  };

  const headings = Object.keys(data.scales);
  const scales = splitToColumns(data.scales.scales);
  const arpeggios = splitToColumns(data.scales.arpeggios);
  const intervals = splitToColumns(data.scales.intervals);
  const majorModes = splitToColumns(data.scales.major);
  const melodicMinorModes = splitToColumns(data.scales["Melodic Minor"]);
  const harmonicMinorModes = splitToColumns(data.scales["Harmonic Minor"]);
  const harmonicMajorModes = splitToColumns(data.scales["Harmonic Major"]);
  const modesOf = <Text style={{ textTransform: "lowercase" }}>modes of </Text>;

  const handlePress = (item) => {
    setGlobalState({ ...globalState, scale: item });
    storeGlobalState({ ...globalState, scale: item });
  };

  return (
    <Animated.ScrollView
      style={[
        styles.menu,
        {
          height: dimensions.height - 110,
          width: dimensions.width,
          top: menuAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [38, -dimensions.height],
          }),
        },
      ]}
      stickyHeaderIndices={[0, 2, 4, 6, 8, 10, 12]}
    >
      {/* SCALES */}
      <View style={styles.menuHeaderWrapper}>
        <Text style={styles.menuHeader}>{headings[0]}</Text>
      </View>
      <View style={styles.menuColumnContainer}>
        <View style={styles.menuColumn}>
          {scales[0].map((scale, i) => (
            <Pressable key={i} onPress={() => handlePress(scale)}>
              <Text style={styles.menuItem}>{scale.menu_title}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.menuColumn}>
          {scales[1].map((scale, i) => (
            <Pressable key={i} onPress={() => handlePress(scale)}>
              <Text style={styles.menuItem}>{scale.menu_title}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      {/* ARPEGGIOS */}
      <View style={styles.menuHeaderWrapper}>
        <Text style={styles.menuHeader}>{headings[1]}</Text>
      </View>
      <View style={styles.menuColumnContainer}>
        <View style={styles.menuColumn}>
          {arpeggios[0].map((arp, i) => (
            <Pressable key={i} onPress={() => handlePress(arp)}>
              <Text style={styles.menuItem}>{arp.menu_title}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.menuColumn}>
          {arpeggios[1].map((arp, i) => (
            <Pressable key={i} onPress={() => handlePress(arp)}>
              <Text style={styles.menuItem}>{arp.menu_title}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      {/* INTERVALS */}
      <View style={styles.menuHeaderWrapper}>
        <Text style={styles.menuHeader}>{headings[2]}</Text>
      </View>
      <View style={styles.menuColumnContainer}>
        <View style={styles.menuColumn}>
          {intervals[0].map((int, i) => (
            <Pressable key={i} onPress={() => handlePress(int)}>
              <Text style={styles.menuItem}>{int.menu_title}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.menuColumn}>
          {intervals[1].map((int, i) => (
            <Pressable key={i} onPress={() => handlePress(int)}>
              <Text style={styles.menuItem}>{int.menu_title}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      {/* MODES OF MAJOR */}
      <View style={styles.menuHeaderWrapper}>
        <Text style={styles.menuHeader}>
          {modesOf}
          {headings[3]}
        </Text>
      </View>
      <View style={styles.menuColumnContainer}>
        <View style={styles.menuColumn}>
          {majorModes[0].map((mode, i) => (
            <Pressable key={i} onPress={() => handlePress(mode)}>
              <Text style={styles.menuItem}>{mode.menu_title}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.menuColumn}>
          {majorModes[1].map((mode, i) => (
            <Pressable key={i} onPress={() => handlePress(mode)}>
              <Text style={styles.menuItem}>{mode.menu_title}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      {/* MODES OF MELODIC MINOR */}
      <View style={styles.menuHeaderWrapper}>
        <Text style={styles.menuHeader}>
          {modesOf}
          {headings[4]}
        </Text>
      </View>
      <View style={styles.menuColumnContainer}>
        <View style={styles.menuColumn}>
          {melodicMinorModes[0].map((mode, i) => (
            <Pressable key={i} onPress={() => handlePress(mode)}>
              <Text style={styles.menuItem}>{mode.menu_title}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.menuColumn}>
          {melodicMinorModes[1].map((mode, i) => (
            <Pressable key={i} onPress={() => handlePress(mode)}>
              <Text style={styles.menuItem}>{mode.menu_title}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      {/* MODES OF HARMONIC MINOR */}
      <View style={styles.menuHeaderWrapper}>
        <Text style={styles.menuHeader}>
          {modesOf}
          {headings[5]}
        </Text>
      </View>
      <View style={styles.menuColumnContainer}>
        <View style={styles.menuColumn}>
          {harmonicMinorModes[0].map((mode, i) => (
            <Pressable key={i} onPress={() => handlePress(mode)}>
              <Text style={styles.menuItem}>{mode.menu_title}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.menuColumn}>
          {harmonicMinorModes[1].map((mode, i) => (
            <Pressable key={i} onPress={() => handlePress(mode)}>
              <Text style={styles.menuItem}>{mode.menu_title}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      {/* MODES OF HARMONIC MAJOR */}
      <View style={styles.menuHeaderWrapper}>
        <Text style={styles.menuHeader}>
          {modesOf}
          {headings[6]}
        </Text>
      </View>
      <View style={styles.menuColumnContainer}>
        <View style={styles.menuColumn}>
          {harmonicMajorModes[0].map((mode, i) => (
            <Pressable key={i} onPress={() => handlePress(mode)}>
              <Text style={styles.menuItem}>{mode.menu_title}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.menuColumn}>
          {harmonicMajorModes[1].map((mode, i) => (
            <Pressable key={i} onPress={() => handlePress(mode)}>
              <Text style={styles.menuItem}>{mode.menu_title}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Animated.ScrollView>
  );
};

export default Menu;

const styles = StyleSheet.create({
  menu: {
    backgroundColor: theme.colors.blue,
    position: "absolute",
  },
  menuHeader: {
    textAlign: "center",
    textTransform: "uppercase",
    fontSize: 18,
  },
  menuHeaderWrapper: {
    backgroundColor: theme.colors.lightBlue,
    paddingTop: 4,
    paddingBottom: 6,
  },
  menuItem: {
    color: "white",
    textAlign: "center",
    paddingVertical: 4,
    fontSize: 18,
  },
  menuColumnContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  menuColumn: {
    width: 350,
  },
});
