import React, { useContext, useEffect, useRef } from "react";
import { StyleSheet, Text, View, Animated, Pressable } from "react-native";
import * as Linking from "expo-linking";

import { Store } from "../../Store";
import { theme } from "../utils/theme";
import { storeGlobalState } from "../utils/functions";

const Options = () => {
  const { dimensions, showOptions, globalState, setGlobalState } = useContext(Store);
  const optionsAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    showOptions
      ? Animated.timing(optionsAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }).start()
      : Animated.timing(optionsAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: false,
        }).start();
  }, [showOptions]);

  const width = dimensions.width / 3;

  const options = ["View Tutorial", "Show Scale Degrees", "Enable Bass Mode", "Enable Left Hand", "Flip Upside Down", "Hide Anchor Frets", "Rate Us", "Give Us Feedback"];

  const updateOption = (name) => {
    const nextState = {
      ...globalState,
      options: { ...globalState.options, [name]: !globalState.options[name] },
    };
    setGlobalState(nextState);
    storeGlobalState(nextState);
  };

  const isSelected = (option) => {
    switch (option) {
      case "Show Scale Degrees":
        return globalState.options.showScaleDegree;
      case "Enable Bass Mode":
        return globalState.options.bassMode;
      case "Enable Left Hand":
        return globalState.options.leftHand;
      case "Flip Upside Down":
        return globalState.options.upsideDown;
      case "Hide Anchor Frets":
        return globalState.options.hideAnchorFrets;
      default:
        return false;
    }
  };

  const handlePress = (option) => {
    switch (option) {
      case "Show Scale Degrees":
        updateOption("showScaleDegree");
        break;
      case "Enable Bass Mode":
        updateOption("bassMode");
        break;
      case "Enable Left Hand":
        updateOption("leftHand");
        break;
      case "Flip Upside Down":
        updateOption("upsideDown");
        break;
      case "Hide Anchor Frets":
        updateOption("hideAnchorFrets");
        break;
      case "Rate Us":
        Linking.openURL("https://apps.apple.com/us/app/guitar-note-atlas/id971847390");
        // TODO: android/google play url
        break;
      case "Give Us Feedback":
        Linking.openURL("mailto:guitarnoteatlas@gmail.com?subject=Feedback!");
    }
  };

  return (
    <Animated.View
      style={[
        styles.options,
        {
          width: width,
          height: dimensions.height,
          right: optionsAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -width],
          }),
        },
      ]}
    >
      {options.map((option, i) => (
        <Pressable key={i} onPress={() => handlePress(option)}>
          <View style={styles.itemRow}>
            <Text style={styles.item}>{option}</Text>
            {isSelected(option) && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </Pressable>
      ))}
    </Animated.View>
  );
};

export default Options;

const styles = StyleSheet.create({
  options: {
    position: "absolute",
    top: 0,
    zIndex: 2001,
    backgroundColor: theme.colors.blue,
  },
  item: {
    color: "white",
    fontFamily: "proletarsk",
    flex: 1,
  },
  itemRow: {
    alignItems: "center",
    flexDirection: "row",
    margin: 5,
    padding: 8,
  },
  checkmark: {
    color: theme.colors.white,
    fontSize: 18,
  },
});
